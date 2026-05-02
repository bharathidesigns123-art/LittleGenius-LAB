using LittleGeniusLab.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LittleGeniusLab.Api.Controllers;

/// <summary>
/// Example API for server-side upload and read SAS URLs. Secure with auth as needed for production.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorage;

    public FilesController(IFileStorageService fileStorage)
    {
        _fileStorage = fileStorage;
    }

    /// <summary>Upload a file; persist the returned <c>blobName</c> in your database.</summary>
    [HttpPost("upload")]
    [RequestFormLimits(MultipartBodyLengthLimit = 52_428_800)]
    [RequestSizeLimit(52_428_800)]
    [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UploadResponse>> Upload(IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            var blobName = await _fileStorage.UploadAsync(file, cancellationToken).ConfigureAwait(false);
            var readUrl = _fileStorage.GetFileUrl(blobName);
            return Ok(new UploadResponse(blobName, readUrl));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Issue a fresh read-only SAS URL for a blob path already stored in the database.</summary>
    [HttpGet("url")]
    [ProducesResponseType(typeof(UrlResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<UrlResponse> GetUrl([FromQuery] string blobName)
    {
        try
        {
            var url = _fileStorage.GetFileUrl(blobName);
            return Ok(new UrlResponse(url));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    public sealed record UploadResponse(string BlobName, string ReadUrl);

    public sealed record UrlResponse(string ReadUrl);
}
