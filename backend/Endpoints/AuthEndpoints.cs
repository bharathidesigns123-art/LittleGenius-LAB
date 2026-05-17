using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Helpers;
using LittleGeniusLab.Api.Models;
using LittleGeniusLab.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace LittleGeniusLab.Api.Endpoints;

public static class AuthEndpoints
{
    private static readonly TimeSpan PasswordResetLifetime = TimeSpan.FromMinutes(30);

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

        group.MapPost("/forgot-password", async (
            ForgotPasswordRequest request,
            HttpContext httpContext,
            AppDbContext db,
            INotificationService notificationService) =>
        {
            var normalizedEmail = NormalizeEmail(request.Email);
            if (string.IsNullOrWhiteSpace(normalizedEmail))
            {
                return Results.BadRequest(new { message = "Enter a valid email address." });
            }

            var user = await db.Users.FirstOrDefaultAsync(item =>
                item.Email == normalizedEmail &&
                item.IsActive &&
                item.DeletedAtUtc == null);

            if (user is not null)
            {
                var plainToken = GenerateSecureToken();
                user.PasswordResetTokenHash = HashToken(plainToken);
                user.PasswordResetRequestedAtUtc = DateTime.UtcNow;
                user.PasswordResetExpiresAtUtc = DateTime.UtcNow.Add(PasswordResetLifetime);
                user.UpdatedAtUtc = DateTime.UtcNow;

                await db.SaveChangesAsync();

                var resetUrl = BuildResetUrl(httpContext, plainToken);
                await notificationService.SendPasswordResetEmailAsync(user.Id, resetUrl);
            }

            return Results.Ok(new
            {
                message = "If an account exists for that email, we have sent a password reset link."
            });
        });

        group.MapPost("/reset-password/validate", async (
            ValidateResetPasswordTokenRequest request,
            AppDbContext db) =>
        {
            var isValid = await db.Users.AnyAsync(user =>
                user.PasswordResetTokenHash == HashToken(request.Token) &&
                user.PasswordResetExpiresAtUtc != null &&
                user.PasswordResetExpiresAtUtc > DateTime.UtcNow &&
                user.IsActive &&
                user.DeletedAtUtc == null);

            return Results.Ok(new { isValid });
        });

        group.MapPost("/reset-password", async (
            ResetPasswordRequest request,
            AppDbContext db,
            IPasswordHasher<AppUser> passwordHasher) =>
        {
            var newPassword = request.Password?.Trim() ?? string.Empty;
            if (!IsValidPassword(newPassword))
            {
                return Results.BadRequest(new
                {
                    message = "Password must be at least 8 characters and include at least one letter and one number."
                });
            }

            var tokenHash = HashToken(request.Token);
            var user = await db.Users.FirstOrDefaultAsync(item =>
                item.PasswordResetTokenHash == tokenHash &&
                item.PasswordResetExpiresAtUtc != null &&
                item.PasswordResetExpiresAtUtc > DateTime.UtcNow);

            if (user is null || !user.IsActive || user.DeletedAtUtc is not null)
            {
                return Results.BadRequest(new { message = "This reset link is invalid or has expired." });
            }

            user.PasswordHash = passwordHasher.HashPassword(user, newPassword);
            user.PasswordResetTokenHash = null;
            user.PasswordResetRequestedAtUtc = null;
            user.PasswordResetExpiresAtUtc = null;
            user.UpdatedAtUtc = DateTime.UtcNow;

            await db.SaveChangesAsync();

            return Results.Ok(new { message = "Your password has been reset successfully. Please sign in." });
        });

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

    private static string NormalizeEmail(string? email) => email?.Trim().ToLowerInvariant() ?? string.Empty;

    private static bool IsValidPassword(string password) =>
        password.Length >= 8 &&
        password.Any(char.IsLetter) &&
        password.Any(char.IsDigit);

    private static string GenerateSecureToken()
    {
        Span<byte> bytes = stackalloc byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-", StringComparison.Ordinal)
            .Replace("/", "_", StringComparison.Ordinal)
            .TrimEnd('=');
    }

    private static string HashToken(string? token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token?.Trim() ?? string.Empty));
        return Convert.ToHexString(bytes);
    }

    private static string BuildResetUrl(HttpContext httpContext, string token)
    {
        var configuredFrontendUrl = httpContext.RequestServices
            .GetRequiredService<IConfiguration>()["FRONTEND_URL"];
        var baseUrl =
            FirstNonEmpty(
                configuredFrontendUrl,
                httpContext.Request.Headers.Origin.ToString(),
                $"{httpContext.Request.Scheme}://{httpContext.Request.Host}")
            ?.TrimEnd('/')
            ?? "http://localhost:3000";

        return $"{baseUrl}/reset-password?token={Uri.EscapeDataString(token)}";
    }

    private static string? FirstNonEmpty(params string?[] values) =>
        values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));

    public sealed record SignUpRequest(string FullName, string Email, string Phone, string Password);
    public sealed record LoginRequest(string Email, string Password);
    public sealed record ForgotPasswordRequest(string Email);
    public sealed record ValidateResetPasswordTokenRequest(string Token);
    public sealed record ResetPasswordRequest(string Token, string Password);
    public sealed record UserDto(int Id, string FullName, string Email, string Phone, string Role);
    public sealed record AuthResponse(string Token, UserDto User);
}
