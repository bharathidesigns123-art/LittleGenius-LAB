namespace LittleGeniusLab.Api.Models;

public sealed class Address
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Label { get; set; } = "Home";
    public string RecipientName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = "India";
    public string Pincode { get; set; } = string.Empty;
    public bool IsDefault { get; set; }

    public AppUser? User { get; set; }
}
