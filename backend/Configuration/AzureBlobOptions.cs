namespace LittleGeniusLab.Api.Configuration;

public sealed class AzureBlobOptions
{
    public const string SectionName = "AzureBlob";

    /// <summary>Full storage connection string (use Key Vault / env in production).</summary>
    public string ConnectionString { get; set; } = string.Empty;

    /// <summary>Blob container name (e.g. uploads).</summary>
    public string ContainerName { get; set; } = "uploads";

    /// <summary>How long read-only SAS URLs remain valid when returned to clients.</summary>
    public int ReadSasExpiryDays { get; set; } = 7;

    /// <summary>Legacy: hours for client PUT SAS used by direct browser uploads.</summary>
    public int SasExpiryHours { get; set; } = 24;

    public bool ContainerPublic { get; set; }

    /// <summary>Comma-separated origins allowed for blob CORS (browser PUT uploads).</summary>
    public string? CorsAllowedOrigins { get; set; }
}
