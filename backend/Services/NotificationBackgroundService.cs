using LittleGeniusLab.Api.Configuration;
using Microsoft.Extensions.Options;

namespace LittleGeniusLab.Api.Services;

public sealed class NotificationBackgroundService(
    INotificationQueue queue,
    IServiceScopeFactory scopeFactory,
    IOptions<NotificationOptions> options,
    ILogger<NotificationBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            NotificationJob job;
            try
            {
                job = await queue.DequeueAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            await ProcessWithRetryAsync(job, stoppingToken);
        }
    }

    private async Task ProcessWithRetryAsync(NotificationJob job, CancellationToken cancellationToken)
    {
        var maxAttempts = Math.Max(1, options.Value.MaxRetryAttempts);

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                await DispatchAsync(notificationService, job, cancellationToken);
                return;
            }
            catch (Exception exception) when (attempt < maxAttempts && !cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(
                    exception,
                    "Notification job {Kind} for entity {EntityId} failed on attempt {Attempt}. Retrying.",
                    job.Kind,
                    job.EntityId,
                    attempt);
                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)), cancellationToken);
            }
            catch (Exception exception)
            {
                logger.LogError(
                    exception,
                    "Notification job {Kind} for entity {EntityId} failed permanently.",
                    job.Kind,
                    job.EntityId);
                return;
            }
        }
    }

    private static Task DispatchAsync(
        INotificationService notificationService,
        NotificationJob job,
        CancellationToken cancellationToken) =>
        job.Kind switch
        {
            NotificationJobKind.WelcomeEmail => notificationService.SendWelcomeEmailAsync(job.EntityId, cancellationToken),
            NotificationJobKind.LoginAlert => notificationService.SendLoginAlertAsync(job.EntityId, cancellationToken),
            NotificationJobKind.OrderPlaced => notificationService.SendOrderPlacedAsync(job.EntityId, cancellationToken),
            NotificationJobKind.OrderStatusUpdate => notificationService.SendOrderStatusUpdateAsync(job.EntityId, cancellationToken),
            NotificationJobKind.AdminNewOrderAlert => notificationService.SendAdminNewOrderAlertAsync(job.EntityId, cancellationToken),
            _ => Task.CompletedTask
        };
}
