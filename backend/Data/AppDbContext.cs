using LittleGeniusLab.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LittleGeniusLab.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<ProductCategory> Categories => Set<ProductCategory>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductReview> Reviews => Set<ProductReview>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<CustomOrderRequest> CustomOrderRequests => Set<CustomOrderRequest>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<InventoryAdjustment> InventoryAdjustments => Set<InventoryAdjustment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>().HasIndex(user => user.Email).IsUnique();
        modelBuilder.Entity<ProductCategory>().HasIndex(category => category.Slug).IsUnique();
        modelBuilder.Entity<Product>().HasIndex(product => product.Slug).IsUnique();
        modelBuilder.Entity<Product>().HasIndex(product => product.Sku).IsUnique();
        modelBuilder.Entity<ProductImage>().HasIndex(image => image.ProductId);
        modelBuilder.Entity<ProductImage>().HasIndex(image => new { image.ProductId, image.SortOrder });
        modelBuilder.Entity<Order>().HasIndex(order => order.OrderCode).IsUnique();
        modelBuilder.Entity<CustomOrderRequest>().HasIndex(order => order.ReferenceCode).IsUnique();
        modelBuilder.Entity<ProductReview>().HasIndex(review => review.OrderId);
        modelBuilder.Entity<ProductReview>().HasIndex(review => review.UserId);
        modelBuilder.Entity<ProductReview>().HasIndex(review => new { review.ProductId, review.OrderId, review.UserId });

        modelBuilder.Entity<Product>()
            .HasOne(product => product.Category)
            .WithMany(category => category.Products)
            .HasForeignKey(product => product.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProductImage>()
            .HasOne(image => image.Product)
            .WithMany(product => product.Images)
            .HasForeignKey(image => image.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductReview>()
            .HasOne(review => review.Product)
            .WithMany(product => product.Reviews)
            .HasForeignKey(review => review.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductReview>()
            .HasOne(review => review.User)
            .WithMany(user => user.Reviews)
            .HasForeignKey(review => review.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ProductReview>()
            .HasOne(review => review.Order)
            .WithMany(order => order.Reviews)
            .HasForeignKey(review => review.OrderId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Order>()
            .HasOne(order => order.User)
            .WithMany(user => user.Orders)
            .HasForeignKey(order => order.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Order>()
            .HasMany(order => order.Items)
            .WithOne(item => item.Order)
            .HasForeignKey(item => item.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Order>()
            .HasMany(order => order.Payments)
            .WithOne(payment => payment.Order)
            .HasForeignKey(payment => payment.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CustomOrderRequest>()
            .HasOne(request => request.User)
            .WithMany(user => user.CustomOrderRequests)
            .HasForeignKey(request => request.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Address>()
            .HasOne(address => address.User)
            .WithMany(user => user.Addresses)
            .HasForeignKey(address => address.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InventoryAdjustment>()
            .HasOne(adjustment => adjustment.Product)
            .WithMany(product => product.InventoryAdjustments)
            .HasForeignKey(adjustment => adjustment.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties().Where(property => property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?)))
            {
                property.SetColumnType("decimal(18,2)");
            }
        }
    }
}
