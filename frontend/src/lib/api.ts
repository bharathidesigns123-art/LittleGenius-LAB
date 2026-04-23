import {
  fallbackHomeData,
  fallbackProductDetails,
  fallbackProductReviewSummaries,
  fallbackProducts,
} from "@/lib/fallback-data";
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
  try {
    return await fetchStoreJson<HomeData>("/api/store/home");
  } catch {
    return fallbackHomeData;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await fetchStoreJson<Category[]>("/api/store/categories");
  } catch {
    return fallbackHomeData.categories;
  }
}

export async function getProducts(category?: string): Promise<ProductSummary[]> {
  try {
    const suffix = category ? `?category=${category}` : "";
    return await fetchStoreJson<ProductSummary[]>(`/api/store/products${suffix}`);
  } catch {
    return category
      ? fallbackProducts.filter((product) => product.categorySlug === category)
      : fallbackProducts;
  }
}

export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  try {
    return await fetchStoreJson<ProductDetail>(`/api/store/products/${slug}`);
  } catch {
    return fallbackProductDetails[slug] ?? null;
  }
}

export async function getProductReviews(slug: string): Promise<ProductReviewSummary | null> {
  try {
    return await fetchStoreJson<ProductReviewSummary>(`/api/store/products/${slug}/reviews`);
  } catch {
    return fallbackProductReviewSummaries[slug] ?? null;
  }
}
