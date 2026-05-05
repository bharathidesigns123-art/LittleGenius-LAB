using System.Text.Json;
using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Helpers;
using LittleGeniusLab.Api.Models;
using LittleGeniusLab.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Azure.Storage.Sas;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;

namespace LittleGeniusLab.Api.Endpoints;

public static class StorefrontEndpoints
{
    private static readonly JsonSerializerOptions WebJson = new(JsonSerializerDefaults.Web);

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

            var customUid = context.User.GetUserId();
            var customBlocked = await UserLifecycleGuard.RejectIfCustomerDisabledAsync(db, customUid);
            if (customBlocked is not null)
            {
                return customBlocked;
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
            AppDbContext db,
            INotificationQueue notificationQueue) =>
        {
            return Results.BadRequest(new
            {
                message = "Cash on Delivery is temporarily unavailable. Please use Razorpay (Card/UPI) for your order."
            });

            /*
            if (string.Equals(request.PaymentMethod.Trim(), "Razorpay", StringComparison.OrdinalIgnoreCase))
            */

            var (cart, validationError) = await TryValidateCheckoutAsync(context, request, db);
            if (validationError is not null)
            {
                return validationError;
            }

            var order = await PersistCodOrderAsync(db, cart!, context, request.PaymentMethod.Trim());
            await QueueOrderPlacedNotificationsAsync(notificationQueue, order.Id);
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
            AppDbContext db,
            IConfiguration configuration) =>
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
                order.RefundStatus,
                order.CancellationReason,
                order.CancelledAtUtc,
                order.ShippedAtUtc,
                order.DeliveredAtUtc,
                cancellationEligible = IsCancellationAllowed(order.Status, configuration),
                items = order.Items.Select(item => new
                {
                    item.ProductName,
                    item.Quantity,
                    item.TotalPriceInr
                })
            });
        });

        group.MapPost("/payments/razorpay/prepare", async (
            HttpContext context,
            CreateOrderRequest request,
            AppDbContext db,
            RazorpayService razorpayService,
            CancellationToken cancellationToken) =>
        {
            if (!razorpayService.IsConfigured)
            {
                return Results.BadRequest(new
                {
                    message =
                        "Razorpay is not configured on the server. Check Azure App Service environment variables: Razorpay__KeyId and Razorpay__KeySecret."
                });
            }

            var (cart, validationError) = await TryValidateCheckoutAsync(context, request, db);
            if (validationError is not null)
            {
                return validationError;
            }

            var subtotal = cart!.Lines.Sum(line => line.Product.PriceInr * line.Quantity);
            var shippingFee = subtotal >= 499 ? 0 : 60;
            var total = subtotal + shippingFee;

            var receipt = $"LGL-PAY-{Guid.NewGuid():N}";
            RazorpayOrderResult razorpayOrder;
            try
            {
                razorpayOrder = await razorpayService.CreateOrderAsync(receipt, total, cancellationToken);
            }
            catch (Exception exception)
            {
                return Results.Problem(
                    detail: exception.Message,
                    title: "Razorpay API Error",
                    statusCode: 500);
            }

            var snapshot = new PendingRazorpayCheckoutSnapshot(
                cart.UserId,
                cart.GuestId,
                cart.CustomerName,
                cart.Email,
                cart.Phone,
                cart.Line1,
                cart.Line2,
                cart.City,
                cart.State,
                cart.Country,
                cart.Pincode,
                cart.Notes,
                cart.Lines
                    .Select(line => new PendingRazorpayLineSnapshot(line.Product.Id, line.Quantity, line.Product.PriceInr))
                    .ToList());

            var transaction = new PaymentTransaction
            {
                OrderId = null,
                Provider = "Razorpay",
                ProviderOrderId = razorpayOrder.ProviderOrderId,
                Receipt = receipt,
                AmountInr = total,
                Currency = razorpayOrder.Currency,
                Status = PaymentStatuses.Pending,
                PendingCheckoutJson = JsonSerializer.Serialize(snapshot, WebJson),
                RawPayloadJson = JsonSerializer.Serialize(razorpayOrder)
            };

            db.PaymentTransactions.Add(transaction);
            await db.SaveChangesAsync(cancellationToken);

            return Results.Ok(new
            {
                publicKey = razorpayService.PublicKeyId,
                callbackUrl = razorpayService.CallbackUrl,
                checkoutReceipt = receipt,
                customer = new
                {
                    customerName = cart.CustomerName,
                    email = cart.Email,
                    phone = cart.Phone
                },
                razorpayOrder = new
                {
                    id = razorpayOrder.ProviderOrderId,
                    amount = razorpayOrder.AmountInPaise,
                    currency = razorpayOrder.Currency
                }
            });
        });

        group.MapPost("/orders/track/{orderCode}/cancel", async (
            string orderCode,
            CancelTrackedOrderRequest request,
            AppDbContext db,
            IConfiguration configuration,
            INotificationQueue notificationQueue) =>
        {
            if (string.IsNullOrWhiteSpace(request.Phone))
            {
                return Results.BadRequest(new { message = "Phone number is required to cancel a guest order." });
            }

            var trimmedPhone = request.Phone.Trim();
            var order = await db.Orders
                .Include(item => item.Items)
                .FirstOrDefaultAsync(item => item.OrderCode == orderCode && item.Phone == trimmedPhone);

            if (order is null)
            {
                return Results.NotFound(new { message = "No matching order found." });
            }

            var cancelResult = await CancelOrderAsync(order, request.Reason, db, configuration);
            if (cancelResult is null)
            {
                await notificationQueue.EnqueueAsync(new NotificationJob(NotificationJobKind.OrderStatusUpdate, order.Id));
            }
            return cancelResult is not null ? cancelResult : Results.Ok(MapOrderCancellation(order, configuration));
        });

        group.MapGet("/custom-orders/track/{referenceCode}", async (
            string referenceCode,
            string phone,
            AppDbContext db) =>
        {
            var trimmedPhone = phone.Trim();
            var customOrder = await db.CustomOrderRequests
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.ReferenceCode == referenceCode && item.WhatsAppNumber == trimmedPhone);

            if (customOrder is null)
            {
                return Results.NotFound(new { message = "No matching custom order found." });
            }

            return Results.Ok(MapCustomOrderTracking(customOrder));
        });

        group.MapPost("/payments/razorpay/verify", async (
            VerifyRazorpayPaymentRequest request,
            HttpContext httpContext,
            AppDbContext db,
            RazorpayService razorpayService,
            INotificationQueue notificationQueue,
            CancellationToken cancellationToken) =>
        {
            var transaction = await db.PaymentTransactions
                .FirstOrDefaultAsync(
                    payment => payment.ProviderOrderId == request.RazorpayOrderId,
                    cancellationToken);

            if (transaction is null)
            {
                return Results.NotFound(new { message = "Payment transaction not found." });
            }

            if (!string.Equals(transaction.ProviderOrderId, request.ServerOrderId, StringComparison.Ordinal) ||
                !string.Equals(transaction.ProviderOrderId, request.RazorpayOrderId, StringComparison.Ordinal))
            {
                return Results.BadRequest(new { message = "Razorpay order id mismatch." });
            }

            if (transaction.Status == PaymentStatuses.Paid && transaction.OrderId is not null)
            {
                var existing = await db.Orders.AsNoTracking()
                    .FirstAsync(order => order.Id == transaction.OrderId, cancellationToken);
                return Results.Ok(new
                {
                    orderCode = existing.OrderCode,
                    existing.Status,
                    existing.PaymentStatus
                });
            }

            if (transaction.Status == PaymentStatuses.Failed)
            {
                return Results.BadRequest(new { message = "This payment attempt already failed verification." });
            }

            bool signatureValid;
            try
            {
                signatureValid = razorpayService.VerifySignature(
                    request.ServerOrderId,
                    request.RazorpayPaymentId,
                    request.RazorpaySignature);
            }
            catch (InvalidOperationException exception)
            {
                return Results.BadRequest(new { message = exception.Message });
            }

            if (!signatureValid)
            {
                transaction.Status = PaymentStatuses.Failed;
                transaction.FailureReason = "Invalid Razorpay signature.";
                transaction.UpdatedAtUtc = DateTime.UtcNow;
                await db.SaveChangesAsync(cancellationToken);

                return Results.BadRequest(new { message = "Payment verification failed." });
            }

            if (transaction.OrderId is not null && !string.IsNullOrWhiteSpace(request.OrderCode))
            {
                var legacyOrder = await db.Orders
                    .FirstOrDefaultAsync(order => order.OrderCode == request.OrderCode, cancellationToken);
                if (legacyOrder is null || transaction.OrderId != legacyOrder.Id)
                {
                    return Results.BadRequest(new { message = "Order does not match this Razorpay payment." });
                }
            }

            if (transaction.OrderId is not null)
            {
                transaction.ProviderPaymentId = request.RazorpayPaymentId;
                transaction.Status = PaymentStatuses.Paid;
                transaction.RawPayloadJson = JsonSerializer.Serialize(request);
                transaction.UpdatedAtUtc = DateTime.UtcNow;

                var orderRow = await db.Orders.FirstAsync(order => order.Id == transaction.OrderId, cancellationToken);
                orderRow.PaymentStatus = PaymentStatuses.Paid;
                orderRow.Status = OrderStatuses.Printing;
                orderRow.UpdatedAtUtc = DateTime.UtcNow;

                await db.SaveChangesAsync(cancellationToken);
                await QueueOrderPlacedNotificationsAsync(notificationQueue, orderRow.Id, cancellationToken);

                return Results.Ok(new
                {
                    orderCode = orderRow.OrderCode,
                    orderRow.Status,
                    orderRow.PaymentStatus
                });
            }

            if (string.IsNullOrWhiteSpace(transaction.PendingCheckoutJson))
            {
                return Results.Problem(
                    statusCode: 500,
                    title: "Checkout data missing",
                    detail: "Cannot create order: pending checkout payload was not stored.");
            }

            var snapshot = JsonSerializer.Deserialize<PendingRazorpayCheckoutSnapshot>(
                transaction.PendingCheckoutJson,
                WebJson);
            if (snapshot is null)
            {
                return Results.Problem(statusCode: 500, detail: "Invalid pending checkout payload.");
            }

            var materialized = await TryMaterializePaidOrderFromSnapshotAsync(
                db,
                transaction,
                snapshot,
                httpContext,
                cancellationToken);
            if (materialized.Error is not null)
            {
                transaction.ProviderPaymentId = request.RazorpayPaymentId;
                transaction.FailureReason = "Razorpay payment verified but order could not be created.";
                transaction.UpdatedAtUtc = DateTime.UtcNow;
                await db.SaveChangesAsync(cancellationToken);
                return materialized.Error;
            }

            var paidOrder = materialized.Order!;
            transaction.OrderId = paidOrder.Id;
            transaction.ProviderPaymentId = request.RazorpayPaymentId;
            transaction.Status = PaymentStatuses.Paid;
            transaction.PendingCheckoutJson = null;
            transaction.RawPayloadJson = JsonSerializer.Serialize(request);
            transaction.UpdatedAtUtc = DateTime.UtcNow;

            await db.SaveChangesAsync(cancellationToken);
            await QueueOrderPlacedNotificationsAsync(notificationQueue, paidOrder.Id, cancellationToken);

            return Results.Ok(new
            {
                orderCode = paidOrder.OrderCode,
                paidOrder.Status,
                paidOrder.PaymentStatus
            });
        });

        group.MapGet("/guest-orders", async (
            string? guestId,
            AppDbContext db,
            IConfiguration configuration) =>
        {
            if (string.IsNullOrWhiteSpace(guestId) || !Guid.TryParse(guestId.Trim(), out _))
            {
                return Results.BadRequest(new { message = "guestId must be a valid UUID." });
            }

            var normalized = guestId.Trim();
            var orders = await db.Orders
                .AsNoTracking()
                .Include(o => o.Items)
                .Where(o => o.GuestId == normalized && o.UserId == null)
                .OrderByDescending(o => o.CreatedAtUtc)
                .ToListAsync();

            return Results.Ok(orders.Select(order => MapGuestStandardOrder(order, configuration)));
        }).AllowAnonymous();

        return routes;
    }

    public static IEndpointRouteBuilder MapGuestOrderMergeEndpoint(this IEndpointRouteBuilder routes)
    {
        routes.MapPost("/api/store/orders/merge-guest", async (
            HttpContext context,
            MergeGuestOrdersRequest request,
            AppDbContext db) =>
        {
            var userId = context.User.GetUserId();
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(request.GuestId) || !Guid.TryParse(request.GuestId.Trim(), out _))
            {
                return Results.BadRequest(new { message = "guestId must be a valid UUID." });
            }

            var guestKey = request.GuestId.Trim();
            var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId.Value);
            if (user is null)
            {
                return Results.NotFound(new { message = "User not found." });
            }

            if (!user.IsActive || user.DeletedAtUtc is not null)
            {
                return Results.Json(
                    new { message = "Your account has been disabled. Contact support if you need help." },
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var normalizedUserEmail = user.Email.Trim().ToLowerInvariant();
            var candidates = await db.Orders
                .Where(o => o.GuestId == guestKey && o.UserId == null)
                .ToListAsync();

            if (candidates.Count == 0)
            {
                return Results.Ok(new { merged = 0, message = "No guest orders to merge." });
            }

            foreach (var order in candidates)
            {
                if (!string.Equals(order.Email.Trim().ToLowerInvariant(), normalizedUserEmail, StringComparison.Ordinal))
                {
                    return Results.BadRequest(new
                    {
                        message =
                            "One or more guest orders use a different email than this account. Use the same email or contact support."
                    });
                }
            }

            foreach (var order in candidates)
            {
                order.UserId = userId.Value;
                order.GuestId = null;
                order.UpdatedAtUtc = DateTime.UtcNow;
            }

            await db.SaveChangesAsync();
            return Results.Ok(new { merged = candidates.Count });
        }).RequireAuthorization();

        return routes;
    }

    private sealed record CheckoutCartState(
        int? UserId,
        string? GuestId,
        string CustomerName,
        string Email,
        string Phone,
        string Line1,
        string? Line2,
        string City,
        string State,
        string Country,
        string Pincode,
        string? Notes,
        List<(Product Product, int Quantity)> Lines);

    private static async Task QueueOrderPlacedNotificationsAsync(
        INotificationQueue notificationQueue,
        int orderId,
        CancellationToken cancellationToken = default)
    {
        await notificationQueue.EnqueueAsync(new NotificationJob(NotificationJobKind.OrderPlaced, orderId), cancellationToken);
        await notificationQueue.EnqueueAsync(new NotificationJob(NotificationJobKind.AdminNewOrderAlert, orderId), cancellationToken);
    }

    private static async Task<(CheckoutCartState? State, IResult? Error)> TryValidateCheckoutAsync(
        HttpContext context,
        CreateOrderRequest request,
        AppDbContext db)
    {
        if (request.Items.Count == 0)
        {
            return (null, Results.BadRequest(new { message = "At least one cart item is required." }));
        }

        if (string.IsNullOrWhiteSpace(request.CustomerName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Phone) ||
            string.IsNullOrWhiteSpace(request.Line1) ||
            string.IsNullOrWhiteSpace(request.City) ||
            string.IsNullOrWhiteSpace(request.State) ||
            string.IsNullOrWhiteSpace(request.Pincode))
        {
            return (null, Results.BadRequest(new { message = "Shipping details are incomplete." }));
        }

        var productIds = request.Items.Select(item => item.ProductId).Distinct().ToList();
        var products = await db.Products
            .Where(product => product.IsPublished && productIds.Contains(product.Id))
            .ToListAsync();

        if (products.Count != productIds.Count)
        {
            return (null, Results.BadRequest(new { message = "One or more cart items are invalid." }));
        }

        var lines = new List<(Product Product, int Quantity)>();
        foreach (var item in request.Items)
        {
            var product = products.First(p => p.Id == item.ProductId);
            if (product.StockQuantity < item.Quantity)
            {
                return (null, Results.BadRequest(new { message = $"{product.Name} does not have enough stock." }));
            }

            lines.Add((product, Math.Max(1, item.Quantity)));
        }

        var userId = context.User.GetUserId();
        var checkoutGuard = await UserLifecycleGuard.RejectIfCustomerDisabledAsync(db, userId);
        if (checkoutGuard is not null)
        {
            return (null, checkoutGuard);
        }

        string? guestId = null;
        if (userId is null)
        {
            if (string.IsNullOrWhiteSpace(request.GuestId) || !Guid.TryParse(request.GuestId.Trim(), out _))
            {
                return (null, Results.BadRequest(new { message = "guestId (UUID) is required for guest checkout." }));
            }

            guestId = request.GuestId.Trim();
        }

        var state = new CheckoutCartState(
            userId,
            guestId,
            request.CustomerName.Trim(),
            request.Email.Trim().ToLowerInvariant(),
            request.Phone.Trim(),
            request.Line1.Trim(),
            request.Line2?.Trim(),
            request.City.Trim(),
            request.State.Trim(),
            string.IsNullOrWhiteSpace(request.Country) ? "India" : request.Country.Trim(),
            request.Pincode.Trim(),
            request.Notes?.Trim(),
            lines);

        return (state, null);
    }

    private static async Task<Order> PersistCodOrderAsync(
        AppDbContext db,
        CheckoutCartState state,
        HttpContext context,
        string paymentMethod)
    {
        var order = new Order
        {
            UserId = state.UserId,
            GuestId = state.UserId is null ? state.GuestId : null,
            OrderCode = $"LGL-ORD-{Random.Shared.Next(10000, 99999)}",
            CustomerName = state.CustomerName,
            Email = state.Email,
            Phone = state.Phone,
            Line1 = state.Line1,
            Line2 = state.Line2,
            City = state.City,
            State = state.State,
            Country = state.Country,
            Pincode = state.Pincode,
            PaymentMethod = paymentMethod,
            PaymentStatus = PaymentStatuses.Pending,
            Status = OrderStatuses.Pending,
            Notes = state.Notes
        };

        foreach (var (product, quantity) in state.Lines)
        {
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
        return order;
    }

    private static async Task<(Order? Order, IResult? Error)> TryMaterializePaidOrderFromSnapshotAsync(
        AppDbContext db,
        PaymentTransaction transaction,
        PendingRazorpayCheckoutSnapshot snapshot,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var subtotal = snapshot.Lines.Sum(line => line.UnitPriceInr * line.Quantity);
        var shippingFee = subtotal >= 499 ? 0 : 60;
        var expectedTotal = subtotal + shippingFee;
        if (expectedTotal != transaction.AmountInr)
        {
            return (null, Results.BadRequest(new { message = "Checkout amount does not match payment record." }));
        }

        if (snapshot.UserId is null &&
            (string.IsNullOrWhiteSpace(snapshot.GuestId) || !Guid.TryParse(snapshot.GuestId.Trim(), out _)))
        {
            return (null, Results.BadRequest(new { message = "Invalid guest checkout data." }));
        }

        var productIds = snapshot.Lines.Select(line => line.ProductId).Distinct().ToList();
        var products = await db.Products
            .Where(product => productIds.Contains(product.Id))
            .ToListAsync(cancellationToken);

        if (products.Count != productIds.Count)
        {
            return (null, Results.BadRequest(new { message = "One or more products are no longer available." }));
        }

        foreach (var line in snapshot.Lines)
        {
            var product = products.First(p => p.Id == line.ProductId);
            if (!product.IsPublished)
            {
                return (null, Results.BadRequest(new { message = $"{product.Name} is no longer available." }));
            }

            if (product.StockQuantity < line.Quantity)
            {
                return (null, Results.Conflict(new
                {
                    message =
                        $"{product.Name} does not have enough stock. If money was debited, contact support with Razorpay order id {transaction.ProviderOrderId}."
                }));
            }
        }

        var order = new Order
        {
            UserId = snapshot.UserId,
            GuestId = snapshot.UserId is null ? snapshot.GuestId?.Trim() : null,
            OrderCode = $"LGL-ORD-{Random.Shared.Next(10000, 99999)}",
            CustomerName = snapshot.CustomerName.Trim(),
            Email = snapshot.Email.Trim().ToLowerInvariant(),
            Phone = snapshot.Phone.Trim(),
            Line1 = snapshot.Line1.Trim(),
            Line2 = snapshot.Line2?.Trim(),
            City = snapshot.City.Trim(),
            State = snapshot.State.Trim(),
            Country = string.IsNullOrWhiteSpace(snapshot.Country) ? "India" : snapshot.Country.Trim(),
            Pincode = snapshot.Pincode.Trim(),
            PaymentMethod = "Razorpay",
            PaymentStatus = PaymentStatuses.Paid,
            Status = OrderStatuses.Printing,
            Notes = snapshot.Notes?.Trim()
        };

        foreach (var line in snapshot.Lines)
        {
            var product = products.First(p => p.Id == line.ProductId);
            var quantity = Math.Max(1, line.Quantity);

            product.StockQuantity -= quantity;
            product.UpdatedAtUtc = DateTime.UtcNow;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ProductSlug = product.Slug,
                Quantity = quantity,
                UnitPriceInr = line.UnitPriceInr,
                TotalPriceInr = line.UnitPriceInr * quantity
            });

            db.InventoryAdjustments.Add(new InventoryAdjustment
            {
                ProductId = product.Id,
                UpdatedByUserId = context.User.GetUserId(),
                QuantityChange = -quantity,
                Reason = "Razorpay order paid",
                Notes = order.OrderCode
            });
        }

        order.SubtotalInr = order.Items.Sum(item => item.TotalPriceInr);
        order.ShippingFeeInr = order.SubtotalInr >= 499 ? 0 : 60;
        order.TotalPriceInr = order.SubtotalInr + order.ShippingFeeInr;

        if (order.TotalPriceInr != transaction.AmountInr)
        {
            return (null, Results.BadRequest(new { message = "Order total does not match payment amount." }));
        }

        db.Orders.Add(order);
        await db.SaveChangesAsync(cancellationToken);
        return (order, null);
    }

    private static object MapGuestStandardOrder(Order order, IConfiguration configuration) => new
    {
        order.Id,
        orderType = "standard",
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
        order.CreatedAtUtc,
        order.TrackingNumber,
        order.RefundStatus,
        order.CancellationReason,
        order.CancelledAtUtc,
        order.ShippedAtUtc,
        order.DeliveredAtUtc,
        cancellationEligible = IsGuestListCancellationAllowed(order.Status, configuration),
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

    private static bool IsGuestListCancellationAllowed(string status, IConfiguration configuration)
    {
        if (status == OrderStatuses.Cancelled || status == OrderStatuses.Delivered)
        {
            return false;
        }

        var allowAfterShipment = configuration.GetValue("Orders:AllowCancellationAfterShipment", false);
        return allowAfterShipment || status is not OrderStatuses.Shipped;
    }

    public sealed record MergeGuestOrdersRequest(string GuestId);

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
        string? GuestId,
        List<CreateOrderItemRequest> Items);

    public sealed record CreateOrderItemRequest(int ProductId, int Quantity);
    public sealed record CancelTrackedOrderRequest(string Phone, string? Reason);

    public sealed record PendingRazorpayLineSnapshot(int ProductId, int Quantity, decimal UnitPriceInr);

    public sealed record PendingRazorpayCheckoutSnapshot(
        int? UserId,
        string? GuestId,
        string CustomerName,
        string Email,
        string Phone,
        string Line1,
        string? Line2,
        string City,
        string State,
        string Country,
        string Pincode,
        string? Notes,
        List<PendingRazorpayLineSnapshot> Lines);

    public sealed record VerifyRazorpayPaymentRequest(
        string? OrderCode,
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

    private static bool IsCancellationAllowed(string status, IConfiguration configuration)
    {
        if (status == OrderStatuses.Cancelled || status == OrderStatuses.Delivered)
        {
            return false;
        }

        var allowAfterShipment = configuration.GetValue("Orders:AllowCancellationAfterShipment", false);
        return allowAfterShipment || status is not OrderStatuses.Shipped;
    }

    private static async Task<IResult?> CancelOrderAsync(
        Order order,
        string? reason,
        AppDbContext db,
        IConfiguration configuration)
    {
        if (!IsCancellationAllowed(order.Status, configuration))
        {
            return Results.BadRequest(new { message = "This order is no longer eligible for cancellation." });
        }

        if (order.Status == OrderStatuses.Cancelled)
        {
            return Results.BadRequest(new { message = "This order is already cancelled." });
        }

        foreach (var item in order.Items)
        {
            var product = await db.Products.FirstOrDefaultAsync(product => product.Id == item.ProductId);
            if (product is not null)
            {
                product.StockQuantity += item.Quantity;
                product.UpdatedAtUtc = DateTime.UtcNow;
            }
        }

        order.Status = OrderStatuses.Cancelled;
        order.RefundStatus = order.PaymentStatus == PaymentStatuses.Paid
            ? RefundStatuses.Pending
            : RefundStatuses.Approved;
        order.CancellationReason = string.IsNullOrWhiteSpace(reason) ? "Customer requested cancellation." : reason.Trim();
        order.CancelledAtUtc = DateTime.UtcNow;
        order.UpdatedAtUtc = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return null;
    }

    private static object MapOrderCancellation(Order order, IConfiguration configuration) => new
    {
        order.Id,
        order.OrderCode,
        order.Status,
        order.RefundStatus,
        order.CancellationReason,
        order.CancelledAtUtc,
        cancellationEligible = IsCancellationAllowed(order.Status, configuration)
    };

    private static object MapCustomOrderTracking(CustomOrderRequest order) => new
    {
        orderType = "custom",
        id = order.Id,
        orderCode = order.ReferenceCode,
        customerName = order.Name,
        email = order.Email,
        phone = order.WhatsAppNumber,
        order.Status,
        paymentStatus = order.QuoteAmountInr is null ? "Quote Pending" : "Quote Shared",
        paymentMethod = "Custom Order",
        subtotalInr = order.QuoteAmountInr,
        shippingFeeInr = (decimal?)null,
        totalPriceInr = order.QuoteAmountInr ?? 0,
        notes = order.AdminNotes,
        order.TrackingNumber,
        order.RefundStatus,
        order.CancellationReason,
        order.CancelledAtUtc,
        order.ShippedAtUtc,
        order.DeliveredAtUtc,
        cancellationEligible = false,
        order.Occasion,
        order.Size,
        order.ColorPreference,
        order.CharacterDescription,
        order.PhotoUrl,
        order.BaseMessage,
        order.CreatedAtUtc,
        items = new[]
        {
            new
            {
                productName = string.IsNullOrWhiteSpace(order.CharacterDescription)
                    ? "Custom 3D printed toy request"
                    : order.CharacterDescription,
                quantity = 1,
                totalPriceInr = order.QuoteAmountInr ?? 0
            }
        }
    };
}
