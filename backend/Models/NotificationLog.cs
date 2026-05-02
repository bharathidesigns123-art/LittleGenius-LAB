namespace LittleGeniusLab.Api.Models;

public sealed class NotificationLog
{
    public int Id { get; set; }
    public string Type { get; set; } = NotificationTypes.Email;
    public string EventName { get; set; } = string.Empty;
    public string Recipient { get; set; } = string.Empty;
    public string Status { get; set; } = NotificationStatuses.Pending;
    public string Message { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public string? Error { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? SentAtUtc { get; set; }
}

public static class NotificationTypes
{
    public const string Email = "email";
    public const string Sms = "sms";
}

public static class NotificationStatuses
{
    public const string Pending = "pending";
    public const string Sent = "sent";
    public const string Failed = "failed";
}
