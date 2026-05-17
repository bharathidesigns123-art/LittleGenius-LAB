using System.Net;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using LittleGeniusLab.Api.Configuration;
using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LittleGeniusLab.Api.Services;

public sealed class NotificationService(
    AppDbContext db,
    IConfiguration configuration,
    IHttpClientFactory httpClientFactory,
    IOptions<EmailOptions> emailOptions,
    IOptions<SmsOptions> smsOptions,
    IOptions<NotificationOptions> notificationOptions,
    ILogger<NotificationService> logger) : INotificationService
{
    private static readonly Regex EmailPattern = new(@"^\S+@\S+\.\S+$", RegexOptions.Compiled);
    private static readonly Regex DigitsOnly = new(@"\D+", RegexOptions.Compiled);

    public Task SendEmailAsync(
        string to,
        string subject,
        string template,
        IReadOnlyDictionary<string, object?> data,
        CancellationToken cancellationToken = default)
    {
        var html = template switch
        {
            "welcome" when data.TryGetValue("user", out var user) && user is AppUser appUser => EmailTemplates.Welcome(appUser).HtmlBody,
            "login-alert" when data.TryGetValue("user", out var user) && user is AppUser appUser => EmailTemplates.LoginAlert(appUser).HtmlBody,
            "order-confirmation" when data.TryGetValue("order", out var order) && order is Order placedOrder => EmailTemplates.OrderConfirmation(placedOrder).HtmlBody,
            "order-status-update" when data.TryGetValue("order", out var order) && order is Order statusOrder => EmailTemplates.OrderStatusUpdate(statusOrder).HtmlBody,
            "admin-new-order" when data.TryGetValue("order", out var order) && order is Order adminOrder => EmailTemplates.AdminNewOrder(adminOrder).HtmlBody,
            _ => data.TryGetValue("body", out var body) ? body?.ToString() ?? string.Empty : string.Empty
        };

        return SendEmailInternalAsync(to, subject, html, template, cancellationToken);
    }

    public Task SendSmsAsync(string to, string message, CancellationToken cancellationToken = default) =>
        SendSmsInternalAsync(to, message, "sms", cancellationToken);

    public async Task SendWelcomeEmailAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);
        if (user is null)
        {
            return;
        }

        var content = EmailTemplates.Welcome(user);
        await SendEmailInternalAsync(user.Email, content.Subject, content.HtmlBody, "user.registration", cancellationToken);
    }

    public async Task SendLoginAlertAsync(int userId, CancellationToken cancellationToken = default)
    {
        if (!notificationOptions.Value.SendLoginAlerts)
        {
            return;
        }

        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);
        if (user is null)
        {
            return;
        }

        var content = EmailTemplates.LoginAlert(user);
        await SendEmailInternalAsync(user.Email, content.Subject, content.HtmlBody, "user.login", cancellationToken);
    }

    public async Task SendPasswordResetEmailAsync(int userId, string resetUrl, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);
        if (user is null || string.IsNullOrWhiteSpace(resetUrl))
        {
            return;
        }

        var content = EmailTemplates.PasswordReset(user, resetUrl);
        await SendEmailInternalAsync(user.Email, content.Subject, content.HtmlBody, "user.password-reset", cancellationToken);
    }

    public async Task SendOrderPlacedAsync(int orderId, CancellationToken cancellationToken = default)
    {
        var order = await GetOrderAsync(orderId, cancellationToken);
        if (order is null)
        {
            return;
        }

        var content = EmailTemplates.OrderConfirmation(order);
        await SendEmailInternalAsync(order.Email, content.Subject, content.HtmlBody, "order.placed", cancellationToken);
        await SendSmsInternalAsync(order.Phone, EmailTemplates.SmsOrderPlaced(order), "order.placed", cancellationToken);
    }

    public async Task SendOrderStatusUpdateAsync(int orderId, CancellationToken cancellationToken = default)
    {
        var order = await GetOrderAsync(orderId, cancellationToken);
        if (order is null || order.Status is not (OrderStatuses.Shipped or OrderStatuses.Delivered or OrderStatuses.Cancelled))
        {
            return;
        }

        var content = EmailTemplates.OrderStatusUpdate(order);
        await SendEmailInternalAsync(order.Email, content.Subject, content.HtmlBody, "order.status", cancellationToken);
        await SendSmsInternalAsync(order.Phone, EmailTemplates.SmsOrderStatus(order), "order.status", cancellationToken);
    }

    public async Task SendAdminNewOrderAlertAsync(int orderId, CancellationToken cancellationToken = default)
    {
        var adminEmail = FirstConfigured(
            notificationOptions.Value.AdminEmail,
            configuration["ADMIN_NOTIFICATION_EMAIL"],
            configuration["Admin:Email"]);
        if (string.IsNullOrWhiteSpace(adminEmail))
        {
            logger.LogWarning(
                "Admin new order alert skipped for order {OrderId}: no admin email is configured. Set Notifications:AdminEmail or ADMIN_NOTIFICATION_EMAIL.",
                orderId);
            return;
        }

        var order = await GetOrderAsync(orderId, cancellationToken);
        if (order is null)
        {
            return;
        }

        var content = EmailTemplates.AdminNewOrder(order);
        await SendEmailInternalAsync(adminEmail, content.Subject, content.HtmlBody, "admin.new-order", cancellationToken);
    }

    private Task<Order?> GetOrderAsync(int orderId, CancellationToken cancellationToken) =>
        db.Orders
            .AsNoTracking()
            .Include(order => order.Items)
            .FirstOrDefaultAsync(order => order.Id == orderId, cancellationToken);

    private async Task SendEmailInternalAsync(
        string to,
        string subject,
        string htmlBody,
        string eventName,
        CancellationToken cancellationToken)
    {
        if (!IsValidEmail(to))
        {
            await LogAsync(NotificationTypes.Email, eventName, to, NotificationStatuses.Failed, subject, "Invalid email address.", cancellationToken);
            return;
        }

        var options = ResolveEmailOptions();
        if (string.IsNullOrWhiteSpace(options.Host) || string.IsNullOrWhiteSpace(options.User) || string.IsNullOrWhiteSpace(options.Pass))
        {
            await LogAsync(NotificationTypes.Email, eventName, to, NotificationStatuses.Failed, subject, "SMTP is not configured.", cancellationToken);
            logger.LogWarning("Email notification skipped for {Recipient}: SMTP is not configured.", to);
            return;
        }

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(options.FromEmail ?? options.User, options.FromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(to);

            using var client = new SmtpClient(options.Host, options.Port)
            {
                EnableSsl = options.EnableSsl,
                Credentials = new NetworkCredential(options.User, options.Pass)
            };

            await client.SendMailAsync(message, cancellationToken);
            await LogAsync(NotificationTypes.Email, eventName, to, NotificationStatuses.Sent, subject, null, cancellationToken);
        }
        catch (Exception exception)
        {
            await LogAsync(NotificationTypes.Email, eventName, to, NotificationStatuses.Failed, subject, exception.Message, cancellationToken);
            throw;
        }
    }

    private async Task SendSmsInternalAsync(
        string to,
        string message,
        string eventName,
        CancellationToken cancellationToken)
    {
        var normalizedPhone = NormalizePhone(to);
        if (normalizedPhone is null)
        {
            await LogAsync(NotificationTypes.Sms, eventName, to, NotificationStatuses.Failed, message, "Invalid phone number.", cancellationToken);
            return;
        }

        var options = ResolveSmsOptions();
        if (string.Equals(options.Provider, "Disabled", StringComparison.OrdinalIgnoreCase))
        {
            await LogAsync(NotificationTypes.Sms, eventName, normalizedPhone, NotificationStatuses.Failed, message, "SMS provider is disabled.", cancellationToken);
            return;
        }

        try
        {
            await SendProviderSmsAsync(options, normalizedPhone, message, cancellationToken);
            await LogAsync(NotificationTypes.Sms, eventName, normalizedPhone, NotificationStatuses.Sent, message, null, cancellationToken);
        }
        catch (Exception exception)
        {
            await LogAsync(NotificationTypes.Sms, eventName, normalizedPhone, NotificationStatuses.Failed, message, exception.Message, cancellationToken);
            throw;
        }
    }

    private async Task SendProviderSmsAsync(SmsOptions options, string phone, string message, CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient("sms");

        if (string.Equals(options.Provider, "Twilio", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(options.TwilioAccountSid) ||
                string.IsNullOrWhiteSpace(options.TwilioAuthToken) ||
                string.IsNullOrWhiteSpace(options.TwilioFrom))
            {
                throw new InvalidOperationException("Twilio SMS is not configured.");
            }

            var request = new HttpRequestMessage(
                HttpMethod.Post,
                $"https://api.twilio.com/2010-04-01/Accounts/{options.TwilioAccountSid}/Messages.json");
            var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{options.TwilioAccountSid}:{options.TwilioAuthToken}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
            request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["To"] = phone,
                ["From"] = options.TwilioFrom,
                ["Body"] = message
            });

            await EnsureSuccessAsync(client, request, cancellationToken);
            return;
        }

        if (string.Equals(options.Provider, "Fast2SMS", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(options.ApiKey))
            {
                throw new InvalidOperationException("Fast2SMS API key is not configured.");
            }

            var localPhone = phone.StartsWith("+91", StringComparison.Ordinal) ? phone[3..] : phone.TrimStart('+');
            var request = new HttpRequestMessage(HttpMethod.Post, "https://www.fast2sms.com/dev/bulkV2");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.ApiKey);
            request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["route"] = "q",
                ["message"] = message,
                ["language"] = "english",
                ["flash"] = "0",
                ["numbers"] = localPhone
            });

            await EnsureSuccessAsync(client, request, cancellationToken);
            return;
        }

        if (string.Equals(options.Provider, "MSG91", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(options.ApiKey))
            {
                throw new InvalidOperationException("MSG91 API key is not configured.");
            }

            var localPhone = phone.TrimStart('+');
            var payload = JsonSerializer.Serialize(new
            {
                flow_id = options.Msg91TemplateId,
                sender = options.SenderId,
                recipients = new[] { new { mobiles = localPhone, message } }
            });
            var request = new HttpRequestMessage(HttpMethod.Post, "https://control.msg91.com/api/v5/flow/");
            request.Headers.Add("authkey", options.ApiKey);
            request.Content = new StringContent(payload, Encoding.UTF8, "application/json");

            await EnsureSuccessAsync(client, request, cancellationToken);
            return;
        }

        throw new InvalidOperationException($"Unsupported SMS provider '{options.Provider}'.");
    }

    private static async Task EnsureSuccessAsync(HttpClient client, HttpRequestMessage request, CancellationToken cancellationToken)
    {
        using var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"SMS provider returned {(int)response.StatusCode}: {body}");
        }
    }

    private async Task LogAsync(
        string type,
        string eventName,
        string recipient,
        string status,
        string message,
        string? error,
        CancellationToken cancellationToken)
    {
        db.NotificationLogs.Add(new NotificationLog
        {
            Type = type,
            EventName = eventName,
            Recipient = recipient,
            Status = status,
            Message = message.Length > 1000 ? message[..1000] : message,
            AttemptCount = 1,
            Error = error,
            SentAtUtc = status == NotificationStatuses.Sent ? DateTime.UtcNow : null
        });

        await db.SaveChangesAsync(cancellationToken);
    }

    private EmailOptions ResolveEmailOptions()
    {
        var options = emailOptions.Value;
        options.Host = FirstConfigured(configuration["EMAIL_HOST"], options.Host);
        options.Port = int.TryParse(FirstConfigured(configuration["EMAIL_PORT"], options.Port.ToString()), out var port) ? port : options.Port;
        options.User = FirstConfigured(configuration["EMAIL_USER"], options.User);
        options.Pass = FirstConfigured(configuration["EMAIL_PASS"], options.Pass);
        options.FromEmail = FirstConfigured(configuration["EMAIL_FROM"], options.FromEmail, options.User);
        options.FromName = FirstConfigured(configuration["EMAIL_FROM_NAME"], options.FromName);
        return options;
    }

    private SmsOptions ResolveSmsOptions()
    {
        var options = smsOptions.Value;
        options.Provider = FirstConfigured(configuration["SMS_PROVIDER"], options.Provider) ?? "Disabled";
        options.ApiKey = FirstConfigured(configuration["SMS_API_KEY"], configuration["FAST2SMS_API_KEY"], configuration["MSG91_API_KEY"], options.ApiKey);
        options.SenderId = FirstConfigured(configuration["SMS_SENDER_ID"], configuration["MSG91_SENDER_ID"], options.SenderId);
        options.TwilioAccountSid = FirstConfigured(configuration["TWILIO_ACCOUNT_SID"], options.TwilioAccountSid);
        options.TwilioAuthToken = FirstConfigured(configuration["TWILIO_AUTH_TOKEN"], options.TwilioAuthToken);
        options.TwilioFrom = FirstConfigured(configuration["TWILIO_FROM"], options.TwilioFrom);
        options.Msg91TemplateId = FirstConfigured(configuration["MSG91_TEMPLATE_ID"], options.Msg91TemplateId);
        return options;
    }

    private static bool IsValidEmail(string email) =>
        !string.IsNullOrWhiteSpace(email) && EmailPattern.IsMatch(email.Trim());

    private static string? NormalizePhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return null;
        }

        var digits = DigitsOnly.Replace(phone, string.Empty);
        if (digits.Length == 10)
        {
            return $"+91{digits}";
        }

        if (digits.Length >= 11 && digits.Length <= 15)
        {
            return $"+{digits}";
        }

        return null;
    }

    private static string? FirstConfigured(params string?[] values) =>
        values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value) && !value.StartsWith("${", StringComparison.Ordinal));
}
