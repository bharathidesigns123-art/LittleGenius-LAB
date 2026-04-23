namespace LittleGeniusLab.Api.Configuration;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "LittleGenius LAB";
    public string Audience { get; set; } = "LittleGenius LAB Customers";
    public string SecretKey { get; set; } = "LittleGeniusLabSuperSecretKeyForJwtGeneration2026";
    public int ExpiryHours { get; set; } = 72;
}
