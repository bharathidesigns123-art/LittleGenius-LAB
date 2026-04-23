namespace LittleGeniusLab.Api.Models;

public sealed class ProductImage
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Product? Product { get; set; }
}
