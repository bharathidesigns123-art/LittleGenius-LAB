import type {
  Category,
  HomeData,
  ProductDetail,
  ProductReviewSummary,
  ProductSummary,
} from "@/lib/types";

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
    // Return an empty object/array as a last resort to allow the build to proceed
    // if this is called during a prerender and we don't have a backend.
    if (path.includes("/home")) {
      return {
        hero: { eyebrow: "", title: "", subtitle: "", primaryCta: "", secondaryCta: "" },
        trustBar: [],
        categories: [],
        featuredProducts: [],
        reviews: [],
      } as unknown as T;
    }
    if (path.includes("/categories") || path.includes("/products")) {
      return [] as unknown as T;
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
    // Return null during build if fetch fails
    return null;
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
    return null;
  }
}
