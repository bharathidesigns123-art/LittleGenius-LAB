using System.Text.Json;
using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

var repoRoot = FindRepoRoot();
var backendDir = Path.Combine(repoRoot, "backend");
var productionConfigPath = Path.Combine(backendDir, "appsettings.Production.json");
var developmentConfigPath = Path.Combine(backendDir, "appsettings.Development.json");

var productionConnection = ReadConnectionString(productionConfigPath, "SqlServer");
var sqliteConnection = ReadConnectionString(developmentConfigPath, "Sqlite");
var sqlitePath = ResolveSqlitePath(backendDir, sqliteConnection);

BackupSqliteDatabase(sqlitePath, repoRoot);

var productionOptions = new DbContextOptionsBuilder<AppDbContext>()
    .UseSqlServer(productionConnection)
    .Options;

var absoluteSqliteConnection = new SqliteConnectionStringBuilder(sqliteConnection)
{
    DataSource = sqlitePath
}.ToString();

var developmentOptions = new DbContextOptionsBuilder<AppDbContext>()
    .UseSqlite(absoluteSqliteConnection)
    .Options;

await using var production = new AppDbContext(productionOptions);
await using var development = new AppDbContext(developmentOptions);

Console.WriteLine("Connecting to production SQL Server...");
await production.Database.OpenConnectionAsync();
Console.WriteLine("Recreating development SQLite database...");
await development.Database.EnsureDeletedAsync();
await development.Database.EnsureCreatedAsync();
await DatabaseSchemaUpdater.ApplyAsync(development);
await development.Database.OpenConnectionAsync();

development.ChangeTracker.AutoDetectChangesEnabled = false;

var counts = new List<(string Table, int Count)>
{
    await CopyRawAsync<AppUser>(production, development),
    await CopyRawAsync<ProductCategory>(production, development),
    await CopyRawAsync<Product>(production, development),
    await CopyRawAsync<ProductImage>(production, development),
    await CopyRawAsync<Address>(production, development),
    await CopyRawAsync<Order>(production, development),
    await CopyRawAsync<OrderItem>(production, development),
    await CopyRawAsync<PaymentTransaction>(production, development),
    await CopyRawAsync<CustomOrderRequest>(production, development),
    await CopyRawAsync<InventoryAdjustment>(production, development),
    await CopyRawAsync<ProductReview>(production, development),
    await CopyRawAsync<NotificationLog>(production, development)
};

await development.Database.ExecuteSqlRawAsync("PRAGMA foreign_key_check;");

Console.WriteLine();
Console.WriteLine("Copied production data into development SQLite:");
foreach (var (table, count) in counts)
{
    Console.WriteLine($"  {table}: {count}");
}

static async Task<(string Table, int Count)> CopyRawAsync<TEntity>(
    AppDbContext production,
    AppDbContext development) where TEntity : class
{
    var entityType = development.Model.FindEntityType(typeof(TEntity))
        ?? throw new InvalidOperationException($"Entity type not found: {typeof(TEntity).Name}");
    var tableName = entityType.GetTableName()
        ?? throw new InvalidOperationException($"Table name not found: {typeof(TEntity).Name}");
    var properties = entityType.GetProperties()
        .Where(property => property.GetColumnName(StoreObjectIdentifier.Table(tableName, null)) is not null)
        .ToList();
    var columnNames = properties
        .Select(property => property.GetColumnName(StoreObjectIdentifier.Table(tableName, null))!)
        .ToList();

    await using var sourceCommand = production.Database.GetDbConnection().CreateCommand();
    sourceCommand.CommandText = $"SELECT {string.Join(", ", columnNames.Select(SqlServerQuote))} FROM {SqlServerQuote(tableName)}";

    await using var reader = await sourceCommand.ExecuteReaderAsync();
    var count = 0;
    while (await reader.ReadAsync())
    {
        await using var insertCommand = development.Database.GetDbConnection().CreateCommand();
        insertCommand.CommandText =
            $"INSERT INTO {SqliteQuote(tableName)} ({string.Join(", ", columnNames.Select(SqliteQuote))}) " +
            $"VALUES ({string.Join(", ", columnNames.Select((_, index) => $"$p{index}"))})";

        for (var index = 0; index < columnNames.Count; index++)
        {
            var parameter = insertCommand.CreateParameter();
            parameter.ParameterName = $"$p{index}";
            parameter.Value = reader.IsDBNull(index) ? DBNull.Value : reader.GetValue(index);
            insertCommand.Parameters.Add(parameter);
        }

        await insertCommand.ExecuteNonQueryAsync();
        count++;
    }

    Console.WriteLine($"{tableName}: {count}");
    return (tableName, count);
}

static string SqlServerQuote(string identifier) => $"[{identifier.Replace("]", "]]")}]";

static string SqliteQuote(string identifier) => $"\"{identifier.Replace("\"", "\"\"")}\"";

static string FindRepoRoot()
{
    var current = Directory.GetCurrentDirectory();
    while (!string.IsNullOrWhiteSpace(current))
    {
        if (Directory.Exists(Path.Combine(current, ".git")) && Directory.Exists(Path.Combine(current, "backend")))
        {
            return current;
        }

        current = Directory.GetParent(current)?.FullName ?? string.Empty;
    }

    throw new DirectoryNotFoundException("Could not find repository root.");
}

static string ReadConnectionString(string configPath, string name)
{
    using var document = JsonDocument.Parse(File.ReadAllText(configPath));
    if (document.RootElement.TryGetProperty("ConnectionStrings", out var connectionStrings) &&
        connectionStrings.TryGetProperty(name, out var value))
    {
        return value.GetString() ?? throw new InvalidOperationException($"Connection string '{name}' is empty.");
    }

    throw new InvalidOperationException($"Connection string '{name}' not found in {configPath}.");
}

static string ResolveSqlitePath(string backendDir, string sqliteConnection)
{
    var builder = new SqliteConnectionStringBuilder(sqliteConnection);
    var dataSource = builder.DataSource;
    return Path.IsPathRooted(dataSource)
        ? dataSource
        : Path.GetFullPath(Path.Combine(backendDir, dataSource));
}

static void BackupSqliteDatabase(string sqlitePath, string repoRoot)
{
    var backupDir = Path.Combine(repoRoot, "artifacts", "db-backups");
    Directory.CreateDirectory(backupDir);

    if (!File.Exists(sqlitePath))
    {
        Console.WriteLine("No existing development SQLite database found; skipping backup.");
        return;
    }

    TryCheckpoint(sqlitePath);

    var timestamp = DateTime.Now.ToString("yyyyMMdd-HHmmss");
    foreach (var path in new[] { sqlitePath, $"{sqlitePath}-wal", $"{sqlitePath}-shm" })
    {
        if (!File.Exists(path))
        {
            continue;
        }

        var backupPath = Path.Combine(backupDir, $"{Path.GetFileName(path)}.{timestamp}.bak");
        File.Copy(path, backupPath, overwrite: false);
        Console.WriteLine($"Backed up {Path.GetFileName(path)} to {backupPath}");
    }
}

static void TryCheckpoint(string sqlitePath)
{
    try
    {
        var builder = new SqliteConnectionStringBuilder { DataSource = sqlitePath };
        using var connection = new SqliteConnection(builder.ToString());
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText = "PRAGMA wal_checkpoint(TRUNCATE);";
        command.ExecuteNonQuery();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"SQLite checkpoint skipped: {ex.Message}");
    }
}
