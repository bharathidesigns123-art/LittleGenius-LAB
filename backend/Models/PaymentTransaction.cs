namespace LittleGeniusLab.Api.Models;

public sealed class PaymentTransaction
{
    public int Id { get; set; }
    /// <summary>Null until Razorpay payment is verified and the storefront order is materialized.</summary>
    public int? OrderId { get; set; }
    public string Provider { get; set; } = "Razorpay";
    public string ProviderOrderId { get; set; } = string.Empty;
    public string? ProviderPaymentId { get; set; }
    public string Receipt { get; set; } = string.Empty;
    public decimal AmountInr { get; set; }
    public string Currency { get; set; } = "INR";
    public string Status { get; set; } = PaymentStatuses.Pending;
    public string? FailureReason { get; set; }
    public string? RawPayloadJson { get; set; }
    /// <summary>Serialized checkout snapshot (line items and shipping) while awaiting payment.</summary>
    public string? PendingCheckoutJson { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public Order? Order { get; set; }
}
