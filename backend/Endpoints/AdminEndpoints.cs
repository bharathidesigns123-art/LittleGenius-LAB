using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Helpers;
using LittleGeniusLab.Api.Models;
using LittleGeniusLab.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace LittleGeniusLab.Api.Endpoints;

public sealed record RegisterProductImagesRequest(System.Collections.Generic.List<string> ImageUrls);

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/admin")
            .RequireAuthorization("AdminOnly");

        group.MapGet("/dashboard", async (AppDbContext db) =>
        {
            var totalOrders = await db.Orders.CountAsync();
            var revenue = (await db.PaymentTransactions
                .Where(payment => payment.Status == PaymentStatuses.Paid)
                .Select(payment => payment.AmountInr)
                .ToListAsync())
                .Sum();
            var pendingOrders = await db.Orders.CountAsync(order => order.Status == OrderStatuses.Pending);
            var lowStockProducts = await db.Products.CountAsync(product => product.StockQuantity <= product.LowStockThreshold);

            return Results.Ok(new
            {
                totalOrders,
                revenue,
                pendingOrders,
                lowStockProducts
            });
        });

        group.MapGet("/categories", async (AppDbContext db) =>
            Results.Ok(await db.Categories
                .AsNoTracking()
                .OrderBy(category => category.SortOrder)
                .ToListAsync()));

        group.MapPost("/categories", async (ProductCategory request, AppDbContext db) =>
        {
            request.Slug = request.Slug.Trim().ToLowerInvariant();
            db.Categories.Add(request);
            await db.SaveChangesAsync();
            return Results.Created($"/api/admin/categories/{request.Id}", request);
        });

        group.MapPut("/categories/{id:int}", async (int id, ProductCategory request, AppDbContext db) =>
        {
            var category = await db.Categories.FirstOrDefaultAsync(item => item.Id == id);
            if (category is null)
            {
                return Results.NotFound(new { message = "Category not found." });
            }

            category.Name = request.Name.Trim();
            category.Slug = request.Slug.Trim().ToLowerInvariant();
            category.Description = request.Description.Trim();
            category.PriceRange = request.PriceRange.Trim();
            category.ThemeColor = request.ThemeColor.Trim();
            category.ImageUrl = request.ImageUrl.Trim();
            category.SortOrder = request.SortOrder;
            category.IsActive = request.IsActive;

            await db.SaveChangesAsync();
            return Results.Ok(category);
        });

        group.MapDelete("/categories/{id:int}", async (int id, AppDbContext db) =>
        {
            var category = await db.Categories.FirstOrDefaultAsync(item => item.Id == id);
            if (category is null)
            {
                return Results.NotFound(new { message = "Category not found." });
            }

            db.Categories.Remove(category);
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Category deleted." });
        });

        group.MapGet("/products", async (AppDbContext db) =>
        {
            var products = await db.Products
                .AsNoTracking()
                .Include(product => product.Category)
                .Include(product => product.Images)
                .OrderBy(product => product.DisplayOrder)
                .ToListAsync();

            return Results.Ok(products.Select(ToAdminProductDto));
        });

        group.MapPost("/products", async (CreateOrUpdateProductRequest request, AppDbContext db) =>
        {
            var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId);
            if (category is null)
            {
                return Results.BadRequest(new { message = $"Category with ID {request.CategoryId} not found." });
            }

            var product = request.ToEntity();
            db.Products.Add(product);
            await db.SaveChangesAsync();

            var savedProduct = await db.Products
                .AsNoTracking()
                .Include(item => item.Category)
                .Include(item => item.Images)
                .FirstAsync(item => item.Id == product.Id);

            return Results.Created($"/api/admin/products/{product.Id}", ToAdminProductDto(savedProduct));
        });

        group.MapPut("/products/{id:int}", async (int id, CreateOrUpdateProductRequest request, AppDbContext db) =>
        {
            var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId);
            if (category is null)
            {
                return Results.BadRequest(new { message = $"Category with ID {request.CategoryId} not found." });
            }

            var product = await db.Products.FirstOrDefaultAsync(item => item.Id == id);
            if (product is null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            request.ApplyTo(product);
            product.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync();

            var savedProduct = await db.Products
                .AsNoTracking()
                .Include(item => item.Category)
                .Include(item => item.Images)
                .FirstAsync(item => item.Id == product.Id);

            return Results.Ok(ToAdminProductDto(savedProduct));
        });

        group.MapDelete("/products/{id:int}", async (
            int id,
            AppDbContext db,
            CancellationToken cancellationToken) =>
        {
            var product = await db.Products
                .Include(item => item.Images)
                .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
            if (product is null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            db.Products.Remove(product);
            await db.SaveChangesAsync(cancellationToken);

            return Results.Ok(new { message = "Product deleted." });
        });

        group.MapGet("/products/{id:int}/images", async (int id, AppDbContext db) =>
        {
            var product = await db.Products
                .AsNoTracking()
                .Include(item => item.Images)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (product is null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            return Results.Ok(MapProductImages(product));
        });

        group.MapPost("/products/{id:int}/images/register", async (
            int id,
            RegisterProductImagesRequest request,
            AppDbContext db,
            CancellationToken cancellationToken) =>
        {
            var product = await db.Products
                .Include(item => item.Images)
                .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

            if (product is null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            product.Images ??= new System.Collections.Generic.List<ProductImage>();

            var nextSortOrder = product.Images.Count == 0
                ? 0
                : product.Images.Max(image => image.SortOrder) + 1;

            foreach (var imageUrl in request.ImageUrls)
            {
                product.Images.Add(new ProductImage
                {
                    ProductId = product.Id,
                    ImageUrl = imageUrl,
                    SortOrder = nextSortOrder++,
                    Width = 0,
                    Height = 0
                });
            }

            product.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);

            return Results.Created($"/api/admin/products/{product.Id}/images", new
            {
                images = MapProductImages(product),
                heroImageUrl = GetPrimaryImageUrl(product),
                imageCount = product.Images.Count
            });
        });

        group.MapPut("/products/{id:int}/images/order", async (
            int id,
            UpdateProductImageOrderRequest request,
            AppDbContext db,
            CancellationToken cancellationToken) =>
        {
            var product = await db.Products
                .Include(item => item.Images)
                .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

            if (product is null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            // Ensure Images collection is initialized
            product.Images ??= [];

            if (request.ImageIds.Count == 0 || request.ImageIds.Count != product.Images.Count)
            {
                return Results.BadRequest(new { message = "Provide the full ordered image list." });
            }

            var currentIds = product.Images.Select(image => image.Id).OrderBy(value => value).ToArray();
            var requestedIds = request.ImageIds.OrderBy(value => value).ToArray();
            if (!currentIds.SequenceEqual(requestedIds))
            {
                return Results.BadRequest(new { message = "Image order payload is invalid." });
            }

            for (var index = 0; index < request.ImageIds.Count; index++)
            {
                var image = product.Images.First(item => item.Id == request.ImageIds[index]);
                image.SortOrder = index;
            }

            product.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);

            return Results.Ok(new
            {
                images = MapProductImages(product),
                heroImageUrl = GetPrimaryImageUrl(product),
                imageCount = product.Images.Count
            });
        });

        group.MapDelete("/products/{productId:int}/images/{imageId:int}", async (
            int productId,
            int imageId,
            AppDbContext db,
            CancellationToken cancellationToken) =>
        {
            var product = await db.Products
                .Include(item => item.Images)
                .FirstOrDefaultAsync(item => item.Id == productId, cancellationToken);

            if (product is null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            // Ensure Images collection is initialized
            product.Images ??= [];

            var image = product.Images.FirstOrDefault(item => item.Id == imageId);
            if (image is null)
            {
                return Results.NotFound(new { message = "Product image not found." });
            }

            db.ProductImages.Remove(image);
            product.Images.Remove(image);

            var orderedRemainingImages = product.Images
                .OrderBy(item => item.SortOrder)
                .ToList();
            for (var index = 0; index < orderedRemainingImages.Count; index++)
            {
                orderedRemainingImages[index].SortOrder = index;
            }

            product.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);

            return Results.Ok(new
            {
                message = "Product image deleted.",
                images = MapProductImages(product),
                heroImageUrl = GetPrimaryImageUrl(product),
                imageCount = product.Images.Count
            });
        });

        group.MapPost("/inventory/adjust", async (
            HttpContext context,
            InventoryAdjustmentRequest request,
            AppDbContext db) =>
        {
            var product = await db.Products.FirstOrDefaultAsync(item => item.Id == request.ProductId);
            if (product is null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            product.StockQuantity += request.QuantityChange;
            product.UpdatedAtUtc = DateTime.UtcNow;

            var adjustment = new InventoryAdjustment
            {
                ProductId = product.Id,
                UpdatedByUserId = context.User.GetUserId(),
                QuantityChange = request.QuantityChange,
                Reason = request.Reason.Trim(),
                Notes = request.Notes?.Trim()
            };

            db.InventoryAdjustments.Add(adjustment);
            await db.SaveChangesAsync();

            return Results.Ok(new
            {
                product.Id,
                product.Name,
                product.StockQuantity
            });
        });

        group.MapGet("/orders", async (AppDbContext db) =>
            Results.Ok(await db.Orders
                .AsNoTracking()
                .Include(order => order.Items)
                .OrderByDescending(order => order.CreatedAtUtc)
                .Select(order => new
                {
                    order.Id,
                    order.OrderCode,
                    order.CustomerName,
                    order.Email,
                    order.Phone,
                    order.Status,
                    order.PaymentStatus,
                    order.PaymentMethod,
                    order.TotalPriceInr,
                    order.TrackingNumber,
                    order.CreatedAtUtc,
                    items = order.Items.Select(item => new
                    {
                        item.ProductName,
                        item.Quantity,
                        item.TotalPriceInr
                    })
                })
                .ToListAsync()));

        group.MapPut("/orders/{id:int}/status", async (int id, UpdateOrderStatusRequest request, AppDbContext db) =>
        {
            var order = await db.Orders.FirstOrDefaultAsync(item => item.Id == id);
            if (order is null)
            {
                return Results.NotFound(new { message = "Order not found." });
            }

            order.Status = request.Status.Trim();
            order.TrackingNumber = request.TrackingNumber?.Trim();
            order.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Ok(order);
        });

        group.MapGet("/custom-orders", async (AppDbContext db) =>
            Results.Ok(await db.CustomOrderRequests
                .AsNoTracking()
                .OrderByDescending(order => order.CreatedAtUtc)
                .Select(order => new
                {
                    order.Id,
                    order.ReferenceCode,
                    order.Name,
                    order.Email,
                    order.WhatsAppNumber,
                    order.Occasion,
                    order.Size,
                    order.ColorPreference,
                    order.PhotoUrl,
                    order.CharacterDescription,
                    order.Status,
                    order.QuoteAmountInr,
                    order.AdminNotes,
                    order.CreatedAtUtc
                })
                .ToListAsync()));

        group.MapPut("/custom-orders/{id:int}", async (int id, UpdateCustomOrderRequest request, AppDbContext db) =>
        {
            var customOrder = await db.CustomOrderRequests.FirstOrDefaultAsync(item => item.Id == id);
            if (customOrder is null)
            {
                return Results.NotFound(new { message = "Custom order not found." });
            }

            customOrder.Status = request.Status.Trim();
            customOrder.QuoteAmountInr = request.QuoteAmountInr;
            customOrder.AdminNotes = request.AdminNotes?.Trim();
            customOrder.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Ok(customOrder);
        });

        group.MapGet("/users", async (AppDbContext db) =>
            Results.Ok(await db.Users
                .AsNoTracking()
                .OrderByDescending(user => user.CreatedAtUtc)
                .Select(user => new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.Phone,
                    user.Role,
                    user.IsActive,
                    user.CreatedAtUtc
                })
                .ToListAsync()));

        return routes;
    }

    private static object ToAdminProductDto(Product product)
    {
        return new
        {
            product.Id,
            product.CategoryId,
            product.Name,
            product.Slug,
            product.Sku,
            product.ShortDescription,
            product.FullDescription,
            product.PriceInr,
            product.CompareAtPriceInr,
            product.Colourway,
            product.Material,
            product.Finish,
            product.ShipsIn,
            product.MadeIn,
            product.Tagline,
            product.SizeMm,
            product.StockQuantity,
            product.LowStockThreshold,
            product.DisplayOrder,
            product.IsPublished,
            product.IsFeatured,
            product.Badge,
            heroImageUrl = GetPrimaryImageUrl(product),
            images = MapProductImages(product),
            imageCount = product.Images.Count,
            categoryName = product.Category?.Name ?? string.Empty
        };
    }

    private static string GetPrimaryImageUrl(Product product) =>
        product.Images
            .OrderBy(image => image.SortOrder)
            .Select(image => image.ImageUrl)
            .FirstOrDefault() ?? product.HeroImageUrl;

    private static IReadOnlyList<ProductImageResponse> MapProductImages(Product product) =>
        (product.Images ?? [])
            .OrderBy(image => image.SortOrder)
            .Select(image => new ProductImageResponse(
                image.Id,
                image.ImageUrl,
                image.SortOrder,
                image.Width,
                image.Height))
            .ToList();

    public sealed record CreateOrUpdateProductRequest(
        int CategoryId,
        string Name,
        string Slug,
        string Sku,
        string ShortDescription,
        string FullDescription,
        decimal PriceInr,
        decimal? CompareAtPriceInr,
        string Badge,
        string HeroImageUrl,
        string Colourway,
        string Material,
        string Finish,
        string ShipsIn,
        string MadeIn,
        string Tagline,
        bool IsFeatured,
        bool IsPublished,
        int SizeMm,
        int StockQuantity,
        int LowStockThreshold,
        int DisplayOrder)
    {
        public Product ToEntity()
        {
            var product = new Product();
            ApplyTo(product);
            product.CreatedAtUtc = DateTime.UtcNow;
            product.UpdatedAtUtc = DateTime.UtcNow;
            return product;
        }

        public void ApplyTo(Product product)
        {
            product.CategoryId = CategoryId;
            product.Name = Name.Trim();
            product.Slug = Slug.Trim().ToLowerInvariant();
            product.Sku = Sku.Trim().ToUpperInvariant();
            product.ShortDescription = ShortDescription.Trim();
            product.FullDescription = FullDescription.Trim();
            product.PriceInr = PriceInr;
            product.CompareAtPriceInr = CompareAtPriceInr;
            product.Badge = Badge.Trim();
            product.HeroImageUrl = HeroImageUrl.Trim();
            product.Colourway = Colourway.Trim();
            product.Material = Material.Trim();
            product.Finish = Finish.Trim();
            product.ShipsIn = ShipsIn.Trim();
            product.MadeIn = MadeIn.Trim();
            product.Tagline = Tagline.Trim();
            product.IsFeatured = IsFeatured;
            product.IsPublished = IsPublished;
            product.SizeMm = SizeMm;
            product.StockQuantity = StockQuantity;
            product.LowStockThreshold = LowStockThreshold;
            product.DisplayOrder = DisplayOrder;
        }
    }

    public sealed record UpdateProductImageOrderRequest(List<int> ImageIds);
    public sealed record InventoryAdjustmentRequest(int ProductId, int QuantityChange, string Reason, string? Notes);
    public sealed record UpdateOrderStatusRequest(string Status, string? TrackingNumber);
    public sealed record UpdateCustomOrderRequest(string Status, decimal? QuoteAmountInr, string? AdminNotes);
    private sealed record ProductImageResponse(int Id, string ImageUrl, int SortOrder, int Width, int Height);
}
