namespace LittleGeniusLab.Api.Models;

public sealed class AppUser
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PasswordResetTokenHash { get; set; }
    public DateTime? PasswordResetRequestedAtUtc { get; set; }
    public DateTime? PasswordResetExpiresAtUtc { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = AppRoles.Customer;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    /// <summary>When set, the account is soft-deleted and cannot sign in.</summary>
    public DateTime? DeletedAtUtc { get; set; }

    public List<Address> Addresses { get; set; } = [];
    public List<Order> Orders { get; set; } = [];
    public List<CustomOrderRequest> CustomOrderRequests { get; set; } = [];
    public List<ProductReview> Reviews { get; set; } = [];
}
