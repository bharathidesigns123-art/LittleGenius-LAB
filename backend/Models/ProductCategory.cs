namespace LittleGeniusLab.Api.Models;

public sealed class ProductCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PriceRange { get; set; } = string.Empty;
    public string ThemeColor { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public List<Product> Products { get; set; } = [];
}
