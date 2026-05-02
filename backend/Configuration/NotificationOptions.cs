namespace LittleGeniusLab.Api.Configuration;

public sealed class NotificationOptions
{
    public const string SectionName = "Notifications";

    public string? AdminEmail { get; set; }
    public bool SendLoginAlerts { get; set; }
    public int MaxRetryAttempts { get; set; } = 3;
}
