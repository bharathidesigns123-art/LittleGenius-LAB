using System.Net.Http.Headers;

namespace LittleGeniusLab.Api.Services;

/// <summary>
/// Service to send WhatsApp notifications to Indian customers using Meta Cloud API.
/// </summary>
public sealed class WhatsAppNotificationService(HttpClient httpClient, IConfiguration configuration)
{
    public async Task SendTemplateMessageAsync(string toPhone, string templateName, string[] parameters)
    {
        var phoneNumberId = configuration["WhatsApp:PhoneNumberId"];
        var accessToken = configuration["WhatsApp:AccessToken"];

        if (string.IsNullOrEmpty(phoneNumberId) || string.IsNullOrEmpty(accessToken)) return;

        // Ensure number has 91 prefix for India
        var formattedPhone = toPhone.Trim().Replace(" ", "").Replace("-", "");
        if (!formattedPhone.StartsWith("91") && formattedPhone.Length == 10)
        {
            formattedPhone = "91" + formattedPhone;
        }

        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var payload = new
        {
            messaging_product = "whatsapp",
            to = formattedPhone,
            type = "template",
            template = new
            {
                name = templateName,
                language = new { code = "en_US" },
                components = new[]
                {
                    new
                    {
                        type = "body",
                        parameters = parameters.Select(p => new { type = "text", text = p }).ToArray()
                    }
                }
            }
        };

        await httpClient.PostAsJsonAsync($"https://graph.facebook.com/v17.0/{phoneNumberId}/messages", payload);
    }
}
