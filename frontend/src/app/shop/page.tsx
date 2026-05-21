import { ProductCard } from "@/components/store/product-card";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { PageSection } from "@/components/ui/page-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getProducts } from "@/lib/api";
import { filterProductsByQuery, normalizeProductQuery } from "@/lib/product-search";
import Link from "next/link";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Shop 3D Printed Toys, Keychains and Gifts",
  description:
    "Browse 3D printed toys, custom keychains, anime keychains, and personalized gift products from LittleGenius LAB.",
  alternates: {
    canonical: "/shop",
  },
};

type ShopPageProps = {
  searchParams?: Promise<{ q?: string | string[] }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const query = normalizeProductQuery((await searchParams)?.q);
  const products = await getProducts();
  const filteredProducts = filterProductsByQuery(products, query);

  return (
    <StorefrontShell>
      <PageSection>
        <SectionHeading
          eyebrow={query ? "Search Results" : "Shop All"}
          title={query ? `Results for "${query}"` : "Ready-to-ship toys, gifts, and collectibles"}
          description={
            query
              ? "Browse matching products with the refreshed card system and cleaner mobile browsing."
              : "Explore curated 3D printed creations with calmer cards, clearer pricing, and a more premium product-first layout."
          }
        />
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-4 md:gap-y-10 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <SurfaceCard className="flex flex-col items-center justify-center py-24 text-center" tone="elevated">
            <h2 className="display-font text-2xl font-semibold text-primary">
              No products found for "{query}"
            </h2>
            <p className="mt-3 text-ink-soft">
              Try a different search term or browse our full collection.
            </p>
            <Link
              href="/shop"
              className="site-button site-button-primary mt-8"
            >
              Clear Search
            </Link>
          </SurfaceCard>
        )}
      </PageSection>
    </StorefrontShell>
  );
}
