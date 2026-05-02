using LittleGeniusLab.Api.Data;
using LittleGeniusLab.Api.Helpers;
using LittleGeniusLab.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LittleGeniusLab.Api.Endpoints;

public static class ReviewEndpoints
{
    public static IEndpointRouteBuilder MapReviewEndpoints(this IEndpointRouteBuilder routes)
    {
        var storeGroup = routes.MapGroup("/api/store");
        var accountGroup = routes.MapGroup("/api/account/reviews").RequireAuthorization();

        storeGroup.MapGet("/products/{slug}/reviews", async (string slug, AppDbContext db) =>
        {
            var product = await db.Products
                .AsNoTracking()
                .Where(item => item.Slug == slug && item.IsPublished)
                .Select(item => new { item.Id, item.Name })
                .FirstOrDefaultAsync();

            if (product is null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            var response = await BuildProductReviewSummaryAsync(db, product.Id);
            return Results.Ok(response);
        });

        accountGroup.MapGet("/eligibility/{productId:int}", async (
            int productId,
            HttpContext context,
            AppDbContext db) =>
        {
            var userId = context.User.GetUserId();
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var blocked = await UserLifecycleGuard.RejectIfCustomerDisabledAsync(db, userId);
            if (blocked is not null)
            {
                return blocked;
            }

            var productExists = await db.Products
                .AsNoTracking()
                .AnyAsync(product => product.Id == productId && product.IsPublished);

            if (!productExists)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            var orders = await db.Orders
                .AsNoTracking()
                .Where(order =>
                    order.UserId == userId.Value &&
                    order.Status == OrderStatuses.Delivered &&
                    order.Items.Any(item => item.ProductId == productId))
                .OrderByDescending(order => order.UpdatedAtUtc)
                .Select(order => new
                {
                    order.Id,
                    order.OrderCode,
                    deliveredAtUtc = order.UpdatedAtUtc
                })
                .ToListAsync();

            var orderIds = orders.Select(order => order.Id).ToList();
            var existingReviews = orderIds.Count == 0
                ? []
                : await db.Reviews
                    .AsNoTracking()
                    .Where(review =>
                        review.ProductId == productId &&
                        review.UserId == userId.Value &&
                        review.OrderId != null &&
                        orderIds.Contains(review.OrderId.Value))
                    .Select(review => new
                    {
                        review.Id,
                        review.OrderId,
                        review.Rating,
                        comment = review.Quote
                    })
                    .ToListAsync();

            var eligibleOrders = orders.Select(order =>
            {
                var existingReview = existingReviews.FirstOrDefault(review => review.OrderId == order.Id);

                return new
                {
                    orderId = order.Id,
                    order.OrderCode,
                    order.deliveredAtUtc,
                    existingReview = existingReview is null
                        ? null
                        : new
                        {
                            existingReview.Id,
                            existingReview.Rating,
                            existingReview.comment
                        }
                };
            });

            return Results.Ok(new
            {
                canReview = orders.Count > 0,
                reason = orders.Count > 0
                    ? null
                    : "You can submit a review after a delivered order for this product is linked to your account.",
                eligibleOrders
            });
        });

        accountGroup.MapPost("/", async (
            HttpContext context,
            SubmitProductReviewRequest request,
            AppDbContext db) =>
        {
            var userId = context.User.GetUserId();
            if (userId is null)
            {
                return Results.Unauthorized();
            }

            var blocked = await UserLifecycleGuard.RejectIfCustomerDisabledAsync(db, userId);
            if (blocked is not null)
            {
                return blocked;
            }

            if (request.Rating is < 1 or > 5)
            {
                return Results.BadRequest(new { message = "Rating must be between 1 and 5 stars." });
            }

            var product = await db.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == request.ProductId && item.IsPublished);

            if (product is null)
            {
                return Results.NotFound(new { message = "Product not found." });
            }

            var order = await db.Orders
                .Include(item => item.Items)
                .FirstOrDefaultAsync(item =>
                    item.Id == request.OrderId &&
                    item.UserId == userId.Value &&
                    item.Status == OrderStatuses.Delivered);

            if (order is null)
            {
                return Results.BadRequest(new
                {
                    message = "Only delivered orders linked to your account can be reviewed."
                });
            }

            var matchingItem = order.Items.FirstOrDefault(item => item.ProductId == request.ProductId);
            if (matchingItem is null)
            {
                return Results.BadRequest(new
                {
                    message = "This order does not include the selected product."
                });
            }

            var feedback = request.Feedback?.Trim() ?? string.Empty;
            if (feedback.Length > 800)
            {
                return Results.BadRequest(new
                {
                    message = "Review feedback must be 800 characters or fewer."
                });
            }

            var existingReview = await db.Reviews.FirstOrDefaultAsync(review =>
                review.ProductId == request.ProductId &&
                review.OrderId == request.OrderId &&
                review.UserId == userId.Value);

            var created = existingReview is null;
            var review = existingReview ?? new ProductReview
            {
                ProductId = request.ProductId,
                OrderId = request.OrderId,
                UserId = userId.Value,
                CreatedAtUtc = DateTime.UtcNow
            };

            review.CustomerName = order.CustomerName.Trim();
            review.CustomerLocation = order.City.Trim();
            review.Rating = request.Rating;
            review.Quote = feedback;
            review.IsApproved = true;
            review.IsVerifiedPurchase = true;
            review.DisplayOrder = 0;
            review.UpdatedAtUtc = DateTime.UtcNow;

            if (created)
            {
                db.Reviews.Add(review);
            }

            await db.SaveChangesAsync();

            return created
                ? Results.Created($"/api/store/products/{product.Slug}/reviews", new
                {
                    message = "Review submitted successfully.",
                    review = new
                    {
                        review.Id,
                        review.ProductId,
                        review.OrderId,
                        review.Rating,
                        comment = review.Quote,
                        review.IsVerifiedPurchase
                    }
                })
                : Results.Ok(new
                {
                    message = "Review updated successfully.",
                    review = new
                    {
                        review.Id,
                        review.ProductId,
                        review.OrderId,
                        review.Rating,
                        comment = review.Quote,
                        review.IsVerifiedPurchase
                    }
                });
        });

        return routes;
    }

    public static async Task<object> BuildProductReviewSummaryAsync(AppDbContext db, int productId)
    {
        var reviews = await db.Reviews
            .AsNoTracking()
            .Where(review => review.ProductId == productId && review.IsApproved)
            .OrderByDescending(review => review.IsVerifiedPurchase)
            .ThenByDescending(review => review.UpdatedAtUtc)
            .ThenBy(review => review.DisplayOrder)
            .Select(review => new ProductReviewDto(
                review.Id,
                review.CustomerName,
                review.CustomerLocation,
                review.Rating,
                review.Quote,
                review.IsVerifiedPurchase,
                review.CreatedAtUtc,
                review.UpdatedAtUtc))
            .ToListAsync();

        var averageRating = reviews.Count == 0
            ? 0
            : Math.Round(reviews.Average(review => review.Rating), 1, MidpointRounding.AwayFromZero);

        return new ProductReviewSummaryDto(productId, averageRating, reviews.Count, reviews);
    }

    public sealed record SubmitProductReviewRequest(int ProductId, int OrderId, int Rating, string? Feedback);

    public sealed record ProductReviewSummaryDto(
        int ProductId,
        double AverageRating,
        int ReviewCount,
        IReadOnlyList<ProductReviewDto> Reviews);

    public sealed record ProductReviewDto(
        int Id,
        string CustomerName,
        string CustomerLocation,
        int Rating,
        string Comment,
        bool IsVerifiedPurchase,
        DateTime CreatedAtUtc,
        DateTime UpdatedAtUtc);
}
