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

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:5252";
  }

  throw new Error(
    "Missing NEXT_PUBLIC_API_BASE_URL (or API_BASE_URL). Server Components cannot reach the backend on Vercel without it.",
  );
}

async function fetchStoreJson<T>(path: string): Promise<T> {
  const base = resolveApiBaseUrl();
  const response = await fetch(`${base}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Store API error ${response.status}: ${path}`);
  }

  return (await response.json()) as T;
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
  const response = await fetch(`${base}/api/store/products/${slug}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Request failed: /api/store/products/${slug}`);
  }

  return (await response.json()) as ProductDetail;
}

export async function getProductReviews(slug: string): Promise<ProductReviewSummary | null> {
  const base = resolveApiBaseUrl();
  const response = await fetch(`${base}/api/store/products/${slug}/reviews`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Request failed: /api/store/products/${slug}/reviews`);
  }

  return (await response.json()) as ProductReviewSummary;
}
