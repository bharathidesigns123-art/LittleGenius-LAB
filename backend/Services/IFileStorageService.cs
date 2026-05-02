namespace LittleGeniusLab.Api.Services;

/// <summary>
/// Azure Blob storage: server-side upload stores only blob path; read access via time-limited SAS.
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Uploads a file to the configured container. Returns the blob path to persist (no SAS, no base URL).
    /// </summary>
    /// <exception cref="ArgumentNullException">File is null.</exception>
    /// <exception cref="ArgumentException">Empty file or invalid content.</exception>
    Task<string> UploadAsync(IFormFile file, CancellationToken cancellationToken = default);

    /// <summary>
    /// Builds a read-only SAS URL for an existing blob. <paramref name="fileName"/> must be the stored path from <see cref="UploadAsync"/>.
    /// </summary>
    string GetFileUrl(string fileName);
}
