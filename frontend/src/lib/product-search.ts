import type { ProductSummary } from "@/lib/types";

export function normalizeProductQuery(value?: string | string[]): string {
  const raw = Array.isArray(value) ? value[0] : value;

  return raw?.trim() ?? "";
}

export function filterProductsByQuery(products: ProductSummary[], query: string): ProductSummary[] {
  const normalizedQuery = query.toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) => {
    const searchableText = [
      product.name,
      product.shortDescription,
      product.badge,
      product.categoryName,
      product.colourway,
      product.material,
      product.tagline,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
