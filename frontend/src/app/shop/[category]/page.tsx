import { StorefrontShell } from "@/components/site/storefront-shell";
import { ProductCard } from "@/components/store/product-card";
import { getCategories, getProducts } from "@/lib/api";
import { productCountLabel } from "@/lib/product-count-label";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts(category)]);
  const currentCategory = categories.find((item) => item.slug === category);

  return (
    <StorefrontShell>
      <section className="page-shell py-10">
        <div className="mb-8 rounded-[2rem] bg-[var(--color-surface-2)] px-5 py-4 text-sm font-semibold text-[var(--color-blue)]">
          {currentCategory?.name ?? "Selected type"} selected{" - "}
          {productCountLabel(products.length)} available
        </div>
        {products.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[var(--color-border)] bg-white/80 p-10 text-center">
            <h3 className="text-2xl font-semibold text-[var(--color-blue)]">No toys found</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-ink-soft)]">
              Switch to all product types or check back after new toys are added.
            </p>
          </div>
        )}
      </section>
    </StorefrontShell>
  );
}
