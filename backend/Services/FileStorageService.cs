using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Azure.Storage;
using System.Collections.Concurrent;
using System.IO;

namespace LittleGeniusLab.Api.Services;

public sealed class FileStorageService(IConfiguration configuration)
{
    private static readonly ConcurrentDictionary<string, Lazy<Task>> CorsSetupTasks = new();
    private readonly string? _azureConnectionString = 
        Environment.GetEnvironmentVariable("AzureBlob__ConnectionString") ?? 
        Environment.GetEnvironmentVariable("Azure__Blob__ConnectionString") ??
        (configuration["AzureBlob:ConnectionString"]?.StartsWith("${") == true ? null : configuration["AzureBlob:ConnectionString"]);
    private readonly string _azureContainerName = configuration["AzureBlob:ContainerName"] ?? "uploads";
    private readonly bool _azureContainerPublic = bool.TryParse(configuration["AzureBlob:ContainerPublic"], out var cp) ? cp : false;
    private readonly int _sasExpiryHours = int.TryParse(configuration["AzureBlob:SasExpiryHours"], out var h) ? h : 24;
    private readonly string[] _azureCorsOrigins = BuildCorsOrigins(configuration);

    public async Task<BlobSasResult> GetUploadSasAsync(string fileName, string? contentType)
    {
        if (string.IsNullOrWhiteSpace(_azureConnectionString))
            throw new InvalidOperationException("Azure Blob Storage is not configured.");

        var credential = GetSharedKeyCredential()
            ?? throw new InvalidOperationException("Storage account key missing - cannot create SAS.");

        var containerClient = new BlobContainerClient(_azureConnectionString, _azureContainerName);
        await containerClient.CreateIfNotExistsAsync(_azureContainerPublic ? PublicAccessType.Blob : PublicAccessType.None);
        await EnsureBlobCorsAsync();
        var blobClient = containerClient.GetBlobClient(fileName);

        var now = DateTimeOffset.UtcNow;

        // Write SAS (for upload)
        var writeSasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _azureContainerName,
            BlobName = fileName,
            Resource = "b",
            StartsOn = now.AddMinutes(-5), // Buffer for time skew
            ExpiresOn = now.AddMinutes(60)
        };
        writeSasBuilder.SetPermissions(BlobSasPermissions.Write | BlobSasPermissions.Create);
        if (!string.IsNullOrWhiteSpace(contentType))
        {
            writeSasBuilder.ContentType = contentType;
        }

        var uploadSas = writeSasBuilder.ToSasQueryParameters(credential).ToString();
        var uploadUrl = $"{blobClient.Uri}?{uploadSas}";

        // Read SAS (for preview)
        var readSasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _azureContainerName,
            BlobName = fileName,
            Resource = "b",
            StartsOn = now.AddMinutes(-5),
            ExpiresOn = now.AddHours(_sasExpiryHours)
        };
        readSasBuilder.SetPermissions(BlobSasPermissions.Read);

        var readSas = readSasBuilder.ToSasQueryParameters(credential).ToString();
        var readUrl = $"{blobClient.Uri}?{readSas}";

        return new BlobSasResult(uploadUrl, readUrl, blobClient.Uri.ToString());
    }

    private async Task EnsureBlobCorsAsync()
    {
        if (string.IsNullOrWhiteSpace(_azureConnectionString) || _azureCorsOrigins.Length == 0)
        {
            return;
        }

        var setupTask = CorsSetupTasks.GetOrAdd(
            _azureConnectionString,
            _ => new Lazy<Task>(ConfigureBlobCorsAsync));

        await setupTask.Value;
    }

    private async Task ConfigureBlobCorsAsync()
    {
        var serviceClient = new BlobServiceClient(_azureConnectionString);
        var properties = await serviceClient.GetPropertiesAsync();

        var allowedOrigins = string.Join(",", _azureCorsOrigins);
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

        await serviceClient.SetPropertiesAsync(properties.Value);
    }

    private static string[] BuildCorsOrigins(IConfiguration configuration)
    {
        var origins = new List<string>
        {
            "https://little-genius-lab.vercel.app",
            "https://littlegeniuslab.in",
            "https://www.littlegeniuslab.in",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        };

        var frontendUrl = configuration["FRONTEND_URL"];
        if (!string.IsNullOrWhiteSpace(frontendUrl))
        {
            origins.Add(frontendUrl);
        }

        var configuredOrigins = configuration["AzureBlob:CorsAllowedOrigins"];
        if (!string.IsNullOrWhiteSpace(configuredOrigins))
        {
            origins.AddRange(configuredOrigins.Split(
                ',',
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
        }

        return origins
            .Where(origin => Uri.TryCreate(origin, UriKind.Absolute, out _))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private StorageSharedKeyCredential? GetSharedKeyCredential()
    {
        if (string.IsNullOrWhiteSpace(_azureConnectionString)) return null;

        string? accountName = null, accountKey = null;
        var parts = _azureConnectionString.Split(';', StringSplitOptions.RemoveEmptyEntries);
        foreach (var p in parts)
        {
            var kv = p.Split('=', 2);
            if (kv.Length != 2) continue;
            if (kv[0].Equals("AccountName", StringComparison.OrdinalIgnoreCase)) accountName = kv[1];
            if (kv[0].Equals("AccountKey", StringComparison.OrdinalIgnoreCase)) accountKey = kv[1];
        }

        if (string.IsNullOrWhiteSpace(accountName) || string.IsNullOrWhiteSpace(accountKey)) return null;

        return new StorageSharedKeyCredential(accountName, accountKey);
    }

}

public sealed record BlobSasResult(string UploadUrl, string ReadUrl, string BlobUrl);
