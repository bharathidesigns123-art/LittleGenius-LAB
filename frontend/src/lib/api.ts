import type {
  Category,
  HomeData,
  ProductDetail,
  ProductReviewSummary,
  ProductSummary,
} from "@/lib/types";

const API_BASE_URL =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5252";

async function fetchStoreJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
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
  const response = await fetch(`${API_BASE_URL}/api/store/products/${slug}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/store/products/${slug}/reviews`, {
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
