namespace LittleGeniusLab.Api.Configuration;

public sealed class EmailOptions
{
    public const string SectionName = "Email";

    public string? Host { get; set; }
    public int Port { get; set; } = 587;
    public string? User { get; set; }
    public string? Pass { get; set; }
    public string? FromEmail { get; set; }
    public string? FromName { get; set; } = "LittleGenius LAB";
    public bool EnableSsl { get; set; } = true;
}
