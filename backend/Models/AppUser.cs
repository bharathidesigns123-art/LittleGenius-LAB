namespace LittleGeniusLab.Api.Models;

public sealed class AppUser
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = AppRoles.Customer;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public List<Address> Addresses { get; set; } = [];
    public List<Order> Orders { get; set; } = [];
    public List<CustomOrderRequest> CustomOrderRequests { get; set; } = [];
    public List<ProductReview> Reviews { get; set; } = [];
}
