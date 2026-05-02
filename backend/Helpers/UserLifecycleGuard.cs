using LittleGeniusLab.Api.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace LittleGeniusLab.Api.Helpers;

public static class UserLifecycleGuard
{
    public static async Task<IResult?> RejectIfCustomerDisabledAsync(
        AppDbContext db,
        int? userId,
        CancellationToken cancellationToken = default)
    {
        if (userId is null)
        {
            return null;
        }

        var allowed = await db.Users.AnyAsync(
            user => user.Id == userId.Value && user.IsActive && user.DeletedAtUtc == null,
            cancellationToken);

        return allowed
            ? null
            : Results.Json(
                new { message = "Your account has been disabled. Contact support if you need help." },
                statusCode: StatusCodes.Status403Forbidden);
    }
}
