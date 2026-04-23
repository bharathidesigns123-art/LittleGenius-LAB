namespace LittleGeniusLab.Api.Models;

public sealed class ProductReview
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int? UserId { get; set; }
    public int? OrderId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerLocation { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Quote { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = true;
    public bool IsVerifiedPurchase { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public Product? Product { get; set; }
    public AppUser? User { get; set; }
    public Order? Order { get; set; }
}
