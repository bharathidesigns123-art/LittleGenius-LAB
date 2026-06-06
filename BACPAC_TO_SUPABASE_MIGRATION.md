# Migrate LittleGenius BACPAC to Supabase Postgres

The backup file `LittleGeniusDB-2026-5-29-8-18.bacpac` is a SQL Server/Azure SQL export. Supabase uses PostgreSQL, so the BACPAC cannot be imported directly into Supabase.

## 1. Restore the BACPAC into SQL Server

Install SqlPackage if it is not already installed:

```powershell
winget install Microsoft.SqlPackage
```

Restore the backup into a temporary SQL Server database:

```powershell
sqlpackage /Action:Import `
  /SourceFile:"C:\Users\bhara\Downloads\LittleGeniusDB-2026-5-29-8-18.bacpac" `
  /TargetServerName:"localhost\SQLEXPRESS" `
  /TargetDatabaseName:"LittleGeniusDB_Restore" `
  /TargetTrustServerCertificate:True
```

If your SQL Server requires login credentials, add:

```powershell
/TargetUser:"YOUR_SQL_USER" /TargetPassword:"YOUR_SQL_PASSWORD"
```

## 2. Let Railway create the Supabase schema

Set Railway backend env:

```text
ConnectionStrings__DefaultConnection=Host=db.uqroejmxxmayuohllecb.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_SUPABASE_DB_PASSWORD;SSL Mode=Require;Trust Server Certificate=true
```

Deploy/restart the backend once. The backend creates the PostgreSQL tables if they do not exist.

## 3. Copy table data

Copy data in this order:

1. `Categories`
2. `Users`
3. `Products`
4. `ProductImages`
5. `Orders`
6. `OrderItems` if present
7. `CustomOrderRequests`
8. `PaymentTransactions`
9. `InventoryAdjustments`
10. `NotificationLogs`
11. `Addresses` if present
12. `Reviews` if present

The easiest manual route is:

1. Open the restored SQL Server database in Azure Data Studio or SQL Server Management Studio.
2. Export each table as CSV.
3. In Supabase dashboard, open **Table Editor**.
4. Import each CSV into the matching table in the order above.

## 4. Reset PostgreSQL identity sequences

After importing rows with existing `Id` values, run this in Supabase SQL Editor:

```sql
select setval(pg_get_serial_sequence('"Categories"', 'Id'), coalesce(max("Id"), 1), true) from "Categories";
select setval(pg_get_serial_sequence('"Users"', 'Id'), coalesce(max("Id"), 1), true) from "Users";
select setval(pg_get_serial_sequence('"Products"', 'Id'), coalesce(max("Id"), 1), true) from "Products";
select setval(pg_get_serial_sequence('"ProductImages"', 'Id'), coalesce(max("Id"), 1), true) from "ProductImages";
select setval(pg_get_serial_sequence('"Orders"', 'Id'), coalesce(max("Id"), 1), true) from "Orders";
select setval(pg_get_serial_sequence('"OrderItems"', 'Id'), coalesce(max("Id"), 1), true) from "OrderItems";
select setval(pg_get_serial_sequence('"CustomOrderRequests"', 'Id'), coalesce(max("Id"), 1), true) from "CustomOrderRequests";
select setval(pg_get_serial_sequence('"PaymentTransactions"', 'Id'), coalesce(max("Id"), 1), true) from "PaymentTransactions";
select setval(pg_get_serial_sequence('"InventoryAdjustments"', 'Id'), coalesce(max("Id"), 1), true) from "InventoryAdjustments";
select setval(pg_get_serial_sequence('"NotificationLogs"', 'Id'), coalesce(max("Id"), 1), true) from "NotificationLogs";
select setval(pg_get_serial_sequence('"Addresses"', 'Id'), coalesce(max("Id"), 1), true) from "Addresses";
select setval(pg_get_serial_sequence('"Reviews"', 'Id'), coalesce(max("Id"), 1), true) from "Reviews";
```

If a table does not exist or has no data, skip that line.

## 5. Verify

Check these API routes after Railway restarts:

```text
/api/store/categories
/api/store/products
/api/store/home
```

