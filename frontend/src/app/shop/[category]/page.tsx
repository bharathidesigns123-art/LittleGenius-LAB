import type { Metadata } from "next";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { ProductCard } from "@/components/store/product-card";
import { getCategories, getProducts } from "@/lib/api";
import { productCountLabel } from "@/lib/product-count-label";

export const revalidate = 300;

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const currentCategory = categories.find((item) => item.slug === category);
  const categoryName = currentCategory?.name ?? "Category";
  const description = currentCategory
    ? `${currentCategory.description} Explore ${categoryName} 3D printed toys, keychains, and gift products from LittleGenius LAB.`
    : "Explore category-specific 3D printed toys, keychains, and custom gift products from LittleGenius LAB.";

  return {
    title: `${categoryName} 3D Printed Toys and Keychains`,
    description,
    alternates: {
      canonical: `/shop/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts(category)]);
  const currentCategory = categories.find((item) => item.slug === category);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://littlegeniuslab.in/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: "https://littlegeniuslab.in/shop",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: currentCategory?.name ?? "Category",
        item: `https://littlegeniuslab.in/shop/${category}`,
      },
    ],
  };

  return (
    <StorefrontShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="page-shell py-10">
        <h1 className="display-font mb-4 text-4xl font-semibold text-[var(--color-blue)]">
          {currentCategory?.name ?? "Category"} 3D printed toys and keychains
        </h1>
        <div className="mb-8 rounded-[2rem] bg-[var(--color-surface-2)] px-5 py-4 text-sm font-semibold text-[var(--color-blue)]">
          {currentCategory?.name ?? "Selected type"} selected{" - "}
          {productCountLabel(products.length)} available
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-5">
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
