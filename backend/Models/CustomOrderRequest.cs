namespace LittleGeniusLab.Api.Models;

public sealed class CustomOrderRequest
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string ReferenceCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string WhatsAppNumber { get; set; } = string.Empty;
    public string Occasion { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string ColorPreference { get; set; } = string.Empty;
    public string? CharacterDescription { get; set; }
    public string? PhotoUrl { get; set; }
    public string? BaseMessage { get; set; }
    public string? Pincode { get; set; }
    public string Status { get; set; } = CustomOrderStatuses.New;
    public decimal? QuoteAmountInr { get; set; }
    public string? AdminNotes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public AppUser? User { get; set; }
}
