using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using LittleGeniusLab.Api.Configuration;
using Microsoft.Extensions.Options;

namespace LittleGeniusLab.Api.Services;

public sealed class RazorpayService(HttpClient httpClient, IOptions<RazorpayOptions> options)
{
    private readonly RazorpayOptions _options = options.Value;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_options.KeyId) &&
        !string.IsNullOrWhiteSpace(_options.KeySecret);

    public string PublicKeyId => _options.KeyId;
    public string CallbackUrl => _options.CallbackUrl;

    public async Task<RazorpayOrderResult> CreateOrderAsync(
        string receipt,
        decimal amountInr,
        CancellationToken cancellationToken)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("Razorpay is not configured.");
        }

        var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_options.KeyId}:{_options.KeySecret}"));
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.razorpay.com/v1/orders");
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);

        var payload = JsonSerializer.Serialize(new
        {
            amount = decimal.ToInt32(amountInr * 100),
            currency = "INR",
            receipt,
            notes = new
            {
                source = "LittleGenius LAB"
            }
        });

        request.Content = new StringContent(payload, Encoding.UTF8, "application/json");
        using var response = await httpClient.SendAsync(request, cancellationToken);
        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Razorpay order creation failed: {content}");
        }

        using var document = JsonDocument.Parse(content);
        var root = document.RootElement;

        return new RazorpayOrderResult(
            ProviderOrderId: root.GetProperty("id").GetString() ?? string.Empty,
            AmountInPaise: root.GetProperty("amount").GetInt32(),
            Currency: root.GetProperty("currency").GetString() ?? "INR");
    }

    public bool VerifySignature(string orderId, string paymentId, string signature)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("Razorpay is not configured.");
        }

        var payload = $"{orderId}|{paymentId}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_options.KeySecret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var generatedSignature = Convert.ToHexString(hash).ToLowerInvariant();

        return generatedSignature == signature;
    }
}

public sealed record RazorpayOrderResult(
    string ProviderOrderId,
    int AmountInPaise,
    string Currency);
