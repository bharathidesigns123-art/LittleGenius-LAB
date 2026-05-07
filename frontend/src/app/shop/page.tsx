import { ProductCard } from "@/components/store/product-card";
import { ProductSearch } from "@/components/store/product-search";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { getProducts } from "@/lib/api";
import { productCountLabel } from "@/lib/product-count-label";
import { filterProductsByQuery, normalizeProductQuery } from "@/lib/product-search";

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
      <section className="page-shell py-10">
        <h1 className="display-font mb-4 text-4xl font-semibold text-[var(--color-blue)]">
          Shop 3D printed toys, keychains, and custom gifts
        </h1>
        <SectionHeading
          eyebrow="Shop All"
          title="Something for every little explorer"
          description="This listing page is connected to the catalogue API and ready for scale as the admin adds more categories and products."
        />
        <ProductSearch
          action="/shop"
          clearHref="/shop"
          query={query}
          totalCount={products.length}
          resultCount={filteredProducts.length}
        />
        <div className="mb-8 rounded-[2rem] bg-[var(--color-surface-2)] px-5 py-4 text-sm font-semibold text-[var(--color-blue)]">
          {productCountLabel(filteredProducts.length)} {query ? "matching" : "available"}
        </div>
        {filteredProducts.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[var(--color-border)] bg-white/80 p-10 text-center">
            <h3 className="text-2xl font-semibold text-[var(--color-blue)]">No toys found</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-ink-soft)]">
              Try a broader search term, clear the search, or browse all product types.
            </p>
          </div>
        )}
      </section>
    </StorefrontShell>
  );
}
