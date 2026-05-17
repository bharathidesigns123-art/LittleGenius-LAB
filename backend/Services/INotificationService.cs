using LittleGeniusLab.Api.Models;

namespace LittleGeniusLab.Api.Services;

public interface INotificationService
{
    Task SendEmailAsync(string to, string subject, string template, IReadOnlyDictionary<string, object?> data, CancellationToken cancellationToken = default);
    Task SendSmsAsync(string to, string message, CancellationToken cancellationToken = default);
    Task SendWelcomeEmailAsync(int userId, CancellationToken cancellationToken = default);
    Task SendLoginAlertAsync(int userId, CancellationToken cancellationToken = default);
    Task SendPasswordResetEmailAsync(int userId, string resetUrl, CancellationToken cancellationToken = default);
    Task SendOrderPlacedAsync(int orderId, CancellationToken cancellationToken = default);
    Task SendOrderStatusUpdateAsync(int orderId, CancellationToken cancellationToken = default);
    Task SendAdminNewOrderAlertAsync(int orderId, CancellationToken cancellationToken = default);
}
