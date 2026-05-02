using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Helpers;
using LittleGeniusLab.Api.Models;
using LittleGeniusLab.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LittleGeniusLab.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/auth");

        group.MapPost("/signup", async (
            SignUpRequest request,
            AppDbContext db,
            IPasswordHasher<AppUser> passwordHasher,
            JwtTokenService tokenService,
            INotificationQueue notificationQueue) =>
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            if (await db.Users.AnyAsync(user => user.Email == normalizedEmail && user.DeletedAtUtc == null))
            {
                return Results.BadRequest(new { message = "An account with this email already exists." });
            }

            var user = new AppUser
            {
                FullName = request.FullName.Trim(),
                Email = normalizedEmail,
                Phone = request.Phone.Trim(),
                Role = AppRoles.Customer,
                UpdatedAtUtc = DateTime.UtcNow
            };
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

            db.Users.Add(user);
            await db.SaveChangesAsync();
            await notificationQueue.EnqueueAsync(new NotificationJob(NotificationJobKind.WelcomeEmail, user.Id));

            var token = tokenService.CreateToken(user);
            return Results.Ok(new AuthResponse(
                Token: token,
                User: new UserDto(user.Id, user.FullName, user.Email, user.Phone, user.Role)));
        });

        group.MapPost("/login", async (
            LoginRequest request,
            AppDbContext db,
            IPasswordHasher<AppUser> passwordHasher,
            JwtTokenService tokenService,
            INotificationQueue notificationQueue) =>
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var user = await db.Users.FirstOrDefaultAsync(item => item.Email == normalizedEmail);

            if (user is null || !user.IsActive || user.DeletedAtUtc is not null)
            {
                return Results.BadRequest(new { message = "Invalid email or password." });
            }

            var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return Results.BadRequest(new { message = "Invalid email or password." });
            }

            var token = tokenService.CreateToken(user);
            await notificationQueue.EnqueueAsync(new NotificationJob(NotificationJobKind.LoginAlert, user.Id));
            return Results.Ok(new AuthResponse(
                Token: token,
                User: new UserDto(user.Id, user.FullName, user.Email, user.Phone, user.Role)));
        });

        group.MapPost("/logout", () => Results.Ok(new { message = "Logged out successfully." }));

        group.MapGet("/me", async (HttpContext context, AppDbContext db) =>
        {
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                return Results.Unauthorized();
            }

            var userId = context.User.GetUserId();
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var user = await db.Users
                .Include(item => item.Addresses)
                .FirstOrDefaultAsync(item => item.Id == userId.Value);

            if (user is null)
            {
                return Results.NotFound(new { message = "User not found." });
            }

            if (!user.IsActive || user.DeletedAtUtc is not null)
            {
                return Results.Json(
                    new { message = "Your account has been disabled. Contact support if you need help." },
                    statusCode: StatusCodes.Status403Forbidden);
            }

            return Results.Ok(new
            {
                user = new UserDto(user.Id, user.FullName, user.Email, user.Phone, user.Role),
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
        }).RequireAuthorization();

        return routes;
    }

    public sealed record SignUpRequest(string FullName, string Email, string Phone, string Password);
    public sealed record LoginRequest(string Email, string Password);
    public sealed record UserDto(int Id, string FullName, string Email, string Phone, string Role);
    public sealed record AuthResponse(string Token, UserDto User);
}
