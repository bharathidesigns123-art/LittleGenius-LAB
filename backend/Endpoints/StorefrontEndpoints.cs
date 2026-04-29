using System.Text.Json;
using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Helpers;
using LittleGeniusLab.Api.Models;
using LittleGeniusLab.Api.Services;
using Microsoft.EntityFrameworkCore;
using Azure.Storage.Sas;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace LittleGeniusLab.Api.Endpoints;

public static class StorefrontEndpoints
{
    public static IEndpointRouteBuilder MapStorefrontEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/store");

        group.MapGet("/home", async (AppDbContext db) =>
        {
            var categories = await db.Categories
                .AsNoTracking()
                .Where(category => category.IsActive)
                .OrderBy(category => category.SortOrder)
                .Select(category => new
                {
                    category.Id,
                    category.Name,
                    category.Slug,
                    category.Description,
                    category.PriceRange,
                    category.ThemeColor,
                    category.ImageUrl
                })
                .ToListAsync();

            var featuredProducts = await db.Products
                .AsNoTracking()
                .Include(product => product.Category)
                .Where(product => product.IsPublished && product.IsFeatured)
                .OrderBy(product => product.DisplayOrder)
                .Select(product => new
                {
                    product.Id,
                    product.Name,
                    product.Slug,
                    product.PriceInr,
                    product.Badge,
                    product.Tagline,
                    heroImageUrl = product.Images
                        .OrderBy(image => image.SortOrder)
                        .Select(image => image.ImageUrl)
                        .FirstOrDefault() ?? product.HeroImageUrl,
                    product.StockQuantity,
                    averageRating = product.Reviews
                        .Where(review => review.IsApproved)
                        .Select(review => (double?)review.Rating)
                        .Average() ?? 0,
                    reviewCount = product.Reviews.Count(review => review.IsApproved),
                    categorySlug = product.Category!.Slug,
                    categoryName = product.Category.Name
                })
                .ToListAsync();

            var reviews = await db.Reviews
                .AsNoTracking()
                .Where(review => review.IsApproved && !string.IsNullOrWhiteSpace(review.Quote))
                .OrderBy(review => review.DisplayOrder)
                .Take(3)
                .Select(review => new
                {
                    review.CustomerName,
                    review.CustomerLocation,
                    review.Rating,
                    review.Quote
                })
                .ToListAsync();

            return Results.Ok(new
            {
                hero = new
                {
                    eyebrow = "Made in Tamil Nadu, India",
                    title = "Where imagination gets a shape",
                    subtitle = "Handcrafted 3D printed toys for playful shelves, heartfelt gifting, and one-of-a-kind custom memories.",
                    primaryCta = "Explore the Magic",
                    secondaryCta = "Design My Custom Toy"
                },
                trustBar = new[]
                {
                    "Made in Tamil Nadu",
                    "Child-safe PLA",
                    "Ships in 2 Days",
                    "WhatsApp support"
                },
                categories,
                featuredProducts,
                reviews
            });
        });

        group.MapGet("/categories", async (AppDbContext db) =>
            Results.Ok(await db.Categories
                .AsNoTracking()
                .Where(category => category.IsActive)
                .OrderBy(category => category.SortOrder)
                .Select(category => new
                {
                    category.Id,
                    category.Name,
                    category.Slug,
                    category.Description,
                    category.PriceRange,
                    category.ThemeColor,
                    category.ImageUrl
                })
                .ToListAsync()));

        group.MapGet("/products", async (
            AppDbContext db,
            string? category,
            string? search,
            string? sort) =>
        {
            IQueryable<Product> query = db.Products
                .AsNoTracking()
                .Include(product => product.Category)
                .Where(product => product.IsPublished);

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(product => product.Category!.Slug == category);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLowerInvariant();
                query = query.Where(product =>
                    product.Name.ToLower().Contains(term) ||
                    product.ShortDescription.ToLower().Contains(term));
            }

            query = sort switch
            {
                "price-asc" => query.OrderBy(product => product.PriceInr),
                "price-desc" => query.OrderByDescending(product => product.PriceInr),
                "newest" => query.OrderByDescending(product => product.CreatedAtUtc),
                _ => query.OrderBy(product => product.DisplayOrder)
            };

            var products = await query
                .Select(product => new
                {
                    product.Id,
                    product.Name,
                    product.Slug,
                    product.ShortDescription,
                    product.PriceInr,
                    product.CompareAtPriceInr,
                    product.Badge,
                    heroImageUrl = product.Images
                        .OrderBy(image => image.SortOrder)
                        .Select(image => image.ImageUrl)
                        .FirstOrDefault() ?? product.HeroImageUrl,
                    product.Colourway,
                    product.Material,
                    product.ShipsIn,
                    product.SizeMm,
                    product.StockQuantity,
                    product.IsFeatured,
                    averageRating = product.Reviews
                        .Where(review => review.IsApproved)
                        .Select(review => (double?)review.Rating)
                        .Average() ?? 0,
                    reviewCount = product.Reviews.Count(review => review.IsApproved),
                    categorySlug = product.Category!.Slug,
                    categoryName = product.Category.Name
                })
                .ToListAsync();

            return Results.Ok(products);
        });

        group.MapGet("/products/{slug}", async (string slug, AppDbContext db) =>
        {
            var product = await db.Products
                .AsNoTracking()
                .Include(item => item.Category)
                .Include(item => item.Images)
                .Include(item => item.Reviews)
                .FirstOrDefaultAsync(item => item.Slug == slug && item.IsPublished);

            if (product is null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            var approvedReviews = product.Reviews
                .Where(review => review.IsApproved)
                .OrderByDescending(review => review.IsVerifiedPurchase)
                .ThenByDescending(review => review.UpdatedAtUtc)
                .ThenBy(review => review.DisplayOrder)
                .ToList();
            var averageRating = approvedReviews.Count == 0
                ? 0
                : Math.Round(approvedReviews.Average(review => review.Rating), 1, MidpointRounding.AwayFromZero);
            var primaryImageUrl = GetPrimaryImageUrl(product);
            var productImages = MapProductImages(product);

            var relatedProducts = await db.Products
                .AsNoTracking()
                .Where(item =>
                    item.CategoryId == product.CategoryId &&
                    item.Id != product.Id &&
                    item.IsPublished)
                .OrderBy(item => item.DisplayOrder)
                .Take(4)
                .Select(item => new
                {
                    item.Id,
                    item.Name,
                    item.Slug,
                    item.PriceInr,
                    heroImageUrl = item.Images
                        .OrderBy(image => image.SortOrder)
                        .Select(image => image.ImageUrl)
                        .FirstOrDefault() ?? item.HeroImageUrl
                })
                .ToListAsync();

            return Results.Ok(new
            {
                product = new
                {
                    product.Id,
                    product.Name,
                    product.Slug,
                    product.Sku,
                    product.ShortDescription,
                    product.FullDescription,
                    product.PriceInr,
                    product.CompareAtPriceInr,
                    product.Badge,
                    heroImageUrl = primaryImageUrl,
                    product.Colourway,
                    product.Material,
                    product.Finish,
                    product.ShipsIn,
                    product.MadeIn,
                    product.Tagline,
                    product.SizeMm,
                    product.StockQuantity,
                    averageRating,
                    reviewCount = approvedReviews.Count,
                    categorySlug = product.Category!.Slug,
                    categoryName = product.Category.Name
                },
                images = productImages,
                reviews = approvedReviews
                    .Select(review => new
                    {
                        review.Id,
                        review.CustomerName,
                        review.CustomerLocation,
                        review.Rating,
                        quote = review.Quote,
                        comment = review.Quote,
                        review.IsVerifiedPurchase,
                        review.CreatedAtUtc,
                        review.UpdatedAtUtc
                    }),
                relatedProducts
            });
        });

        group.MapGet("/products/{slug}/images", async (string slug, AppDbContext db) =>
        {
            var product = await db.Products
                .AsNoTracking()
                .Include(item => item.Images)
                .FirstOrDefaultAsync(item => item.Slug == slug && item.IsPublished);

            if (product is null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            return Results.Ok(new
            {
                productId = product.Id,
                images = MapProductImages(product)
            });
        });

        group.MapPost("/uploads/sas", async (HttpRequest request, FileStorageService storage) =>
        {
            try
            {
                var body = await request.ReadFromJsonAsync<JsonElement?>();
                if (body is null || !body.Value.TryGetProperty("fileName", out var fileNameEl))
                {
                    return Results.BadRequest(new { message = "fileName is required in JSON body" });
                }

                var fileName = fileNameEl.GetString() ?? $"{Guid.NewGuid():N}";
                var contentType = body.Value.TryGetProperty("contentType", out var ct) ? ct.GetString() : null;

                var result = await storage.GetUploadSasAsync(fileName, contentType);
                return Results.Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, title: "Failed to generate SAS token");
            }
        });

        group.MapPost("/custom-orders", async (
            HttpContext context,
            CreateCustomOrderRequest request,
            AppDbContext db,
            IConfiguration configuration) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.WhatsAppNumber) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                (string.IsNullOrWhiteSpace(request.PhotoUrl) && string.IsNullOrWhiteSpace(request.CharacterDescription)))
            {
                return Results.BadRequest(new
                {
                    message = "Name, email, WhatsApp number, and either a photo or description are required."
                });
            }

            var referenceCode = $"LGL-{Random.Shared.Next(1000, 9999)}";
            var customOrder = new CustomOrderRequest
            {
                UserId = context.User.GetUserId(),
                ReferenceCode = referenceCode,
                Name = request.Name.Trim(),
                Email = request.Email.Trim().ToLowerInvariant(),
                WhatsAppNumber = request.WhatsAppNumber.Trim(),
                Occasion = request.Occasion.Trim(),
                Size = request.Size.Trim(),
                ColorPreference = request.ColorPreference.Trim(),
                CharacterDescription = request.CharacterDescription?.Trim(),
                PhotoUrl = request.PhotoUrl?.Trim(),
                BaseMessage = request.BaseMessage?.Trim(),
                Pincode = request.Pincode?.Trim(),
                Status = CustomOrderStatuses.New
            };

            db.CustomOrderRequests.Add(customOrder);
            await db.SaveChangesAsync();

            var businessNumber = configuration["Business:WhatsAppNumber"] ?? "919876543210";
            var whatsappUrl = $"https://wa.me/{businessNumber}?text={Uri.EscapeDataString($"Hi Team LittleGenius LAB! I just submitted custom order {referenceCode}.")}";

            return Results.Created($"/api/store/custom-orders/{customOrder.Id}", new
            {
                customOrder.Id,
                customOrder.ReferenceCode,
                customOrder.Status,
                whatsappUrl
            });
        });

        group.MapPost("/orders", async (
            HttpContext context,
            CreateOrderRequest request,
            AppDbContext db) =>
        {
            if (request.Items.Count == 0)
            {
                return Results.BadRequest(new { message = "At least one cart item is required." });
            }

            if (string.IsNullOrWhiteSpace(request.CustomerName) ||
                string.IsNullOrWhiteSpace(request.Phone) ||
                string.IsNullOrWhiteSpace(request.Line1) ||
                string.IsNullOrWhiteSpace(request.City) ||
                string.IsNullOrWhiteSpace(request.State) ||
                string.IsNullOrWhiteSpace(request.Pincode))
            {
                return Results.BadRequest(new { message = "Shipping details are incomplete." });
            }

            var productIds = request.Items.Select(item => item.ProductId).Distinct().ToList();
            var products = await db.Products
                .Where(product => product.IsPublished && productIds.Contains(product.Id))
                .ToListAsync();

            if (products.Count != productIds.Count)
            {
                return Results.BadRequest(new { message = "One or more cart items are invalid." });
            }

            foreach (var item in request.Items)
            {
                var product = products.First(product => product.Id == item.ProductId);
                if (product.StockQuantity < item.Quantity)
                {
                    return Results.BadRequest(new { message = $"{product.Name} does not have enough stock." });
                }
            }

            var order = new Order
            {
                UserId = context.User.GetUserId(),
                OrderCode = $"LGL-ORD-{Random.Shared.Next(10000, 99999)}",
                CustomerName = request.CustomerName.Trim(),
                Email = request.Email.Trim().ToLowerInvariant(),
                Phone = request.Phone.Trim(),
                Line1 = request.Line1.Trim(),
                Line2 = request.Line2?.Trim(),
                City = request.City.Trim(),
                State = request.State.Trim(),
                Country = string.IsNullOrWhiteSpace(request.Country) ? "India" : request.Country.Trim(),
                Pincode = request.Pincode.Trim(),
                PaymentMethod = request.PaymentMethod.Trim(),
                PaymentStatus = PaymentStatuses.Pending,
                Status = OrderStatuses.Pending,
                Notes = request.Notes?.Trim()
            };

            foreach (var item in request.Items)
            {
                var product = products.First(product => product.Id == item.ProductId);
                var quantity = Math.Max(1, item.Quantity);

                product.StockQuantity -= quantity;
                product.UpdatedAtUtc = DateTime.UtcNow;

                order.Items.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ProductSlug = product.Slug,
                    Quantity = quantity,
                    UnitPriceInr = product.PriceInr,
                    TotalPriceInr = product.PriceInr * quantity
                });

                db.InventoryAdjustments.Add(new InventoryAdjustment
                {
                    ProductId = product.Id,
                    UpdatedByUserId = context.User.GetUserId(),
                    QuantityChange = -quantity,
                    Reason = "Order placed",
                    Notes = order.OrderCode
                });
            }

            order.SubtotalInr = order.Items.Sum(item => item.TotalPriceInr);
            order.ShippingFeeInr = order.SubtotalInr >= 499 ? 0 : 60;
            order.TotalPriceInr = order.SubtotalInr + order.ShippingFeeInr;

            db.Orders.Add(order);
            await db.SaveChangesAsync();

            return Results.Created($"/api/store/orders/{order.Id}", new
            {
                order.Id,
                order.OrderCode,
                order.Status,
                order.PaymentStatus,
                order.TotalPriceInr
            });
        });

        group.MapGet("/orders/track/{orderCode}", async (
            string orderCode,
            string phone,
            AppDbContext db) =>
        {
            var trimmedPhone = phone.Trim();
            var order = await db.Orders
                .AsNoTracking()
                .Include(item => item.Items)
                .FirstOrDefaultAsync(item => item.OrderCode == orderCode && item.Phone == trimmedPhone);

            if (order is null)
            {
                return Results.NotFound(new { message = "No matching order found." });
            }

            return Results.Ok(new
            {
                order.OrderCode,
                order.Status,
                order.PaymentStatus,
                order.PaymentMethod,
                order.TrackingNumber,
                order.CreatedAtUtc,
                items = order.Items.Select(item => new
                {
                    item.ProductName,
                    item.Quantity,
                    item.TotalPriceInr
                })
            });
        });

        group.MapPost("/payments/razorpay/order", async (
            CreateRazorpayOrderRequest request,
            AppDbContext db,
            RazorpayService razorpayService,
            CancellationToken cancellationToken) =>
        {
            var order = await db.Orders.FirstOrDefaultAsync(item => item.OrderCode == request.OrderCode, cancellationToken);
            if (order is null)
            {
                return Results.NotFound(new { message = "Order not found." });
            }

            if (!razorpayService.IsConfigured)
            {
                return Results.BadRequest(new { message = "Razorpay is not configured." });
            }

            var razorpayOrder = await razorpayService.CreateOrderAsync(order.OrderCode, order.TotalPriceInr, cancellationToken);

            var transaction = new PaymentTransaction
            {
                OrderId = order.Id,
                Provider = "Razorpay",
                ProviderOrderId = razorpayOrder.ProviderOrderId,
                Receipt = order.OrderCode,
                AmountInr = order.TotalPriceInr,
                Currency = razorpayOrder.Currency,
                Status = PaymentStatuses.Pending,
                RawPayloadJson = JsonSerializer.Serialize(razorpayOrder)
            };

            db.PaymentTransactions.Add(transaction);
            await db.SaveChangesAsync(cancellationToken);

            return Results.Ok(new
            {
                publicKey = razorpayService.PublicKeyId,
                callbackUrl = razorpayService.CallbackUrl,
                orderCode = order.OrderCode,
                customer = new
                {
                    order.CustomerName,
                    order.Email,
                    order.Phone
                },
                razorpayOrder = new
                {
                    id = razorpayOrder.ProviderOrderId,
                    amount = razorpayOrder.AmountInPaise,
                    currency = razorpayOrder.Currency
                }
            });
        });

        group.MapPost("/payments/razorpay/verify", async (
            VerifyRazorpayPaymentRequest request,
            AppDbContext db,
            RazorpayService razorpayService,
            CancellationToken cancellationToken) =>
        {
            var order = await db.Orders
                .Include(item => item.Payments)
                .FirstOrDefaultAsync(item => item.OrderCode == request.OrderCode, cancellationToken);

            if (order is null)
            {
                return Results.NotFound(new { message = "Order not found." });
            }

            var transaction = order.Payments
                .OrderByDescending(payment => payment.CreatedAtUtc)
                .FirstOrDefault(payment => payment.ProviderOrderId == request.RazorpayOrderId);

            if (transaction is null)
            {
                return Results.BadRequest(new { message = "Payment transaction not found." });
            }

            var signatureValid = razorpayService.VerifySignature(
                request.ServerOrderId,
                request.RazorpayPaymentId,
                request.RazorpaySignature);

            if (!signatureValid)
            {
                transaction.Status = PaymentStatuses.Failed;
                transaction.FailureReason = "Invalid Razorpay signature.";
                transaction.UpdatedAtUtc = DateTime.UtcNow;
                await db.SaveChangesAsync(cancellationToken);

                return Results.BadRequest(new { message = "Payment verification failed." });
            }

            transaction.ProviderPaymentId = request.RazorpayPaymentId;
            transaction.Status = PaymentStatuses.Paid;
            transaction.RawPayloadJson = JsonSerializer.Serialize(request);
            transaction.UpdatedAtUtc = DateTime.UtcNow;

            order.PaymentStatus = PaymentStatuses.Paid;
            order.Status = OrderStatuses.Printing;
            order.UpdatedAtUtc = DateTime.UtcNow;

            await db.SaveChangesAsync(cancellationToken);

            return Results.Ok(new
            {
                order.OrderCode,
                order.Status,
                order.PaymentStatus
            });
        });

        return routes;
    }

    public sealed record CreateCustomOrderRequest(
        string Name,
        string Email,
        string WhatsAppNumber,
        string Occasion,
        string Size,
        string ColorPreference,
        string? CharacterDescription,
        string? PhotoUrl,
        string? BaseMessage,
        string? Pincode);

    public sealed record CreateOrderRequest(
        string CustomerName,
        string Email,
        string Phone,
        string Line1,
        string? Line2,
        string City,
        string State,
        string Country,
        string Pincode,
        string PaymentMethod,
        string? Notes,
        List<CreateOrderItemRequest> Items);

    public sealed record CreateOrderItemRequest(int ProductId, int Quantity);
    public sealed record CreateRazorpayOrderRequest(string OrderCode);
    public sealed record VerifyRazorpayPaymentRequest(
        string OrderCode,
        string ServerOrderId,
        string RazorpayOrderId,
        string RazorpayPaymentId,
        string RazorpaySignature);

    private static string GetPrimaryImageUrl(Product product) =>
        product.Images
            .OrderBy(image => image.SortOrder)
            .Select(image => image.ImageUrl)
            .FirstOrDefault() ?? product.HeroImageUrl;

    private static IReadOnlyList<ProductImageResponse> MapProductImages(Product product)
    {
        var images = product.Images ?? [];
        
        return images
            .OrderBy(image => image.SortOrder)
            .Select(image => new ProductImageResponse(
                image.Id,
                image.ImageUrl,
                image.SortOrder,
                image.Width,
                image.Height))
            .ToList();
    }

    private sealed record ProductImageResponse(int Id, string ImageUrl, int SortOrder, int Width, int Height);
}
