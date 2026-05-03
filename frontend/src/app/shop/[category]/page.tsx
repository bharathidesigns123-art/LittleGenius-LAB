import { ProductCard } from "@/components/store/product-card";
import { ProductSearch } from "@/components/store/product-search";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategories, getProducts } from "@/lib/api";
import { productCountLabel } from "@/lib/product-count-label";
import { filterProductsByQuery, normalizeProductQuery } from "@/lib/product-search";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ q?: string | string[] }>;
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ category }, query] = await Promise.all([
    params,
    searchParams?.then((value) => normalizeProductQuery(value.q)) ?? "",
  ]);
  const [categories, products] = await Promise.all([getCategories(), getProducts(category)]);
  const currentCategory = categories.find((item) => item.slug === category);
  const filteredProducts = filterProductsByQuery(products, query);
  const currentPath = `/shop/${category}`;

  return (
    <StorefrontShell>
      <section className="page-shell py-10">
        <SectionHeading
          eyebrow={currentCategory?.priceRange ?? "Collection"}
          title={currentCategory?.name ?? "Browse toys"}
          description={
            currentCategory?.description ??
            "This category currently has products connected to the store API."
          }
        />
        <ProductSearch
          action={currentPath}
          clearHref={currentPath}
          query={query}
          totalCount={products.length}
          resultCount={filteredProducts.length}
        />
        <div className="mb-8 rounded-[2rem] bg-[var(--color-surface-2)] px-5 py-4 text-sm font-semibold text-[var(--color-blue)]">
          {currentCategory?.name ?? "Selected type"} selected{" · "}
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
              Try a broader search term, clear the search, or switch to all product types.
            </p>
          </div>
        )}
      </section>
    </StorefrontShell>
  );
}
