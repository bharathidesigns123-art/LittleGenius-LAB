using Microsoft.AspNetCore.StaticFiles;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace LittleGeniusLab.Api.Services;

public sealed class FileStorageService(IWebHostEnvironment environment)
{
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    private const int MaxUploadBytes = 8 * 1024 * 1024;
    private const int MaxProductImageDimension = 1400;
    private const int MinProductImageDimension = 400;
    private const double MinAspectRatio = 0.5;
    private const double MaxAspectRatio = 2.0;
    private readonly FileExtensionContentTypeProvider _contentTypeProvider = new();

    public async Task<string> SaveImageAsync(IFormFile file, string folder, CancellationToken cancellationToken)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Only JPG, PNG, and WEBP files are allowed.");
        }

        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var targetDirectory = Path.Combine(webRoot, "uploads", folder);
        Directory.CreateDirectory(targetDirectory);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var absolutePath = Path.Combine(targetDirectory, fileName);

        await using var stream = File.Create(absolutePath);
        await file.CopyToAsync(stream, cancellationToken);

        return $"/uploads/{folder}/{fileName}";
    }

    public async Task<StoredProductImage> SaveProductImageAsync(
        IFormFile file,
        string folder,
        CancellationToken cancellationToken)
    {
        ValidateProductImage(file);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var targetDirectory = Path.Combine(webRoot, "uploads", folder);
        Directory.CreateDirectory(targetDirectory);

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
            var absolutePath = Path.Combine(targetDirectory, fileName);

            await using var outputStream = File.Create(absolutePath);
            await SaveProcessedImageAsync(image, outputStream, extension, cancellationToken);

            return new StoredProductImage(
                Url: $"/uploads/{folder}/{fileName}",
                Width: image.Width,
                Height: image.Height);
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
