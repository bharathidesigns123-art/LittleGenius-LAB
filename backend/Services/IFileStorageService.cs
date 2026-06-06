namespace LittleGeniusLab.Api.Services;

/// <summary>
/// S3-compatible storage: server-side upload stores only object keys; read access via generated URLs.
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Uploads a file to the configured bucket. Returns the object key to persist.
    /// </summary>
    /// <exception cref="ArgumentNullException">File is null.</exception>
    /// <exception cref="ArgumentException">Empty file or invalid content.</exception>
    Task<string> UploadAsync(IFormFile file, CancellationToken cancellationToken = default);

    /// <summary>
    /// Builds a read URL for an existing object. <paramref name="fileName"/> must be the stored key from <see cref="UploadAsync"/>.
    /// </summary>
    string GetFileUrl(string fileName);
}
