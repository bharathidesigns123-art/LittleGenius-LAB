import { ProductCard } from "@/components/store/product-card";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/site/storefront-shell";
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
      <section className="page-shell py-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="display-font text-2xl font-semibold text-primary">
              No products found for "{query}"
            </h2>
            <p className="mt-3 text-ink-soft">
              Try a different search term or browse our full collection.
            </p>
            <Link
              href="/shop"
              className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition-all hover:bg-primary/90"
            >
              Clear Search
            </Link>
          </div>
        )}
      </section>
    </StorefrontShell>
  );
}
