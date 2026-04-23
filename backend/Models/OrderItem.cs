namespace LittleGeniusLab.Api.Models;

public sealed class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSlug { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPriceInr { get; set; }
    public decimal TotalPriceInr { get; set; }

    public Order? Order { get; set; }
    public Product? Product { get; set; }
}
