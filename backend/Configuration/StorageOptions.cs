namespace LittleGeniusLab.Api.Configuration;

public sealed class StorageOptions
{
    public const string SectionName = "Storage";

    public string Endpoint { get; set; } = string.Empty;

    public string Region { get; set; } = "ap-northeast-2";

    public string Bucket { get; set; } = "product-images";

    public string AccessKeyId { get; set; } = string.Empty;

    public string SecretAccessKey { get; set; } = string.Empty;

    public int ReadUrlExpiryDays { get; set; } = 7;

    public int UploadUrlExpiryMinutes { get; set; } = 60;
}
