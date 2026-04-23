using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Helpers;
using LittleGeniusLab.Api.Models;
using LittleGeniusLab.Api.Services;
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
            JwtTokenService tokenService) =>
        {
            if (await db.Users.AnyAsync(user => user.Email == request.Email.Trim().ToLowerInvariant()))
            {
                return Results.BadRequest(new { message = "An account with this email already exists." });
            }

            var user = new AppUser
            {
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim().ToLowerInvariant(),
                Phone = request.Phone.Trim(),
                Role = AppRoles.Customer
            };
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

            db.Users.Add(user);
            await db.SaveChangesAsync();

            var token = tokenService.CreateToken(user);
            return Results.Ok(new AuthResponse(
                Token: token,
                User: new UserDto(user.Id, user.FullName, user.Email, user.Phone, user.Role)));
        });

        group.MapPost("/login", async (
            LoginRequest request,
            AppDbContext db,
            IPasswordHasher<AppUser> passwordHasher,
            JwtTokenService tokenService) =>
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var user = await db.Users.FirstOrDefaultAsync(item => item.Email == normalizedEmail);

            if (user is null || !user.IsActive)
            {
                return Results.BadRequest(new { message = "Invalid email or password." });
            }

            var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return Results.BadRequest(new { message = "Invalid email or password." });
            }

            var token = tokenService.CreateToken(user);
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
