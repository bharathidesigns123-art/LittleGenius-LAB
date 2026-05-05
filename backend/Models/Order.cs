namespace LittleGeniusLab.Api.Models;

public sealed class Order
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    /// <summary>Stable browser identifier for guest checkout; cleared after merge to a user account.</summary>
    public string? GuestId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = "India";
    public string Pincode { get; set; } = string.Empty;
    public string Status { get; set; } = OrderStatuses.Pending;
    public string PaymentStatus { get; set; } = PaymentStatuses.Pending;
    public string PaymentMethod { get; set; } = "Razorpay";
    public decimal SubtotalInr { get; set; }
    public decimal ShippingFeeInr { get; set; }
    public decimal TotalPriceInr { get; set; }
    public string? Notes { get; set; }
    public string? TrackingNumber { get; set; }
    public decimal? PackageWeightKg { get; set; }
    public string? PackageDimensionsCm { get; set; }
    public string? CourierPartner { get; set; }
    public string RefundStatus { get; set; } = RefundStatuses.NotRequested;
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAtUtc { get; set; }
    public DateTime? ShippedAtUtc { get; set; }
    public DateTime? DeliveredAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public AppUser? User { get; set; }
    public List<OrderItem> Items { get; set; } = [];
    public List<PaymentTransaction> Payments { get; set; } = [];
    public List<ProductReview> Reviews { get; set; } = [];
}
