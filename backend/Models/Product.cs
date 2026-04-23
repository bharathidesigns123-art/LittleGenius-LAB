namespace LittleGeniusLab.Api.Models;

public sealed class Product
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string FullDescription { get; set; } = string.Empty;
    public decimal PriceInr { get; set; }
    public decimal? CompareAtPriceInr { get; set; }
    public string Badge { get; set; } = string.Empty;
    public string HeroImageUrl { get; set; } = string.Empty;
    public string Colourway { get; set; } = string.Empty;
    public string Material { get; set; } = string.Empty;
    public string Finish { get; set; } = string.Empty;
    public string ShipsIn { get; set; } = string.Empty;
    public string MadeIn { get; set; } = "Tamil Nadu, India";
    public string Tagline { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public bool IsPublished { get; set; } = true;
    public int SizeMm { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; } = 5;
    public int DisplayOrder { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public ProductCategory? Category { get; set; }
    public List<ProductImage> Images { get; set; } = [];
    public List<ProductReview> Reviews { get; set; } = [];
    public List<InventoryAdjustment> InventoryAdjustments { get; set; } = [];
}
