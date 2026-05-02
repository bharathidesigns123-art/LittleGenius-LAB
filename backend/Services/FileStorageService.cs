using System.Collections.Concurrent;
using System.Globalization;
using System.Text.RegularExpressions;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Azure.Storage;
using LittleGeniusLab.Api.Configuration;
using Microsoft.Extensions.Options;

namespace LittleGeniusLab.Api.Services;

/// <summary>
/// Production-oriented blob storage: unique blob keys, server upload, read-only SAS for delivery.
/// </summary>
public sealed class FileStorageService : IFileStorageService
{
    private static readonly ConcurrentDictionary<string, Lazy<Task>> CorsSetupTasks = new();

    private readonly AzureBlobOptions _options;
    private readonly IConfiguration _configuration;
    private readonly string? _connectionString;

    public FileStorageService(IOptions<AzureBlobOptions> options, IConfiguration configuration)
    {
        _options = options.Value;
        _configuration = configuration;
        _connectionString =
            Environment.GetEnvironmentVariable("AzureBlob__ConnectionString") ??
            Environment.GetEnvironmentVariable("Azure__Blob__ConnectionString") ??
            (configuration["AzureBlob:ConnectionString"]?.StartsWith("${", StringComparison.Ordinal) == true
                ? null
                : configuration["AzureBlob:ConnectionString"]);
    }

    private string ContainerName => string.IsNullOrWhiteSpace(_options.ContainerName) ? "uploads" : _options.ContainerName;

    private int ReadSasExpiryDays => _options.ReadSasExpiryDays > 0 ? _options.ReadSasExpiryDays : 7;

    /// <inheritdoc />
    public async Task<string> UploadAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(file);

        if (file.Length == 0)
        {
            throw new ArgumentException("File is empty.", nameof(file));
        }

        if (string.IsNullOrWhiteSpace(file.FileName))
        {
            throw new ArgumentException("File name is required.", nameof(file));
        }

        EnsureConfigured();

        var blobName = BuildUniqueBlobName(file.FileName);
        ValidateBlobPath(blobName);

        var containerClient = new BlobContainerClient(_connectionString, ContainerName);
        await containerClient.CreateIfNotExistsAsync(
            _options.ContainerPublic ? PublicAccessType.Blob : PublicAccessType.None,
            cancellationToken: cancellationToken).ConfigureAwait(false);

        await EnsureBlobCorsAsync(cancellationToken).ConfigureAwait(false);

        var blobClient = containerClient.GetBlobClient(blobName);
        var headers = new BlobHttpHeaders
        {
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType
        };

        await using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = headers }, cancellationToken)
            .ConfigureAwait(false);

        return blobName;
    }

    /// <inheritdoc />
    public string GetFileUrl(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new ArgumentException("Blob path is required.", nameof(fileName));
        }

        var normalized = NormalizeStoredPath(fileName);
        ValidateBlobPath(normalized);

        EnsureConfigured();

        var credential = GetSharedKeyCredential()
            ?? throw new InvalidOperationException("Storage account key is required to generate SAS URLs.");

        var containerClient = new BlobContainerClient(_connectionString, ContainerName);
        var blobClient = containerClient.GetBlobClient(normalized);

        var now = DateTimeOffset.UtcNow;
        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = ContainerName,
            BlobName = normalized,
            Resource = "b",
            StartsOn = now.AddMinutes(-5),
            ExpiresOn = now.AddDays(ReadSasExpiryDays)
        };
        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        var sas = sasBuilder.ToSasQueryParameters(credential).ToString();
        return $"{blobClient.Uri}?{sas}";
    }

    /// <inheritdoc />
    public async Task<BlobSasResult> GetUploadSasAsync(string fileName, string? contentType, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new ArgumentException("File name is required.", nameof(fileName));
        }

        EnsureConfigured();

        var credential = GetSharedKeyCredential()
            ?? throw new InvalidOperationException("Storage account key missing - cannot create SAS.");

        var containerClient = new BlobContainerClient(_connectionString, ContainerName);
        await containerClient.CreateIfNotExistsAsync(
            _options.ContainerPublic ? PublicAccessType.Blob : PublicAccessType.None,
            cancellationToken: cancellationToken).ConfigureAwait(false);

        await EnsureBlobCorsAsync(cancellationToken).ConfigureAwait(false);

        var blobClient = containerClient.GetBlobClient(fileName.Trim());
        var now = DateTimeOffset.UtcNow;

        var writeSasBuilder = new BlobSasBuilder
        {
            BlobContainerName = ContainerName,
            BlobName = blobClient.Name,
            Resource = "b",
            StartsOn = now.AddMinutes(-5),
            ExpiresOn = now.AddMinutes(60)
        };
        writeSasBuilder.SetPermissions(BlobSasPermissions.Write | BlobSasPermissions.Create);
        if (!string.IsNullOrWhiteSpace(contentType))
        {
            writeSasBuilder.ContentType = contentType;
        }

        var uploadSas = writeSasBuilder.ToSasQueryParameters(credential).ToString();
        var uploadUrl = $"{blobClient.Uri}?{uploadSas}";

        var readHours = _options.SasExpiryHours > 0 ? _options.SasExpiryHours : 24;
        var readSasBuilder = new BlobSasBuilder
        {
            BlobContainerName = ContainerName,
            BlobName = blobClient.Name,
            Resource = "b",
            StartsOn = now.AddMinutes(-5),
            ExpiresOn = now.AddHours(readHours)
        };
        readSasBuilder.SetPermissions(BlobSasPermissions.Read);

        var readSas = readSasBuilder.ToSasQueryParameters(credential).ToString();
        var readUrl = $"{blobClient.Uri}?{readSas}";

        return new BlobSasResult(uploadUrl, readUrl, blobClient.Uri.ToString());
    }

    private void EnsureConfigured()
    {
        if (string.IsNullOrWhiteSpace(_connectionString))
        {
            throw new InvalidOperationException("Azure Blob Storage is not configured (missing connection string).");
        }
    }

    private static string BuildUniqueBlobName(string originalFileName)
    {
        var ext = Path.GetExtension(originalFileName);
        if (!string.IsNullOrEmpty(ext))
        {
            ext = ext.ToLowerInvariant();
            if (ext.Length > 32)
            {
                ext = ext[..32];
            }

            if (!SafeExtensionRegex.IsMatch(ext))
            {
                ext = string.Empty;
            }
        }

        var stamp = DateTime.UtcNow.ToString("yyyy/MM", CultureInfo.InvariantCulture);
        var id = Guid.NewGuid().ToString("N");
        return string.IsNullOrEmpty(ext) ? $"{stamp}/{id}" : $"{stamp}/{id}{ext}";
    }

    private static string NormalizeStoredPath(string fileName) =>
        fileName.Trim().TrimStart('/').Replace('\\', '/');

    /// <summary>Blocks path traversal and reserved characters unsafe for blob keys.</summary>
    private static void ValidateBlobPath(string path)
    {
        if (path.Contains("..", StringComparison.Ordinal) || path.StartsWith("//", StringComparison.Ordinal))
        {
            throw new ArgumentException("Invalid blob path.", nameof(path));
        }

        if (!BlobPathRegex.IsMatch(path))
        {
            throw new ArgumentException("Blob path contains invalid characters.", nameof(path));
        }
    }

    /// <summary>Blob paths we generate: yyyy/MM/guid.ext (safe subset).</summary>
    private const string BlobPathPattern = @"^[a-zA-Z0-9][a-zA-Z0-9!-_.*'()/]{0,1023}$";

    private static readonly Regex BlobPathRegex = new(BlobPathPattern, RegexOptions.CultureInvariant, TimeSpan.FromMilliseconds(250));

    private static readonly Regex SafeExtensionRegex = new(@"^\.[a-z0-9]{1,16}$", RegexOptions.CultureInvariant, TimeSpan.FromMilliseconds(250));

    private async Task EnsureBlobCorsAsync(CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_connectionString))
        {
            return;
        }

        var corsOrigins = BuildCorsOrigins();
        if (corsOrigins.Length == 0)
        {
            return;
        }

        var setupTask = CorsSetupTasks.GetOrAdd(
            _connectionString,
            _ => new Lazy<Task>(() => ConfigureBlobCorsAsync(cancellationToken)));

        await setupTask.Value.ConfigureAwait(false);
    }

    private async Task ConfigureBlobCorsAsync(CancellationToken cancellationToken)
    {
        var serviceClient = new BlobServiceClient(_connectionString);
        var properties = await serviceClient.GetPropertiesAsync(cancellationToken).ConfigureAwait(false);

        var allowedOrigins = string.Join(",", BuildCorsOrigins());
        var existingRule = properties.Value.Cors.FirstOrDefault(rule =>
            string.Equals(rule.AllowedOrigins, allowedOrigins, StringComparison.OrdinalIgnoreCase) &&
            rule.AllowedMethods.Contains("PUT", StringComparison.OrdinalIgnoreCase));

        if (existingRule is not null)
        {
            return;
        }

        properties.Value.Cors.Add(new BlobCorsRule
        {
            AllowedOrigins = allowedOrigins,
            AllowedMethods = "OPTIONS,PUT,GET,HEAD",
            AllowedHeaders = "content-type,x-ms-blob-type,x-ms-blob-content-type,x-ms-version,x-ms-date",
            ExposedHeaders = "etag,x-ms-request-id,x-ms-version,x-ms-request-server-encrypted",
            MaxAgeInSeconds = 3600
        });

        await serviceClient.SetPropertiesAsync(properties.Value, cancellationToken).ConfigureAwait(false);
    }

    private string[] BuildCorsOrigins()
    {
        var origins = new List<string>
        {
            "https://little-genius-lab.vercel.app",
            "https://littlegeniuslab.in",
            "https://www.littlegeniuslab.in",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        };

        var frontendUrl = _configuration["FRONTEND_URL"];
        if (!string.IsNullOrWhiteSpace(frontendUrl))
        {
            origins.Add(frontendUrl);
        }

        var configuredOrigins = _options.CorsAllowedOrigins ?? _configuration["AzureBlob:CorsAllowedOrigins"];
        if (!string.IsNullOrWhiteSpace(configuredOrigins))
        {
            origins.AddRange(configuredOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
        }

        return origins
            .Where(origin => Uri.TryCreate(origin, UriKind.Absolute, out _))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private StorageSharedKeyCredential? GetSharedKeyCredential()
    {
        if (string.IsNullOrWhiteSpace(_connectionString))
        {
            return null;
        }

        string? accountName = null, accountKey = null;
        var parts = _connectionString.Split(';', StringSplitOptions.RemoveEmptyEntries);
        foreach (var p in parts)
        {
            var kv = p.Split('=', 2);
            if (kv.Length != 2)
            {
                continue;
            }

            if (kv[0].Equals("AccountName", StringComparison.OrdinalIgnoreCase))
            {
                accountName = kv[1];
            }

            if (kv[0].Equals("AccountKey", StringComparison.OrdinalIgnoreCase))
            {
                accountKey = kv[1];
            }
        }

        if (string.IsNullOrWhiteSpace(accountName) || string.IsNullOrWhiteSpace(accountKey))
        {
            return null;
        }

        return new StorageSharedKeyCredential(accountName, accountKey);
    }
}

public sealed record BlobSasResult(string UploadUrl, string ReadUrl, string BlobUrl);
