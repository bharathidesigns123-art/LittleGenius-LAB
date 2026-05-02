using System.Threading.Channels;

namespace LittleGeniusLab.Api.Services;

public interface INotificationQueue
{
    ValueTask EnqueueAsync(NotificationJob job, CancellationToken cancellationToken = default);
    ValueTask<NotificationJob> DequeueAsync(CancellationToken cancellationToken);
}

public sealed class NotificationQueue : INotificationQueue
{
    private readonly Channel<NotificationJob> channel = Channel.CreateUnbounded<NotificationJob>(
        new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false
        });

    public ValueTask EnqueueAsync(NotificationJob job, CancellationToken cancellationToken = default) =>
        channel.Writer.WriteAsync(job, cancellationToken);

    public ValueTask<NotificationJob> DequeueAsync(CancellationToken cancellationToken) =>
        channel.Reader.ReadAsync(cancellationToken);
}

public sealed record NotificationJob(NotificationJobKind Kind, int EntityId, string? Status = null);

public enum NotificationJobKind
{
    WelcomeEmail,
    LoginAlert,
    OrderPlaced,
    OrderStatusUpdate,
    AdminNewOrderAlert
}
