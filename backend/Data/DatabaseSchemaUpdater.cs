using System.Data;
using Microsoft.EntityFrameworkCore;

namespace LittleGeniusLab.Api.Data;

public static class DatabaseSchemaUpdater
{
    public static async Task ApplyAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (!db.Database.IsRelational())
        {
            return;
        }

        if (db.Database.IsSqlite())
        {
            await EnsureSqliteProductImagesTableAsync(db, cancellationToken);
            await ApplySqliteReviewUpgradeAsync(db, cancellationToken);
            return;
        }

        if (db.Database.IsSqlServer())
        {
            await EnsureSqlServerProductImagesTableAsync(db, cancellationToken);
            await ApplySqlServerReviewUpgradeAsync(db, cancellationToken);
        }
    }

    private static async Task EnsureSqliteProductImagesTableAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        await db.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS "ProductImages" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_ProductImages" PRIMARY KEY AUTOINCREMENT,
                "ProductId" INTEGER NOT NULL,
                "ImageUrl" TEXT NOT NULL,
                "SortOrder" INTEGER NOT NULL DEFAULT 0,
                "Width" INTEGER NOT NULL DEFAULT 0,
                "Height" INTEGER NOT NULL DEFAULT 0,
                "CreatedAtUtc" TEXT NOT NULL DEFAULT '1970-01-01T00:00:00Z',
                CONSTRAINT "FK_ProductImages_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products" ("Id") ON DELETE CASCADE
            );
            """,
            cancellationToken);

        await db.Database.ExecuteSqlRawAsync(
            "CREATE INDEX IF NOT EXISTS \"IX_ProductImages_ProductId\" ON \"ProductImages\" (\"ProductId\");",
            cancellationToken);
        await db.Database.ExecuteSqlRawAsync(
            "CREATE INDEX IF NOT EXISTS \"IX_ProductImages_ProductId_SortOrder\" ON \"ProductImages\" (\"ProductId\", \"SortOrder\");",
            cancellationToken);
    }

    private static async Task EnsureSqlServerProductImagesTableAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[dbo].[ProductImages]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[ProductImages] (
                    [Id] int NOT NULL IDENTITY,
                    [ProductId] int NOT NULL,
                    [ImageUrl] nvarchar(max) NOT NULL,
                    [SortOrder] int NOT NULL CONSTRAINT [DF_ProductImages_SortOrder] DEFAULT 0,
                    [Width] int NOT NULL CONSTRAINT [DF_ProductImages_Width] DEFAULT 0,
                    [Height] int NOT NULL CONSTRAINT [DF_ProductImages_Height] DEFAULT 0,
                    [CreatedAtUtc] datetime2 NOT NULL CONSTRAINT [DF_ProductImages_CreatedAtUtc] DEFAULT SYSUTCDATETIME(),
                    CONSTRAINT [PK_ProductImages] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_ProductImages_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products] ([Id]) ON DELETE CASCADE
                );
            END
            """,
            cancellationToken);

        await db.Database.ExecuteSqlRawAsync(
            "IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProductImages_ProductId' AND object_id = OBJECT_ID('dbo.ProductImages')) CREATE INDEX [IX_ProductImages_ProductId] ON [ProductImages] ([ProductId]);",
            cancellationToken);
        await db.Database.ExecuteSqlRawAsync(
            "IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProductImages_ProductId_SortOrder' AND object_id = OBJECT_ID('dbo.ProductImages')) CREATE INDEX [IX_ProductImages_ProductId_SortOrder] ON [ProductImages] ([ProductId], [SortOrder]);",
            cancellationToken);
    }

    private static async Task ApplySqliteReviewUpgradeAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var columns = await GetSqliteColumnsAsync(db, "Reviews", cancellationToken);
        if (columns.Count == 0)
        {
            return;
        }

        if (!columns.Contains("UserId"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE \"Reviews\" ADD COLUMN \"UserId\" INTEGER NULL;",
                cancellationToken);
        }

        if (!columns.Contains("OrderId"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE \"Reviews\" ADD COLUMN \"OrderId\" INTEGER NULL;",
                cancellationToken);
        }

        if (!columns.Contains("IsVerifiedPurchase"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE \"Reviews\" ADD COLUMN \"IsVerifiedPurchase\" INTEGER NOT NULL DEFAULT 0;",
                cancellationToken);
        }

        if (!columns.Contains("UpdatedAtUtc"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE \"Reviews\" ADD COLUMN \"UpdatedAtUtc\" TEXT NOT NULL DEFAULT '1970-01-01T00:00:00Z';",
                cancellationToken);
            await db.Database.ExecuteSqlRawAsync(
                "UPDATE \"Reviews\" SET \"UpdatedAtUtc\" = COALESCE(\"CreatedAtUtc\", '1970-01-01T00:00:00Z') WHERE \"UpdatedAtUtc\" = '1970-01-01T00:00:00Z';",
                cancellationToken);
        }

        await db.Database.ExecuteSqlRawAsync(
            "CREATE INDEX IF NOT EXISTS \"IX_Reviews_OrderId\" ON \"Reviews\" (\"OrderId\");",
            cancellationToken);
        await db.Database.ExecuteSqlRawAsync(
            "CREATE INDEX IF NOT EXISTS \"IX_Reviews_UserId\" ON \"Reviews\" (\"UserId\");",
            cancellationToken);
        await db.Database.ExecuteSqlRawAsync(
            "CREATE INDEX IF NOT EXISTS \"IX_Reviews_ProductId_OrderId_UserId\" ON \"Reviews\" (\"ProductId\", \"OrderId\", \"UserId\");",
            cancellationToken);
    }

    private static async Task ApplySqlServerReviewUpgradeAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var columns = await GetSqlServerColumnsAsync(db, "Reviews", cancellationToken);
        if (columns.Count == 0)
        {
            return;
        }

        if (!columns.Contains("UserId"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [Reviews] ADD [UserId] int NULL;",
                cancellationToken);
        }

        if (!columns.Contains("OrderId"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [Reviews] ADD [OrderId] int NULL;",
                cancellationToken);
        }

        if (!columns.Contains("IsVerifiedPurchase"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [Reviews] ADD [IsVerifiedPurchase] bit NOT NULL CONSTRAINT [DF_Reviews_IsVerifiedPurchase] DEFAULT 0;",
                cancellationToken);
        }

        if (!columns.Contains("UpdatedAtUtc"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [Reviews] ADD [UpdatedAtUtc] datetime2 NOT NULL CONSTRAINT [DF_Reviews_UpdatedAtUtc] DEFAULT SYSUTCDATETIME();",
                cancellationToken);
        }

        await db.Database.ExecuteSqlRawAsync(
            "IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reviews_OrderId' AND object_id = OBJECT_ID('dbo.Reviews')) CREATE INDEX [IX_Reviews_OrderId] ON [Reviews] ([OrderId]);",
            cancellationToken);
        await db.Database.ExecuteSqlRawAsync(
            "IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reviews_UserId' AND object_id = OBJECT_ID('dbo.Reviews')) CREATE INDEX [IX_Reviews_UserId] ON [Reviews] ([UserId]);",
            cancellationToken);
        await db.Database.ExecuteSqlRawAsync(
            "IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reviews_ProductId_OrderId_UserId' AND object_id = OBJECT_ID('dbo.Reviews')) CREATE INDEX [IX_Reviews_ProductId_OrderId_UserId] ON [Reviews] ([ProductId], [OrderId], [UserId]);",
            cancellationToken);
    }

    private static async Task<HashSet<string>> GetSqliteColumnsAsync(
        AppDbContext db,
        string tableName,
        CancellationToken cancellationToken)
    {
        var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        await using var connection = db.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        await using var command = connection.CreateCommand();
        command.CommandText = $"PRAGMA table_info(\"{tableName}\");";

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            columns.Add(reader.GetString(1));
        }

        return columns;
    }

    private static async Task<HashSet<string>> GetSqlServerColumnsAsync(
        AppDbContext db,
        string tableName,
        CancellationToken cancellationToken)
    {
        var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var connection = db.Database.GetDbConnection();
        
        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @tableName
            """;

        var parameter = command.CreateParameter();
        parameter.ParameterName = "@tableName";
        parameter.Value = tableName;
        command.Parameters.Add(parameter);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            columns.Add(reader.GetString(0));
        }

        return columns;
    }
}
