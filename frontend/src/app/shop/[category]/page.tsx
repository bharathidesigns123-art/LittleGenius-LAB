import { ProductCard } from "@/components/store/product-card";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategories, getProducts } from "@/lib/api";

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
        <SectionHeading
          eyebrow={currentCategory?.priceRange ?? "Collection"}
          title={currentCategory?.name ?? "Browse toys"}
          description={
            currentCategory?.description ??
            "This category currently has products connected to the store API."
          }
        />
        <div className="grid gap-5 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </StorefrontShell>
  );
}
