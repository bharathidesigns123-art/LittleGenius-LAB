import type {
  Category,
  HomeData,
  ProductDetail,
  ProductReviewSummary,
  ProductSummary,
} from "@/lib/types";
import {
  customerReviews,
  fallbackCategories,
  fallbackHomeData,
  fallbackProducts,
  getFallbackProductDetail,
} from "@/lib/commerce-content";

/** Same resolution order as the browser client; required for Server Components on Vercel. */
function resolveApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.API_BASE_URL?.trim() ||
    "";
  if (raw) {
    return raw.replace(/\/$/, "");
  }

  // Fallback to localhost even in production to prevent build-time crashes.
  // The build will still fail during fetch if the backend is unreachable,
  // unless handled by a try-catch.
  return "http://localhost:5252";
}

async function fetchStoreJson<T>(path: string): Promise<T> {
  const base = resolveApiBaseUrl();
  try {
    const response = await fetch(`${base}${path}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Store API error ${response.status}: ${path}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Fetch failed for ${path}:`, error);
    if (path.includes("/home")) {
      return fallbackHomeData as unknown as T;
    }
    if (path.includes("/categories")) {
      return fallbackCategories as unknown as T;
    }
    if (path.includes("/products")) {
      return fallbackProducts as unknown as T;
    }
    throw error;
  }
}

export async function getHomeData(): Promise<HomeData> {
  return fetchStoreJson<HomeData>("/api/store/home");
}

export async function getCategories(): Promise<Category[]> {
  return fetchStoreJson<Category[]>("/api/store/categories");
}

export async function getProducts(category?: string): Promise<ProductSummary[]> {
  const suffix = category ? `?category=${category}` : "";
  return fetchStoreJson<ProductSummary[]>(`/api/store/products${suffix}`);
}

export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  const base = resolveApiBaseUrl();
  try {
    const response = await fetch(`${base}/api/store/products/${slug}`, {
      next: { revalidate: 300 },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Request failed: /api/store/products/${slug}`);
    }

    return (await response.json()) as ProductDetail;
  } catch (error) {
    console.error(`Fetch failed for product detail ${slug}:`, error);
    return getFallbackProductDetail(slug);
  }
}

export async function getProductReviews(slug: string): Promise<ProductReviewSummary | null> {
  const base = resolveApiBaseUrl();
  try {
    const response = await fetch(`${base}/api/store/products/${slug}/reviews`, {
      next: { revalidate: 300 },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Request failed: /api/store/products/${slug}/reviews`);
    }

    return (await response.json()) as ProductReviewSummary;
  } catch (error) {
    console.error(`Fetch failed for product reviews ${slug}:`, error);
    const fallbackProduct = fallbackProducts.find((product) => product.slug === slug);
    if (!fallbackProduct) {
      return null;
    }

    return {
      productId: fallbackProduct.id,
      averageRating: fallbackProduct.averageRating ?? 0,
      reviewCount: customerReviews.length,
      reviews: customerReviews.map((review, index) => ({
        id: index + 1,
        customerName: review.customerName,
        customerLocation: review.customerLocation,
        rating: review.rating,
        comment: review.quote,
        isVerifiedPurchase: true,
        createdAtUtc: new Date().toISOString(),
        updatedAtUtc: new Date().toISOString(),
      })),
    };
  }
}
