using System.Globalization;
using System.Text.RegularExpressions;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using LittleGeniusLab.Api.Configuration;
using Microsoft.Extensions.Options;

namespace LittleGeniusLab.Api.Services;

/// <summary>
/// Production-oriented S3-compatible storage for Supabase Storage.
/// </summary>
public sealed class FileStorageService : IFileStorageService
{
    private readonly StorageOptions _options;
    private readonly IAmazonS3 _s3Client;

    public FileStorageService(IOptions<StorageOptions> options)
    {
        _options = options.Value;
        EnsureConfigured();

        var credentials = new BasicAWSCredentials(_options.AccessKeyId, _options.SecretAccessKey);
        var config = new AmazonS3Config
        {
            ServiceURL = _options.Endpoint.TrimEnd('/'),
            ForcePathStyle = true,
            AuthenticationRegion = _options.Region,
            RegionEndpoint = RegionEndpoint.GetBySystemName(_options.Region)
        };
        _s3Client = new AmazonS3Client(credentials, config);
    }

    private string BucketName => string.IsNullOrWhiteSpace(_options.Bucket) ? "product-images" : _options.Bucket;

    private int ReadUrlExpiryDays => _options.ReadUrlExpiryDays > 0 ? _options.ReadUrlExpiryDays : 7;

    private int UploadUrlExpiryMinutes => _options.UploadUrlExpiryMinutes > 0 ? _options.UploadUrlExpiryMinutes : 60;

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

        var objectKey = BuildUniqueObjectKey(file.FileName);
        ValidateObjectKey(objectKey);

        await using var stream = file.OpenReadStream();
        await _s3Client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = BucketName,
            Key = objectKey,
            InputStream = stream,
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType
        }, cancellationToken)
            .ConfigureAwait(false);

        return objectKey;
    }

    /// <inheritdoc />
    public string GetFileUrl(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new ArgumentException("Object key is required.", nameof(fileName));
        }

        var normalized = NormalizeStoredPath(fileName);
        ValidateObjectKey(normalized);

        return _s3Client.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = BucketName,
            Key = normalized,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddDays(ReadUrlExpiryDays)
        });
    }

    /// <inheritdoc />
    public Task<StorageUploadUrlResult> GetUploadUrlAsync(string fileName, string? contentType, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new ArgumentException("File name is required.", nameof(fileName));
        }

        var objectKey = BuildUniqueObjectKey(fileName);
        ValidateObjectKey(objectKey);

        var uploadRequest = new GetPreSignedUrlRequest
        {
            BucketName = BucketName,
            Key = objectKey,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(UploadUrlExpiryMinutes)
        };
        if (!string.IsNullOrWhiteSpace(contentType))
        {
            uploadRequest.ContentType = contentType;
        }

        var uploadUrl = _s3Client.GetPreSignedURL(uploadRequest);
        var readUrl = GetFileUrl(objectKey);
        var publicUrl = BuildSupabasePublicUrl(objectKey);

        return Task.FromResult(new StorageUploadUrlResult(uploadUrl, readUrl, publicUrl));
    }

    private void EnsureConfigured()
    {
        if (string.IsNullOrWhiteSpace(_options.Endpoint) ||
            string.IsNullOrWhiteSpace(_options.AccessKeyId) ||
            string.IsNullOrWhiteSpace(_options.SecretAccessKey) ||
            string.IsNullOrWhiteSpace(_options.Bucket))
        {
            throw new InvalidOperationException("Storage is not configured. Set Storage__Endpoint, Storage__Bucket, Storage__AccessKeyId, and Storage__SecretAccessKey.");
        }
    }

    private static string BuildUniqueObjectKey(string originalFileName)
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

    /// <summary>Blocks path traversal and reserved characters unsafe for object keys.</summary>
    private static void ValidateObjectKey(string path)
    {
        if (path.Contains("..", StringComparison.Ordinal) || path.StartsWith("//", StringComparison.Ordinal))
        {
            throw new ArgumentException("Invalid object key.", nameof(path));
        }

        if (!ObjectKeyRegex.IsMatch(path))
        {
            throw new ArgumentException("Object key contains invalid characters.", nameof(path));
        }
    }

    /// <summary>Object keys we generate: yyyy/MM/guid.ext (safe subset).</summary>
    private const string ObjectKeyPattern = @"^[a-zA-Z0-9][a-zA-Z0-9!-_.*'()/]{0,1023}$";

    private static readonly Regex ObjectKeyRegex = new(ObjectKeyPattern, RegexOptions.CultureInvariant, TimeSpan.FromMilliseconds(250));

    private static readonly Regex SafeExtensionRegex = new(@"^\.[a-z0-9]{1,16}$", RegexOptions.CultureInvariant, TimeSpan.FromMilliseconds(250));

    private string BuildSupabasePublicUrl(string objectKey)
    {
        var endpoint = _options.Endpoint.TrimEnd('/');
        const string s3Suffix = "/storage/v1/s3";
        var baseUrl = endpoint.EndsWith(s3Suffix, StringComparison.OrdinalIgnoreCase)
            ? endpoint[..^s3Suffix.Length]
            : endpoint;

        return $"{baseUrl}/storage/v1/object/public/{Uri.EscapeDataString(BucketName)}/{Uri.EscapeDataString(objectKey).Replace("%2F", "/", StringComparison.Ordinal)}";
    }
}

public sealed record StorageUploadUrlResult(string UploadUrl, string ReadUrl, string BlobUrl);
