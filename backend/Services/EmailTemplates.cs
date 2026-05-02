using System.Net;
using LittleGeniusLab.Api.Models;

namespace LittleGeniusLab.Api.Services;

public static class EmailTemplates
{
    public static EmailContent Welcome(AppUser user) => new(
        "Welcome to LittleGenius LAB",
        HtmlLayout(
            "Welcome to LittleGenius LAB",
            $"""
            <p>Hi {Encode(user.FullName)},</p>
            <p>Thanks for creating your LittleGenius LAB account. Your playful shelf of handcrafted 3D printed toys is ready when you are.</p>
            <p>We will keep your orders, custom requests, and delivery updates in one place.</p>
            """));

    public static EmailContent LoginAlert(AppUser user) => new(
        "Security alert: new login",
        HtmlLayout(
            "New login detected",
            $"""
            <p>Hi {Encode(user.FullName)},</p>
            <p>Your LittleGenius LAB account was just signed in.</p>
            <p>If this was not you, please change your password or contact support.</p>
            """));

    public static EmailContent OrderConfirmation(Order order) => new(
        $"Order Confirmed: {order.OrderCode}",
        HtmlLayout(
            "Order Confirmed",
            $"""
            <p>Hi {Encode(order.CustomerName)},</p>
            <p>Your order <strong>{Encode(order.OrderCode)}</strong> has been placed successfully.</p>
            {OrderSummary(order)}
            """));

    public static EmailContent OrderStatusUpdate(Order order) => new(
        $"Order {order.OrderCode}: {order.Status}",
        HtmlLayout(
            $"Order {Encode(order.Status)}",
            $"""
            <p>Hi {Encode(order.CustomerName)},</p>
            <p>Your order <strong>{Encode(order.OrderCode)}</strong> is now <strong>{Encode(order.Status)}</strong>.</p>
            {TrackingLine(order)}
            """));

    public static EmailContent AdminNewOrder(Order order) => new(
        $"New order alert: {order.OrderCode}",
        HtmlLayout(
            "New Order Alert",
            $"""
            <p>A new order has been placed.</p>
            <p><strong>Customer:</strong> {Encode(order.CustomerName)}<br />
            <strong>Email:</strong> {Encode(order.Email)}<br />
            <strong>Phone:</strong> {Encode(order.Phone)}</p>
            {OrderSummary(order)}
            """));

    public static string SmsOrderPlaced(Order order) =>
        $"Your order {order.OrderCode} has been placed successfully.";

    public static string SmsOrderStatus(Order order) =>
        order.Status switch
        {
            OrderStatuses.Shipped => $"Your order {order.OrderCode} has been shipped.",
            OrderStatuses.Delivered => $"Your order {order.OrderCode} has been delivered.",
            OrderStatuses.Cancelled => $"Your order {order.OrderCode} has been cancelled.",
            _ => $"Your order {order.OrderCode} is now {order.Status}."
        };

    private static string OrderSummary(Order order)
    {
        var items = string.Join(
            "",
            order.Items.Select(item =>
                $"<li>{Encode(item.ProductName)} x {item.Quantity} - Rs. {item.TotalPriceInr:N0}</li>"));

        return $"""
        <p><strong>Order ID:</strong> {Encode(order.OrderCode)}</p>
        <ul>{items}</ul>
        <p><strong>Total Amount:</strong> Rs. {order.TotalPriceInr:N0}</p>
        """;
    }

    private static string TrackingLine(Order order) =>
        string.IsNullOrWhiteSpace(order.TrackingNumber)
            ? string.Empty
            : $"<p><strong>Tracking:</strong> {Encode(order.TrackingNumber)}</p>";

    private static string HtmlLayout(string title, string body) =>
        $"""
        <!doctype html>
        <html>
        <body style="font-family:Arial,sans-serif;color:#1f2933;line-height:1.55">
          <div style="max-width:640px;margin:0 auto;padding:24px">
            <h1 style="color:#1A3C6E">{Encode(title)}</h1>
            {body}
            <p style="margin-top:28px;color:#64748b;font-size:13px">LittleGenius LAB</p>
          </div>
        </body>
        </html>
        """;

    private static string Encode(string value) => WebUtility.HtmlEncode(value);
}

public sealed record EmailContent(string Subject, string HtmlBody);
