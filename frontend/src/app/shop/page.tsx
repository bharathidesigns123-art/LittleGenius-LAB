import { ProductCard } from "@/components/store/product-card";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { getProducts } from "@/lib/api";

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <StorefrontShell>
      <section className="page-shell py-10">
        <SectionHeading
          eyebrow="Shop All"
          title="Something for every little explorer"
          description="This listing page is connected to the catalogue API and ready for scale as the admin adds more categories and products."
        />
        <div className="mb-8 rounded-[2rem] bg-[var(--color-surface-2)] px-5 py-4 text-sm font-semibold text-[var(--color-blue)]">
          {products.length} products available
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </StorefrontShell>
  );
}
