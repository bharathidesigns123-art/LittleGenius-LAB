using LittleGeniusLab.Api.Configuration;
using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Helpers;
using LittleGeniusLab.Api.Models;
using LittleGeniusLab.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

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

        group.MapGet("/orders", async (
            AppDbContext db,
            IConfiguration configuration,
            string? status,
            DateTime? dateFrom,
            DateTime? dateTo,
            string? customer) =>
        {
            IQueryable<Order> query = db.Orders
                .AsNoTracking()
                .Include(order => order.Items);

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(order => order.Status == status.Trim());
            }

            if (dateFrom is not null)
            {
                query = query.Where(order => order.CreatedAtUtc >= dateFrom.Value.Date);
            }

            if (dateTo is not null)
            {
                query = query.Where(order => order.CreatedAtUtc < dateTo.Value.Date.AddDays(1));
            }

            if (!string.IsNullOrWhiteSpace(customer))
            {
                var term = customer.Trim().ToLowerInvariant();
                query = query.Where(order =>
                    order.CustomerName.ToLower().Contains(term) ||
                    order.Email.ToLower().Contains(term) ||
                    order.Phone.ToLower().Contains(term) ||
                    order.OrderCode.ToLower().Contains(term));
            }

            var orders = await query
                .OrderByDescending(order => order.CreatedAtUtc)
                .ToListAsync();

            return Results.Ok(orders.Select(order => MapOrderDto(order, configuration)));
        });

        group.MapPut("/orders/{id:int}/status", async (
            int id,
            UpdateOrderStatusRequest request,
            AppDbContext db,
            IConfiguration configuration,
            ShiprocketService shiprocketService,
            WhatsAppNotificationService whatsappService,
            INotificationQueue notificationQueue) =>
        {
            var order = await db.Orders
                .Include(item => item.Items)
                .FirstOrDefaultAsync(item => item.Id == id);
            if (order is null)
            {
                return Results.NotFound(new { message = "Order not found." });
            }

            var nextStatus = request.Status.Trim();
            if (!OrderStatuses.All.Contains(nextStatus))
            {
                return Results.BadRequest(new { message = "Order status is invalid." });
            }

            var previousStatus = order.Status;
            order.Status = nextStatus;
            order.TrackingNumber = request.TrackingNumber?.Trim();
            order.PackageWeightKg = request.PackageWeightKg;
            order.PackageDimensionsCm = request.PackageDimensionsCm?.Trim();
            order.CourierPartner = request.CourierPartner?.Trim();

            // Shiprocket Integration: Trigger when status changes to Packed
            if (nextStatus == OrderStatuses.Packed && previousStatus != OrderStatuses.Packed)
            {
                var awb = await shiprocketService.CreateOrderAndGenerateAwbAsync(order);
                if (!string.IsNullOrEmpty(awb))
                {
                    order.TrackingNumber = awb;
                    order.CourierPartner = "Shiprocket";
                }
            }

            // WhatsApp Notification: Trigger when status changes to Delivered
            if (nextStatus == OrderStatuses.Delivered && previousStatus != OrderStatuses.Delivered)
            {
                await whatsappService.SendTemplateMessageAsync(
                    order.Phone, 
                    "order_delivered_template", 
                    [order.CustomerName, order.OrderCode]);
            }

            if (nextStatus == OrderStatuses.Shipped && order.ShippedAtUtc is null)
            {
                order.ShippedAtUtc = DateTime.UtcNow;
            }
            if (nextStatus == OrderStatuses.Delivered && order.DeliveredAtUtc is null)
            {
                order.DeliveredAtUtc = DateTime.UtcNow;
            }
            if (nextStatus == OrderStatuses.Cancelled && order.CancelledAtUtc is null)
            {
                order.CancelledAtUtc = DateTime.UtcNow;
                order.RefundStatus = order.PaymentStatus == PaymentStatuses.Paid
                    ? RefundStatuses.Pending
                    : RefundStatuses.Approved;
            }
            order.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync();
            if (previousStatus != nextStatus && nextStatus is OrderStatuses.Shipped or OrderStatuses.Delivered or OrderStatuses.Cancelled)
            {
                await notificationQueue.EnqueueAsync(new NotificationJob(NotificationJobKind.OrderStatusUpdate, order.Id));
            }

            return Results.Ok(MapOrderDto(order, configuration));
        });

        group.MapPut("/orders/{id:int}/refund", async (
            int id,
            UpdateRefundStatusRequest request,
            AppDbContext db,
            IConfiguration configuration) =>
        {
            var order = await db.Orders
                .Include(item => item.Items)
                .FirstOrDefaultAsync(item => item.Id == id);
            if (order is null)
            {
                return Results.NotFound(new { message = "Order not found." });
            }

            var nextRefundStatus = request.RefundStatus.Trim();
            if (!RefundStatuses.All.Contains(nextRefundStatus))
            {
                return Results.BadRequest(new { message = "Refund status is invalid." });
            }

            order.RefundStatus = nextRefundStatus;
            if (!string.IsNullOrWhiteSpace(request.AdminNote))
            {
                order.CancellationReason = string.IsNullOrWhiteSpace(order.CancellationReason)
                    ? request.AdminNote.Trim()
                    : $"{order.CancellationReason} Admin: {request.AdminNote.Trim()}";
            }
            order.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Ok(MapOrderDto(order, configuration));
        });

        group.MapGet("/custom-orders", async (
            AppDbContext db,
            string? status,
            DateTime? dateFrom,
            DateTime? dateTo,
            string? customer) =>
        {
            IQueryable<CustomOrderRequest> query = db.CustomOrderRequests.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(order => order.Status == status.Trim());
            }

            if (dateFrom is not null)
            {
                query = query.Where(order => order.CreatedAtUtc >= dateFrom.Value.Date);
            }

            if (dateTo is not null)
            {
                query = query.Where(order => order.CreatedAtUtc < dateTo.Value.Date.AddDays(1));
            }

            if (!string.IsNullOrWhiteSpace(customer))
            {
                var term = customer.Trim().ToLowerInvariant();
                query = query.Where(order =>
                    order.Name.ToLower().Contains(term) ||
                    order.Email.ToLower().Contains(term) ||
                    order.WhatsAppNumber.ToLower().Contains(term) ||
                    order.ReferenceCode.ToLower().Contains(term));
            }

            var customOrders = await query
                .OrderByDescending(order => order.CreatedAtUtc)
                .ToListAsync();

            return Results.Ok(customOrders.Select(MapCustomOrderDto));
        });

        group.MapPut("/custom-orders/{id:int}", async (
            int id, 
            UpdateCustomOrderRequest request, 
            AppDbContext db,
            WhatsAppNotificationService whatsappService) =>
        {
            var customOrder = await db.CustomOrderRequests.FirstOrDefaultAsync(item => item.Id == id);
            if (customOrder is null)
            {
                return Results.NotFound(new { message = "Custom order not found." });
            }

            var previousStatus = customOrder.Status;
            var nextStatus = request.Status.Trim();
            if (!CustomOrderStatuses.All.Contains(nextStatus))
            {
                return Results.BadRequest(new { message = "Custom order status is invalid." });
            }

            customOrder.Status = nextStatus;
            customOrder.QuoteAmountInr = request.QuoteAmountInr;
            customOrder.AdminNotes = request.AdminNotes?.Trim();

            // WhatsApp Notification: Trigger when Custom Order is Quoted
            if (nextStatus == CustomOrderStatuses.Quoted && previousStatus != CustomOrderStatuses.Quoted)
            {
                await whatsappService.SendTemplateMessageAsync(
                    customOrder.WhatsAppNumber,
                    "custom_order_quote_template",
                    [customOrder.Name, customOrder.ReferenceCode, customOrder.QuoteAmountInr?.ToString("N0") ?? "0"]);
            }

            customOrder.TrackingNumber = request.TrackingNumber?.Trim();
            customOrder.PackageWeightKg = request.PackageWeightKg;
            customOrder.PackageDimensionsCm = request.PackageDimensionsCm?.Trim();
            customOrder.CourierPartner = request.CourierPartner?.Trim();
            customOrder.RefundStatus = string.IsNullOrWhiteSpace(request.RefundStatus)
                ? customOrder.RefundStatus
                : request.RefundStatus.Trim();
            customOrder.CancellationReason = request.CancellationReason?.Trim();
            if (nextStatus == CustomOrderStatuses.Shipped && customOrder.ShippedAtUtc is null)
            {
                customOrder.ShippedAtUtc = DateTime.UtcNow;
            }
            if (nextStatus == CustomOrderStatuses.Delivered && customOrder.DeliveredAtUtc is null)
            {
                customOrder.DeliveredAtUtc = DateTime.UtcNow;
            }
            if (nextStatus == CustomOrderStatuses.Cancelled && customOrder.CancelledAtUtc is null)
            {
                customOrder.CancelledAtUtc = DateTime.UtcNow;
                customOrder.RefundStatus = customOrder.QuoteAmountInr > 0
                    ? RefundStatuses.Pending
                    : RefundStatuses.Approved;
            }
            customOrder.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Ok(MapCustomOrderDto(customOrder));
        });

        group.MapGet("/users", async (
            AppDbContext db,
            string? q,
            int page = 1,
            int pageSize = 20,
            string? sort = "createdDesc") =>
        {
            page = Math.Clamp(page, 1, 10_000);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = db.Users.AsNoTracking().Where(user => user.DeletedAtUtc == null);
            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLowerInvariant();
                query = query.Where(user =>
                    user.FullName.ToLower().Contains(term) ||
                    user.Email.ToLower().Contains(term));
            }

            query = sort switch
            {
                "nameAsc" => query.OrderBy(user => user.FullName),
                "nameDesc" => query.OrderByDescending(user => user.FullName),
                "emailAsc" => query.OrderBy(user => user.Email),
                "createdAsc" => query.OrderBy(user => user.CreatedAtUtc),
                _ => query.OrderByDescending(user => user.CreatedAtUtc)
            };

            var total = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(user => new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.Phone,
                    user.Role,
                    status = user.IsActive ? "active" : "blocked",
                    user.IsActive,
                    user.CreatedAtUtc,
                    user.UpdatedAtUtc
                })
                .ToListAsync();

            return Results.Ok(new { items, total, page, pageSize });
        });

        group.MapPost("/users", async (
            AdminCreateUserRequest request,
            AppDbContext db,
            IPasswordHasher<AppUser> passwordHasher) =>
        {
            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest(new { message = "Password is required." });
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            if (await db.Users.AnyAsync(user => user.Email == normalizedEmail && user.DeletedAtUtc == null))
            {
                return Results.BadRequest(new { message = "An account with this email already exists." });
            }

            var role = NormalizeAdminRoleOrDefault(request.Role);
            var user = new AppUser
            {
                FullName = request.FullName.Trim(),
                Email = normalizedEmail,
                Phone = string.IsNullOrWhiteSpace(request.Phone) ? string.Empty : request.Phone.Trim(),
                Role = role,
                IsActive = request.IsActive ?? true,
                UpdatedAtUtc = DateTime.UtcNow
            };
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return Results.Created($"/api/admin/users/{user.Id}", MapAdminUserSummary(user));
        });

        group.MapPut("/users/{id:int}", async (
            int id,
            AdminUpdateUserRequest request,
            AppDbContext db,
            IPasswordHasher<AppUser> passwordHasher,
            IOptions<AdminOptions> adminOptions) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id && u.DeletedAtUtc == null);
            if (user is null)
            {
                return Results.NotFound(new { message = "User not found." });
            }

            var opts = adminOptions.Value;
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            if (await db.Users.AnyAsync(u =>
                    u.Email == normalizedEmail &&
                    u.DeletedAtUtc == null &&
                    u.Id != id))
            {
                return Results.BadRequest(new { message = "Another account already uses this email." });
            }

            if (IsSuperAdmin(user.Id, opts) &&
                NormalizeAdminRoleOrDefault(request.Role) != AppRoles.Admin)
            {
                return Results.BadRequest(new { message = "The primary administrator cannot be demoted." });
            }

            user.FullName = request.FullName.Trim();
            user.Email = normalizedEmail;
            user.Phone = string.IsNullOrWhiteSpace(request.Phone) ? string.Empty : request.Phone.Trim();
            user.Role = NormalizeAdminRoleOrDefault(request.Role);
            user.IsActive = request.IsActive;
            user.UpdatedAtUtc = DateTime.UtcNow;

            if (IsSuperAdmin(user.Id, opts) && !user.IsActive)
            {
                return Results.BadRequest(new { message = "The primary administrator cannot be blocked." });
            }

            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                user.PasswordHash = passwordHasher.HashPassword(user, request.NewPassword!);
            }

            await db.SaveChangesAsync();
            return Results.Ok(MapAdminUserSummary(user));
        });

        group.MapPatch("/users/{id:int}/status", async (
            int id,
            AdminUserStatusPatchRequest request,
            AppDbContext db,
            IOptions<AdminOptions> adminOptions) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id && u.DeletedAtUtc == null);
            if (user is null)
            {
                return Results.NotFound(new { message = "User not found." });
            }

            if (IsSuperAdmin(user.Id, adminOptions.Value) && !request.IsActive)
            {
                return Results.BadRequest(new { message = "The primary administrator cannot be blocked." });
            }

            user.IsActive = request.IsActive;
            user.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Ok(MapAdminUserSummary(user));
        });

        group.MapPatch("/users/{id:int}/role", async (
            int id,
            AdminUserRolePatchRequest request,
            AppDbContext db,
            IOptions<AdminOptions> adminOptions) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id && u.DeletedAtUtc == null);
            if (user is null)
            {
                return Results.NotFound(new { message = "User not found." });
            }

            var nextRole = NormalizeAdminRoleOrDefault(request.Role);
            if (IsSuperAdmin(user.Id, adminOptions.Value) && nextRole != AppRoles.Admin)
            {
                return Results.BadRequest(new { message = "The primary administrator cannot be demoted." });
            }

            user.Role = nextRole;
            user.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Ok(MapAdminUserSummary(user));
        });

        group.MapDelete("/users/{id:int}", async (
            int id,
            HttpContext context,
            AppDbContext db,
            IOptions<AdminOptions> adminOptions) =>
        {
            var actorId = context.User.GetUserId();
            if (actorId == id)
            {
                return Results.BadRequest(new { message = "You cannot delete the account you are signed in with." });
            }

            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id && u.DeletedAtUtc == null);
            if (user is null)
            {
                return Results.NotFound(new { message = "User not found." });
            }

            if (IsSuperAdmin(user.Id, adminOptions.Value))
            {
                return Results.BadRequest(new { message = "The primary administrator account cannot be deleted." });
            }

            user.DeletedAtUtc = DateTime.UtcNow;
            user.IsActive = false;
            user.Email = $"archived+{user.Id}+{Guid.NewGuid():N}@users.internal";
            user.UpdatedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "User removed." });
        });

        return routes;
    }

    private static object MapAdminUserSummary(AppUser user) => new
    {
        user.Id,
        user.FullName,
        user.Email,
        user.Phone,
        user.Role,
        status = user.IsActive ? "active" : "blocked",
        user.IsActive,
        user.CreatedAtUtc,
        user.UpdatedAtUtc
    };

    private static string NormalizeAdminRoleOrDefault(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return AppRoles.Customer;
        }

        var trimmed = role.Trim();
        if (string.Equals(trimmed, AppRoles.Admin, StringComparison.OrdinalIgnoreCase))
        {
            return AppRoles.Admin;
        }

        return AppRoles.Customer;
    }

    private static bool IsSuperAdmin(int userId, AdminOptions options) =>
        options.SuperAdminUserId is int superId && superId == userId;

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
    public sealed record UpdateOrderStatusRequest(
        string Status,
        string? TrackingNumber,
        decimal? PackageWeightKg,
        string? PackageDimensionsCm,
        string? CourierPartner);
    public sealed record UpdateRefundStatusRequest(string RefundStatus, string? AdminNote);
    public sealed record UpdateCustomOrderRequest(
        string Status,
        decimal? QuoteAmountInr,
        string? AdminNotes,
        string? TrackingNumber,
        decimal? PackageWeightKg,
        string? PackageDimensionsCm,
        string? CourierPartner,
        string? RefundStatus,
        string? CancellationReason);
    public sealed record AdminCreateUserRequest(
        string FullName,
        string Email,
        string? Phone,
        string Password,
        string? Role,
        bool? IsActive);

    public sealed record AdminUpdateUserRequest(
        string FullName,
        string Email,
        string? Phone,
        string Role,
        bool IsActive,
        string? NewPassword);

    public sealed record AdminUserStatusPatchRequest(bool IsActive);

    public sealed record AdminUserRolePatchRequest(string Role);
    private sealed record ProductImageResponse(int Id, string ImageUrl, int SortOrder, int Width, int Height);

    private static bool IsCancellationAllowed(string status, IConfiguration configuration)
    {
        if (status == OrderStatuses.Cancelled || status == OrderStatuses.Delivered)
        {
            return false;
        }

        var allowAfterShipment = configuration.GetValue("Orders:AllowCancellationAfterShipment", false);
        return allowAfterShipment || status is not OrderStatuses.Shipped;
    }

    private static object MapOrderDto(Order order, IConfiguration configuration) => new
    {
        order.Id,
        order.OrderCode,
        order.CustomerName,
        order.Email,
        order.Phone,
        order.Status,
        order.PaymentStatus,
        order.PaymentMethod,
        order.SubtotalInr,
        order.ShippingFeeInr,
        order.TotalPriceInr,
        order.Notes,
        order.TrackingNumber,
        order.PackageWeightKg,
        order.PackageDimensionsCm,
        order.CourierPartner,
        order.RefundStatus,
        order.CancellationReason,
        order.CancelledAtUtc,
        order.ShippedAtUtc,
        order.DeliveredAtUtc,
        order.CreatedAtUtc,
        cancellationEligible = IsCancellationAllowed(order.Status, configuration),
        shippingAddress = new
        {
            order.CustomerName,
            order.Email,
            order.Phone,
            order.Line1,
            order.Line2,
            order.City,
            order.State,
            order.Country,
            order.Pincode
        },
        items = order.Items.Select(item => new
        {
            item.ProductName,
            item.Quantity,
            item.TotalPriceInr
        })
    };

    private static object MapCustomOrderDto(CustomOrderRequest order) => new
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
        order.BaseMessage,
        order.Pincode,
        order.Status,
        order.QuoteAmountInr,
        order.AdminNotes,
        order.TrackingNumber,
        order.PackageWeightKg,
        order.PackageDimensionsCm,
        order.CourierPartner,
        order.RefundStatus,
        order.CancellationReason,
        order.CancelledAtUtc,
        order.ShippedAtUtc,
        order.DeliveredAtUtc,
        order.CreatedAtUtc,
        order.UpdatedAtUtc
    };
}
