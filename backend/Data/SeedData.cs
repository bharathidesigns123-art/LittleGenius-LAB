using LittleGeniusLab.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LittleGeniusLab.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext db)
    {
        if (await db.Categories.AnyAsync())
        {
            return;
        }

        // Add any necessary initialization logic here
        // All hardcoded data has been removed

        await db.SaveChangesAsync();
    }
}
