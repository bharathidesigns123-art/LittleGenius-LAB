namespace LittleGeniusLab.Api.Configuration;

public sealed class SmsOptions
{
    public const string SectionName = "Sms";

    public string Provider { get; set; } = "Disabled";
    public string? ApiKey { get; set; }
    public string? SenderId { get; set; }
    public string? TwilioAccountSid { get; set; }
    public string? TwilioAuthToken { get; set; }
    public string? TwilioFrom { get; set; }
    public string? Msg91TemplateId { get; set; }
}
