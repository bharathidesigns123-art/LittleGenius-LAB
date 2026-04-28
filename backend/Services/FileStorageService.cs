using Microsoft.AspNetCore.StaticFiles;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Azure.Storage;
using System.IO;

namespace LittleGeniusLab.Api.Services;

public sealed class FileStorageService(IWebHostEnvironment environment, IConfiguration configuration)
{
    private static readonly string[] AllowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
    private const int MaxUploadBytes = 8 * 1024 * 1024;
    private const int MaxProductImageDimension = 1400;
    private const int MinProductImageDimension = 400;
    private const double MinAspectRatio = 0.5;
    private const double MaxAspectRatio = 2.0;
    private readonly FileExtensionContentTypeProvider _contentTypeProvider = new();
    private readonly string? _azureConnectionString = configuration["AzureBlob:ConnectionString"];
    private readonly string _azureContainerName = configuration["AzureBlob:ContainerName"] ?? "uploads";
    private readonly bool _azureContainerPublic = bool.TryParse(configuration["AzureBlob:ContainerPublic"], out var cp) ? cp : false;
    private readonly int _sasExpiryHours = int.TryParse(configuration["AzureBlob:SasExpiryHours"], out var h) ? h : 24;

    public async Task<string> SaveImageAsync(IFormFile file, string folder, CancellationToken cancellationToken)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Only JPG, PNG, and WEBP files are allowed.");
        }

        // If Azure configured, upload to blob storage
        if (!string.IsNullOrWhiteSpace(_azureConnectionString))
        {
            var containerClient = new BlobContainerClient(_azureConnectionString, _azureContainerName);
            await containerClient.CreateIfNotExistsAsync(_azureContainerPublic ? PublicAccessType.Blob : PublicAccessType.None, cancellationToken: cancellationToken);

            var fileName = $"{Guid.NewGuid():N}{extension}";
            var blobClient = containerClient.GetBlobClient(fileName);
            await using var uploadStream = file.OpenReadStream();
            var headers = new BlobHttpHeaders { ContentType = GetContentType(file.FileName) };
            await blobClient.UploadAsync(uploadStream, headers, cancellationToken: cancellationToken);
            if (_azureContainerPublic)
            {
                return blobClient.Uri.ToString();
            }
            var sasUrl = TryBuildSasUri(blobClient, _azureConnectionString, _azureContainerName, fileName, _sasExpiryHours);
            return sasUrl ?? blobClient.Uri.ToString();
        }

        // Fallback to local filesystem
        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var targetDirectory = Path.Combine(webRoot, "uploads", folder);
        Directory.CreateDirectory(targetDirectory);

        var localFileName = $"{Guid.NewGuid():N}{extension}";
        var absolutePath = Path.Combine(targetDirectory, localFileName);

        await using var stream = File.Create(absolutePath);
        await file.CopyToAsync(stream, cancellationToken);

        return $"/uploads/{folder}/{localFileName}";
    }

    public async Task<StoredProductImage> SaveProductImageAsync(
        IFormFile file,
        string folder,
        CancellationToken cancellationToken)
    {
        ValidateProductImage(file);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        await using var inputStream = file.OpenReadStream();
        Image image;
        try
        {
            image = await Image.LoadAsync(inputStream, cancellationToken);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception exception)
        {
            throw new InvalidOperationException("The uploaded file is not a valid image.", exception);
        }

        using (image)
        {
            var aspectRatio = image.Width / (double)image.Height;
            if (aspectRatio < MinAspectRatio || aspectRatio > MaxAspectRatio)
            {
                throw new InvalidOperationException("Product images must stay within a 1:2 to 2:1 aspect ratio.");
            }

            if (image.Width < MinProductImageDimension || image.Height < MinProductImageDimension)
            {
                throw new InvalidOperationException("Product images must be at least 400x400 pixels.");
            }

            if (image.Width > MaxProductImageDimension || image.Height > MaxProductImageDimension)
            {
                var resizeRatio = Math.Min(
                    MaxProductImageDimension / (double)image.Width,
                    MaxProductImageDimension / (double)image.Height);

                image.Mutate(processing => processing.Resize(
                    (int)Math.Round(image.Width * resizeRatio),
                    (int)Math.Round(image.Height * resizeRatio)));
            }

            var fileName = $"{Guid.NewGuid():N}{extension}";

            // If Azure configured, upload processed image to blob storage
            if (!string.IsNullOrWhiteSpace(_azureConnectionString))
            {
                var containerClient = new BlobContainerClient(_azureConnectionString, _azureContainerName);
                await containerClient.CreateIfNotExistsAsync(_azureContainerPublic ? PublicAccessType.Blob : PublicAccessType.None, cancellationToken: cancellationToken);

                await using var ms = new MemoryStream();
                await SaveProcessedImageAsync(image, ms, extension, cancellationToken);
                ms.Position = 0;

                var blobClient = containerClient.GetBlobClient(fileName);
                var headers = new BlobHttpHeaders { ContentType = GetContentType(file.FileName) };
                await blobClient.UploadAsync(ms, headers, cancellationToken: cancellationToken);

                if (_azureContainerPublic)
                {
                    return new StoredProductImage(Url: blobClient.Uri.ToString(), Width: image.Width, Height: image.Height);
                }

                var sasUrl = TryBuildSasUri(blobClient, _azureConnectionString, _azureContainerName, fileName, _sasExpiryHours);
                return new StoredProductImage(Url: sasUrl ?? blobClient.Uri.ToString(), Width: image.Width, Height: image.Height);
            }

            // Fallback to local filesystem
            var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
            var targetDirectory = Path.Combine(webRoot, "uploads", folder);
            Directory.CreateDirectory(targetDirectory);

            var absolutePath = Path.Combine(targetDirectory, fileName);
            await using var outputStream = File.Create(absolutePath);
            await SaveProcessedImageAsync(image, outputStream, extension, cancellationToken);

            return new StoredProductImage(Url: $"/uploads/{folder}/{fileName}", Width: image.Width, Height: image.Height);
        }
    }

    public async Task<BlobSasResult> GetUploadSasAsync(string fileName, string? contentType)
    {
        if (string.IsNullOrWhiteSpace(_azureConnectionString))
            throw new InvalidOperationException("Azure Blob Storage is not configured.");

        var credential = GetSharedKeyCredential()
            ?? throw new InvalidOperationException("Storage account key missing - cannot create SAS.");

        var containerClient = new BlobContainerClient(_azureConnectionString, _azureContainerName);
        await containerClient.CreateIfNotExistsAsync(_azureContainerPublic ? PublicAccessType.Blob : PublicAccessType.None);
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

    private string? TryBuildSasUri(BlobClient blobClient, string? connectionString, string containerName, string blobName, int expiryHours)
    {
        try
        {
            var credential = GetSharedKeyCredential();
            if (credential == null) return null;

            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = containerName,
                BlobName = blobName,
                Resource = "b",
                StartsOn = DateTimeOffset.UtcNow.AddMinutes(-5),
                ExpiresOn = DateTimeOffset.UtcNow.AddHours(expiryHours)
            };
            sasBuilder.SetPermissions(BlobSasPermissions.Read);

            var sasToken = sasBuilder.ToSasQueryParameters(credential).ToString();
            return string.IsNullOrEmpty(sasToken) ? null : $"{blobClient.Uri}?{sasToken}";
        }
        catch
        {
            return null;
        }
    }

    public void DeleteImage(string? relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl) || !relativeUrl.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var absolutePath = Path.Combine(
            webRoot,
            relativeUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

        if (File.Exists(absolutePath))
        {
            File.Delete(absolutePath);
        }
    }

    public string GetContentType(string path)
        => _contentTypeProvider.TryGetContentType(path, out var contentType)
            ? contentType
            : "application/octet-stream";

    private static void ValidateProductImage(IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Only JPG, PNG, and WEBP files are allowed.");
        }

        if (file.Length <= 0)
        {
            throw new InvalidOperationException("Image upload cannot be empty.");
        }

        if (file.Length > MaxUploadBytes)
        {
            throw new InvalidOperationException("Image uploads must be 8 MB or smaller.");
        }
    }

    private static async Task SaveProcessedImageAsync(
        Image image,
        Stream outputStream,
        string extension,
        CancellationToken cancellationToken)
    {
        switch (extension)
        {
            case ".jpg":
            case ".jpeg":
                await image.SaveAsJpegAsync(outputStream, new JpegEncoder { Quality = 86 }, cancellationToken);
                break;
            case ".png":
                await image.SaveAsPngAsync(outputStream, new PngEncoder(), cancellationToken);
                break;
            case ".webp":
                await image.SaveAsWebpAsync(outputStream, new WebpEncoder { Quality = 86 }, cancellationToken);
                break;
            default:
                throw new InvalidOperationException("Unsupported image format.");
        }
    }
}

public sealed record StoredProductImage(string Url, int Width, int Height);
public sealed record BlobSasResult(string UploadUrl, string ReadUrl, string BlobUrl);
