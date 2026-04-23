namespace LittleGeniusLab.Api.Models;

public sealed class InventoryAdjustment
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int? UpdatedByUserId { get; set; }
    public int QuantityChange { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Product? Product { get; set; }
}
