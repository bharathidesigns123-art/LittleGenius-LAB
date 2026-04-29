using System.Net.Http.Headers;
using System.Text.Json;
using LittleGeniusLab.Api.Models;

namespace LittleGeniusLab.Api.Services;

/// <summary>
/// Service to handle Shiprocket logistics integration for India-wide shipping.
/// </summary>
public sealed class ShiprocketService(HttpClient httpClient, IConfiguration configuration)
{
    private string? _cachedToken;
    private DateTime _tokenExpiry = DateTime.MinValue;

    private async Task<string> GetTokenAsync()
    {
        if (!string.IsNullOrEmpty(_cachedToken) && _tokenExpiry > DateTime.UtcNow)
        {
            return _cachedToken;
        }

        var payload = new
        {
            email = configuration["Shiprocket:Email"],
            password = configuration["Shiprocket:Password"]
        };

        var response = await httpClient.PostAsJsonAsync("https://apiv2.shiprocket.in/v1/external/auth/login", payload);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        _cachedToken = content.GetProperty("token").GetString();
        _tokenExpiry = DateTime.UtcNow.AddDays(9); // Shiprocket tokens are usually valid for 10 days

        return _cachedToken!;
    }

    public async Task<string?> CreateOrderAndGenerateAwbAsync(Order order)
    {
        var token = await GetTokenAsync();
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var payload = new
        {
            order_id = order.OrderCode,
            order_date = order.CreatedAtUtc.ToString("yyyy-MM-dd HH:mm"),
            pickup_location = "Primary", // Configure this in Shiprocket Panel
            billing_customer_name = order.CustomerName,
            billing_last_name = "",
            billing_address = order.Line1,
            billing_address_2 = order.Line2 ?? "",
            billing_city = order.City,
            billing_pincode = order.Pincode,
            billing_state = order.State,
            billing_country = "India",
            billing_email = order.Email,
            billing_phone = order.Phone,
            shipping_is_billing = true,
            order_items = order.Items.Select(item => new
            {
                name = item.ProductName,
                sku = $"SKU-{item.Id}",
                units = item.Quantity,
                selling_price = item.TotalPriceInr / item.Quantity,
                discount = 0,
                tax = 0,
                hsn = 9503 // Standard HSN for Toys
            }).ToList(),
            payment_method = order.PaymentMethod == "Cash on Delivery" ? "COD" : "Prepaid",
            shipping_charges = order.ShippingFeeInr,
            total_discount = 0,
            sub_total = order.SubtotalInr,
            length = 15, // Default dimensions for 3D printed toys
            width = 15,
            height = 10,
            weight = order.PackageWeightKg ?? 0.5m
        };

        var response = await httpClient.PostAsJsonAsync("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", payload);
        
        if (!response.IsSuccessStatusCode) return null;

        var result = await response.Content.ReadFromJsonAsync<JsonElement>();
        
        // Return AWB code if generated successfully
        if (result.TryGetProperty("awb_code", out var awbProp))
        {
            return awbProp.GetString();
        }

        return null;
    }
}
