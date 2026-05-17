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

        if (db.Database.IsSqlServer())
        {
            await EnsureSqlServerNotificationLogsTableAsync(db, cancellationToken);
            await EnsureSqlServerProductImagesTableAsync(db, cancellationToken);
            await ApplySqlServerReviewUpgradeAsync(db, cancellationToken);
            await ApplySqlServerOrderFulfillmentUpgradeAsync(db, cancellationToken);
            await ApplySqlServerCustomOrderFulfillmentUpgradeAsync(db, cancellationToken);
            await ApplySqlServerPaymentTransactionPayFirstUpgradeAsync(db, cancellationToken);
            await ApplySqlServerUsersManagementUpgradeAsync(db, cancellationToken);
        }

        if (db.Database.IsSqlite())
        {
            await ApplySqlitePaymentTransactionUpgradeAsync(db, cancellationToken);
            await ApplySqliteUsersPasswordResetUpgradeAsync(db, cancellationToken);
        }
    }

    private static async Task EnsureSqlServerNotificationLogsTableAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[dbo].[NotificationLogs]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[NotificationLogs] (
                    [Id] int NOT NULL IDENTITY,
                    [Type] nvarchar(16) NOT NULL,
                    [EventName] nvarchar(80) NOT NULL,
                    [Recipient] nvarchar(320) NOT NULL,
                    [Status] nvarchar(16) NOT NULL,
                    [Message] nvarchar(1000) NOT NULL,
                    [AttemptCount] int NOT NULL CONSTRAINT [DF_NotificationLogs_AttemptCount] DEFAULT 0,
                    [Error] nvarchar(max) NULL,
                    [CreatedAtUtc] datetime2 NOT NULL CONSTRAINT [DF_NotificationLogs_CreatedAtUtc] DEFAULT SYSUTCDATETIME(),
                    [SentAtUtc] datetime2 NULL,
                    CONSTRAINT [PK_NotificationLogs] PRIMARY KEY ([Id])
                );
            END
            """,
            cancellationToken);

        await db.Database.ExecuteSqlRawAsync(
            "IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_NotificationLogs_Status' AND object_id = OBJECT_ID('dbo.NotificationLogs')) CREATE INDEX [IX_NotificationLogs_Status] ON [NotificationLogs] ([Status]);",
            cancellationToken);
        await db.Database.ExecuteSqlRawAsync(
            "IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_NotificationLogs_CreatedAtUtc' AND object_id = OBJECT_ID('dbo.NotificationLogs')) CREATE INDEX [IX_NotificationLogs_CreatedAtUtc] ON [NotificationLogs] ([CreatedAtUtc]);",
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

    private static async Task ApplySqlServerOrderFulfillmentUpgradeAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var columns = await GetSqlServerColumnsAsync(db, "Orders", cancellationToken);
        if (columns.Count == 0)
        {
            return;
        }

        var statements = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["GuestId"] = "ALTER TABLE [Orders] ADD [GuestId] nvarchar(64) NULL;",
            ["PackageWeightKg"] = "ALTER TABLE [Orders] ADD [PackageWeightKg] decimal(18,2) NULL;",
            ["PackageDimensionsCm"] = "ALTER TABLE [Orders] ADD [PackageDimensionsCm] nvarchar(80) NULL;",
            ["CourierPartner"] = "ALTER TABLE [Orders] ADD [CourierPartner] nvarchar(120) NULL;",
            ["RefundStatus"] = "ALTER TABLE [Orders] ADD [RefundStatus] nvarchar(32) NOT NULL CONSTRAINT [DF_Orders_RefundStatus] DEFAULT 'NotRequested';",
            ["CancellationReason"] = "ALTER TABLE [Orders] ADD [CancellationReason] nvarchar(500) NULL;",
            ["CancelledAtUtc"] = "ALTER TABLE [Orders] ADD [CancelledAtUtc] datetime2 NULL;",
            ["ShippedAtUtc"] = "ALTER TABLE [Orders] ADD [ShippedAtUtc] datetime2 NULL;",
            ["DeliveredAtUtc"] = "ALTER TABLE [Orders] ADD [DeliveredAtUtc] datetime2 NULL;"
        };

        foreach (var statement in statements)
        {
            if (!columns.Contains(statement.Key))
            {
                await db.Database.ExecuteSqlRawAsync(statement.Value, cancellationToken);
            }
        }
    }

    private sealed record SqliteColumnDetail(int Cid, string Name, string DeclaredType, int NotNull, int Pk);

    private static async Task ApplySqlitePaymentTransactionUpgradeAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var columns = await GetSqliteColumnsAsync(db, "PaymentTransactions", cancellationToken);
        if (columns.Count == 0)
        {
            return;
        }

        if (!columns.Contains("PendingCheckoutJson"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE PaymentTransactions ADD COLUMN PendingCheckoutJson TEXT NULL;",
                cancellationToken);
        }

        await EnsureSqlitePaymentTransactionsNullableOrderIdAsync(db, cancellationToken);
    }

    /// <summary>
    /// SQLite cannot widen columns with ALTER COLUMN; older dev DBs may still have NOT NULL OrderId.
    /// Razorpay pay-first inserts rows before an order exists (OrderId null).
    /// </summary>
    private static async Task EnsureSqlitePaymentTransactionsNullableOrderIdAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var infos = await GetSqlitePragmaTableInfoAsync(db, "PaymentTransactions", cancellationToken);
        var orderId = infos.FirstOrDefault(column =>
            column.Name.Equals("OrderId", StringComparison.OrdinalIgnoreCase));
        if (orderId is null || orderId.NotNull == 0)
        {
            return;
        }

        var quotedCols = infos
            .OrderBy(column => column.Cid)
            .Select(column => $"\"{column.Name.Replace("\"", "\"\"", StringComparison.Ordinal)}\"")
            .ToArray();

        var columnDefinitions = infos
            .OrderBy(column => column.Cid)
            .Select(BuildSqlitePaymentTransactionColumnDefinition)
            .ToArray();

        const string tempName = "PaymentTransactions__lg_null_order";

        var createSql =
            $"""
            CREATE TABLE "{tempName}" (
                {string.Join("," + Environment.NewLine + "    ", columnDefinitions)}
            )
            """;

        var insertSql =
            $"""
            INSERT INTO "{tempName}" ({string.Join(", ", quotedCols)})
            SELECT {string.Join(", ", quotedCols)} FROM "PaymentTransactions"
            """;

        await db.Database.ExecuteSqlRawAsync("PRAGMA foreign_keys = OFF;", cancellationToken);
        try
        {
            await db.Database.ExecuteSqlRawAsync("BEGIN TRANSACTION;", cancellationToken);
            try
            {
                await db.Database.ExecuteSqlRawAsync(createSql, cancellationToken);
                await db.Database.ExecuteSqlRawAsync(insertSql, cancellationToken);
                await db.Database.ExecuteSqlRawAsync(
                    """DROP TABLE "PaymentTransactions";""",
                    cancellationToken);
                await db.Database.ExecuteSqlRawAsync(
                    $"""ALTER TABLE "{tempName}" RENAME TO "PaymentTransactions";""",
                    cancellationToken);
                await db.Database.ExecuteSqlRawAsync("COMMIT;", cancellationToken);
            }
            catch
            {
                await db.Database.ExecuteSqlRawAsync("ROLLBACK;", cancellationToken);
                throw;
            }
        }
        finally
        {
            await db.Database.ExecuteSqlRawAsync("PRAGMA foreign_keys = ON;", cancellationToken);
        }
    }

    private static string BuildSqlitePaymentTransactionColumnDefinition(SqliteColumnDetail column)
    {
        if (column.Name.Equals("OrderId", StringComparison.OrdinalIgnoreCase))
        {
            return "\"OrderId\" INTEGER NULL";
        }

        var type = string.IsNullOrWhiteSpace(column.DeclaredType)
            ? "TEXT"
            : column.DeclaredType;

        if (column.Name.Equals("Id", StringComparison.OrdinalIgnoreCase) && column.Pk == 1)
        {
            return "\"Id\" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT";
        }

        var notNull = column.NotNull == 1 ? " NOT NULL" : "";
        return $"\"{column.Name.Replace("\"", "\"\"", StringComparison.Ordinal)}\" {type}{notNull}";
    }

    private static async Task<List<SqliteColumnDetail>> GetSqlitePragmaTableInfoAsync(
        AppDbContext db,
        string tableName,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(tableName) ||
            !tableName.All(static ch => char.IsAsciiLetterOrDigit(ch) || ch == '_'))
        {
            throw new ArgumentException("Invalid table name.", nameof(tableName));
        }

        var rows = new List<SqliteColumnDetail>();
        var connection = db.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        await using var command = connection.CreateCommand();
        command.CommandText =
            $"SELECT cid, name, type, \"notnull\", pk FROM pragma_table_info('{tableName}') ORDER BY cid";

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add(new SqliteColumnDetail(
                reader.GetInt32(0),
                reader.GetString(1),
                reader.IsDBNull(2) ? "" : reader.GetString(2),
                reader.GetInt32(3),
                reader.GetInt32(4)));
        }

        return rows;
    }

    private static async Task ApplySqlServerPaymentTransactionPayFirstUpgradeAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var columns = await GetSqlServerColumnsAsync(db, "PaymentTransactions", cancellationToken);
        if (columns.Count == 0)
        {
            return;
        }

        if (!columns.Contains("PendingCheckoutJson"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [PaymentTransactions] ADD [PendingCheckoutJson] nvarchar(max) NULL;",
                cancellationToken);
        }

        await db.Database.ExecuteSqlRawAsync(
            """
            IF EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'PaymentTransactions' AND COLUMN_NAME = 'OrderId' AND IS_NULLABLE = 'NO')
            BEGIN
                ALTER TABLE [PaymentTransactions] ALTER COLUMN [OrderId] int NULL;
            END
            """,
            cancellationToken);
    }

    private static async Task ApplySqlServerUsersManagementUpgradeAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var columns = await GetSqlServerColumnsAsync(db, "Users", cancellationToken);
        if (columns.Count == 0)
        {
            return;
        }

        if (!columns.Contains("UpdatedAtUtc"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [Users] ADD [UpdatedAtUtc] datetime2 NULL;",
                cancellationToken);
            await db.Database.ExecuteSqlRawAsync(
                "UPDATE [Users] SET [UpdatedAtUtc] = [CreatedAtUtc] WHERE [UpdatedAtUtc] IS NULL;",
                cancellationToken);
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [Users] ALTER COLUMN [UpdatedAtUtc] datetime2 NOT NULL;",
                cancellationToken);
        }

        if (!columns.Contains("DeletedAtUtc"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [Users] ADD [DeletedAtUtc] datetime2 NULL;",
                cancellationToken);
        }

        if (!columns.Contains("PasswordResetTokenHash"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [Users] ADD [PasswordResetTokenHash] nvarchar(256) NULL;",
                cancellationToken);
        }

        if (!columns.Contains("PasswordResetRequestedAtUtc"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [Users] ADD [PasswordResetRequestedAtUtc] datetime2 NULL;",
                cancellationToken);
        }

        if (!columns.Contains("PasswordResetExpiresAtUtc"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE [Users] ADD [PasswordResetExpiresAtUtc] datetime2 NULL;",
                cancellationToken);
        }
    }

    private static async Task ApplySqliteUsersPasswordResetUpgradeAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var columns = await GetSqliteColumnsAsync(db, "Users", cancellationToken);
        if (columns.Count == 0)
        {
            return;
        }

        var statements = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["PasswordResetTokenHash"] = "ALTER TABLE Users ADD COLUMN PasswordResetTokenHash TEXT NULL;",
            ["PasswordResetRequestedAtUtc"] = "ALTER TABLE Users ADD COLUMN PasswordResetRequestedAtUtc TEXT NULL;",
            ["PasswordResetExpiresAtUtc"] = "ALTER TABLE Users ADD COLUMN PasswordResetExpiresAtUtc TEXT NULL;"
        };

        foreach (var statement in statements)
        {
            if (!columns.Contains(statement.Key))
            {
                await db.Database.ExecuteSqlRawAsync(statement.Value, cancellationToken);
            }
        }
    }

    private static async Task ApplySqlServerCustomOrderFulfillmentUpgradeAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var columns = await GetSqlServerColumnsAsync(db, "CustomOrderRequests", cancellationToken);
        if (columns.Count == 0)
        {
            return;
        }

        var statements = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["TrackingNumber"] = "ALTER TABLE [CustomOrderRequests] ADD [TrackingNumber] nvarchar(120) NULL;",
            ["PackageWeightKg"] = "ALTER TABLE [CustomOrderRequests] ADD [PackageWeightKg] decimal(18,2) NULL;",
            ["PackageDimensionsCm"] = "ALTER TABLE [CustomOrderRequests] ADD [PackageDimensionsCm] nvarchar(80) NULL;",
            ["CourierPartner"] = "ALTER TABLE [CustomOrderRequests] ADD [CourierPartner] nvarchar(120) NULL;",
            ["RefundStatus"] = "ALTER TABLE [CustomOrderRequests] ADD [RefundStatus] nvarchar(32) NOT NULL CONSTRAINT [DF_CustomOrderRequests_RefundStatus] DEFAULT 'NotRequested';",
            ["CancellationReason"] = "ALTER TABLE [CustomOrderRequests] ADD [CancellationReason] nvarchar(500) NULL;",
            ["CancelledAtUtc"] = "ALTER TABLE [CustomOrderRequests] ADD [CancelledAtUtc] datetime2 NULL;",
            ["ShippedAtUtc"] = "ALTER TABLE [CustomOrderRequests] ADD [ShippedAtUtc] datetime2 NULL;",
            ["DeliveredAtUtc"] = "ALTER TABLE [CustomOrderRequests] ADD [DeliveredAtUtc] datetime2 NULL;"
        };

        foreach (var statement in statements)
        {
            if (!columns.Contains(statement.Key))
            {
                await db.Database.ExecuteSqlRawAsync(statement.Value, cancellationToken);
            }
        }
    }

    private static async Task<HashSet<string>> GetSqliteColumnsAsync(
        AppDbContext db,
        string tableName,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(tableName) ||
            !tableName.All(static ch => char.IsAsciiLetterOrDigit(ch) || ch == '_'))
        {
            throw new ArgumentException("Invalid table name.", nameof(tableName));
        }

        var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var connection = db.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        await using var command = connection.CreateCommand();
        command.CommandText = $"SELECT name FROM pragma_table_info('{tableName}')";

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            columns.Add(reader.GetString(0));
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
