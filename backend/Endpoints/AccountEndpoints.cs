using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Helpers;
using LittleGeniusLab.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LittleGeniusLab.Api.Endpoints;

public static class AccountEndpoints
{
    public static IEndpointRouteBuilder MapAccountEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/account").RequireAuthorization();

        group.MapGet("/profile", async (HttpContext context, AppDbContext db) =>
        {
            var userId = context.User.GetUserId();
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var user = await db.Users
                .AsNoTracking()
                .Include(item => item.Addresses)
                .FirstOrDefaultAsync(item => item.Id == userId.Value);

            if (user is null)
            {
                return Results.NotFound(new { message = "User not found." });
            }

            return Results.Ok(new
            {
                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.Phone,
                    user.Role
                },
                addresses = user.Addresses.Select(address => new
                {
                    address.Id,
                    address.Label,
                    address.RecipientName,
                    address.Phone,
                    address.Line1,
                    address.Line2,
                    address.City,
                    address.State,
                    address.Country,
                    address.Pincode,
                    address.IsDefault
                })
            });
        });

        group.MapPut("/profile", async (
            HttpContext context,
            UpdateProfileRequest request,
            AppDbContext db) =>
        {
            var userId = context.User.GetUserId();
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var user = await db.Users.FirstOrDefaultAsync(item => item.Id == userId.Value);
            if (user is null)
            {
                return Results.NotFound(new { message = "User not found." });
            }

            user.FullName = request.FullName.Trim();
            user.Phone = request.Phone.Trim();
            await db.SaveChangesAsync();

            return Results.Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Phone,
                user.Role
            });
        });

        group.MapGet("/orders", async (HttpContext context, AppDbContext db, IConfiguration configuration) =>
        {
            var userId = context.User.GetUserId();
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var user = await db.Users
                .AsNoTracking()
                .Where(item => item.Id == userId.Value)
                .Select(item => new { item.Email, item.Phone })
                .FirstOrDefaultAsync();

            if (user is null)
            {
                return Results.NotFound(new { message = "User not found." });
            }

            var standardOrders = await db.Orders
                .AsNoTracking()
                .Include(order => order.Items)
                .Where(order => order.UserId == userId.Value)
                .OrderByDescending(order => order.CreatedAtUtc)
                .Select(order => new AccountOrderListItem(
                    order.Id,
                    "standard",
                    order.OrderCode,
                    order.CustomerName,
                    order.Email,
                    order.Phone,
                    order.Status,
                    order.PaymentStatus,
                    order.PaymentMethod,
                    order.SubtotalInr,
                    order.ShippingFeeInr,
                    order.TotalPriceInr,
                    order.Notes,
                    order.CreatedAtUtc,
                    order.TrackingNumber,
                    order.RefundStatus,
                    order.CancellationReason,
                    order.CancelledAtUtc,
                    order.ShippedAtUtc,
                    order.DeliveredAtUtc,
                    IsCancellationAllowed(order.Status, configuration),
                    new ShippingAddressDto(
                        order.CustomerName,
                        order.Email,
                        order.Phone,
                        order.Line1,
                        order.Line2,
                        order.City,
                        order.State,
                        order.Country,
                        order.Pincode),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    order.Items.Select(item => new AccountOrderItemDto(
                        item.ProductName,
                        item.Quantity,
                        item.TotalPriceInr)).ToList()))
                .ToListAsync();

            var customOrders = await db.CustomOrderRequests
                .AsNoTracking()
                .Where(order =>
                    order.UserId == userId.Value ||
                    order.Email == user.Email ||
                    order.WhatsAppNumber == user.Phone)
                .OrderByDescending(order => order.CreatedAtUtc)
                .Select(order => new AccountOrderListItem(
                    order.Id,
                    "custom",
                    order.ReferenceCode,
                    order.Name,
                    order.Email,
                    order.WhatsAppNumber,
                    order.Status,
                    order.QuoteAmountInr == null ? "Quote Pending" : "Quote Shared",
                    "Custom Order",
                    order.QuoteAmountInr,
                    null,
                    order.QuoteAmountInr ?? 0,
                    order.AdminNotes,
                    order.CreatedAtUtc,
                    order.TrackingNumber,
                    order.RefundStatus,
                    order.CancellationReason,
                    order.CancelledAtUtc,
                    order.ShippedAtUtc,
                    order.DeliveredAtUtc,
                    false,
                    null,
                    order.Occasion,
                    order.Size,
                    order.ColorPreference,
                    order.CharacterDescription,
                    order.PhotoUrl,
                    order.BaseMessage,
                    new List<AccountOrderItemDto>
                    {
                        new(
                            string.IsNullOrWhiteSpace(order.CharacterDescription)
                                ? "Custom 3D printed toy request"
                                : order.CharacterDescription,
                            1,
                            order.QuoteAmountInr ?? 0)
                    }))
                .ToListAsync();

            var orders = standardOrders
                .Concat(customOrders)
                .OrderByDescending(order => order.CreatedAtUtc)
                .ToList();

            return Results.Ok(orders);
        });

        group.MapGet("/custom-orders", async (HttpContext context, AppDbContext db) =>
        {
            var userId = context.User.GetUserId();
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var customOrders = await db.CustomOrderRequests
                .AsNoTracking()
                .Where(order => order.UserId == userId.Value)
                .OrderByDescending(order => order.CreatedAtUtc)
                .Select(order => new
                {
                    order.Id,
                    order.ReferenceCode,
                    order.Name,
                    order.Email,
                    order.WhatsAppNumber,
                    order.Occasion,
                    order.Size,
                    order.ColorPreference,
                    order.CharacterDescription,
                    order.PhotoUrl,
                    order.BaseMessage,
                    order.Pincode,
                    order.Status,
                    order.QuoteAmountInr,
                    order.AdminNotes,
                    order.CreatedAtUtc,
                    order.UpdatedAtUtc
                })
                .ToListAsync();

            return Results.Ok(customOrders);
        });

        group.MapPost("/orders/{id:int}/cancel", async (
            int id,
            HttpContext context,
            CancelOrderRequest request,
            AppDbContext db,
            IConfiguration configuration) =>
        {
            var userId = context.User.GetUserId();
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var order = await db.Orders
                .Include(item => item.Items)
                .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId.Value);

            if (order is null)
            {
                return Results.NotFound(new { message = "Order not found." });
            }

            var cancelResult = await CancelOrderAsync(order, request.Reason, db, configuration);
            return cancelResult is not null ? cancelResult : Results.Ok(MapOrderCancellation(order, configuration));
        });

        return routes;
    }

    public sealed record UpdateProfileRequest(string FullName, string Phone);
    public sealed record CancelOrderRequest(string? Reason);
    private sealed record ShippingAddressDto(
        string CustomerName,
        string Email,
        string Phone,
        string Line1,
        string? Line2,
        string City,
        string State,
        string Country,
        string Pincode);
    private sealed record AccountOrderItemDto(string ProductName, int Quantity, decimal TotalPriceInr);
    private sealed record AccountOrderListItem(
        int Id,
        string OrderType,
        string OrderCode,
        string? CustomerName,
        string? Email,
        string? Phone,
        string Status,
        string PaymentStatus,
        string PaymentMethod,
        decimal? SubtotalInr,
        decimal? ShippingFeeInr,
        decimal TotalPriceInr,
        string? Notes,
        DateTime CreatedAtUtc,
        string? TrackingNumber,
        string? RefundStatus,
        string? CancellationReason,
        DateTime? CancelledAtUtc,
        DateTime? ShippedAtUtc,
        DateTime? DeliveredAtUtc,
        bool CancellationEligible,
        ShippingAddressDto? ShippingAddress,
        string? Occasion,
        string? Size,
        string? ColorPreference,
        string? CharacterDescription,
        string? PhotoUrl,
        string? BaseMessage,
        List<AccountOrderItemDto> Items);

    private static bool IsCancellationAllowed(string status, IConfiguration configuration)
    {
        if (status == OrderStatuses.Cancelled || status == OrderStatuses.Delivered)
        {
            return false;
        }

        var allowAfterShipment = configuration.GetValue("Orders:AllowCancellationAfterShipment", false);
        return allowAfterShipment || status is not OrderStatuses.Shipped;
    }

    private static async Task<IResult?> CancelOrderAsync(
        Order order,
        string? reason,
        AppDbContext db,
        IConfiguration configuration)
    {
        if (!IsCancellationAllowed(order.Status, configuration))
        {
            return Results.BadRequest(new { message = "This order is no longer eligible for cancellation." });
        }

        if (order.Status == OrderStatuses.Cancelled)
        {
            return Results.BadRequest(new { message = "This order is already cancelled." });
        }

        foreach (var item in order.Items)
        {
            var product = await db.Products.FirstOrDefaultAsync(product => product.Id == item.ProductId);
            if (product is not null)
            {
                product.StockQuantity += item.Quantity;
                product.UpdatedAtUtc = DateTime.UtcNow;
            }
        }

        order.Status = OrderStatuses.Cancelled;
        order.RefundStatus = order.PaymentStatus == PaymentStatuses.Paid
            ? RefundStatuses.Pending
            : RefundStatuses.Approved;
        order.CancellationReason = string.IsNullOrWhiteSpace(reason) ? "Customer requested cancellation." : reason.Trim();
        order.CancelledAtUtc = DateTime.UtcNow;
        order.UpdatedAtUtc = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return null;
    }

    private static object MapOrderCancellation(Order order, IConfiguration configuration) => new
    {
        order.Id,
        order.OrderCode,
        order.Status,
        order.RefundStatus,
        order.CancellationReason,
        order.CancelledAtUtc,
        cancellationEligible = IsCancellationAllowed(order.Status, configuration)
    };
}
