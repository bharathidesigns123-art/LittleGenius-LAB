using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Helpers;
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

        group.MapGet("/orders", async (HttpContext context, AppDbContext db) =>
        {
            var userId = context.User.GetUserId();
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var orders = await db.Orders
                .AsNoTracking()
                .Include(order => order.Items)
                .Where(order => order.UserId == userId.Value)
                .OrderByDescending(order => order.CreatedAtUtc)
                .Select(order => new
                {
                    order.Id,
                    order.OrderCode,
                    order.Status,
                    order.PaymentStatus,
                    order.PaymentMethod,
                    order.TotalPriceInr,
                    order.CreatedAtUtc,
                    order.TrackingNumber,
                    items = order.Items.Select(item => new
                    {
                        item.ProductName,
                        item.Quantity,
                        item.TotalPriceInr
                    })
                })
                .ToListAsync();

            return Results.Ok(orders);
        });

        return routes;
    }

    public sealed record UpdateProfileRequest(string FullName, string Phone);
}
