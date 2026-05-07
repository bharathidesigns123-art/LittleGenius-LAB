import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { BuyNowButton } from "@/components/store/buy-now-button";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductReviewsSection } from "@/components/store/product-reviews-section";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getProductDetail, getProductReviews } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/asset-url";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProductDetail(slug);

  if (!detail) {
    return {
      title: "Product not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { product } = detail;
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.shortDescription,
      url: `https://littlegeniuslab.in/products/${product.slug}`,
      images: [
        {
          url: resolveAssetUrl(product.heroImageUrl),
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription,
      images: [resolveAssetUrl(product.heroImageUrl)],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [detail, reviewSummary] = await Promise.all([getProductDetail(slug), getProductReviews(slug)]);

  if (!detail) {
    return (
      <StorefrontShell>
        <div className="page-shell py-16">
          <EmptyState
            title="This toy wandered off"
            description="The requested product could not be found. Browse the collection and discover something just as delightful."
            action={
              <Link href="/shop" className="site-button site-button-primary">
                Browse all products
              </Link>
            }
          />
        </div>
      </StorefrontShell>
    );
  }

  const { product, relatedProducts, images } = detail;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: [resolveAssetUrl(product.heroImageUrl)],
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "LittleGenius LAB",
    },
    category: product.categoryName,
    offers: {
      "@type": "Offer",
      url: `https://littlegeniuslab.in/products/${product.slug}`,
      priceCurrency: "INR",
      price: String(product.priceInr),
      availability:
        product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      (product.reviewCount ?? 0) > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.averageRating ?? 0,
            reviewCount: product.reviewCount ?? 0,
          }
        : undefined,
  };
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
        name: product.categoryName,
        item: `https://littlegeniuslab.in/shop/${product.categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `https://littlegeniuslab.in/products/${product.slug}`,
      },
    ],
  };

  return (
    <StorefrontShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="page-shell py-10">
        <div className="grid gap-10 md:grid-cols-[1fr_0.9fr]">
          <ProductGallery images={images} productName={product.name} />

          <div className="space-y-5">
            <span className="status-pill status-pill-yellow">{product.badge}</span>
            <div>
              <h1 className="display-font text-5xl font-semibold leading-tight text-primary">
                {product.name}
              </h1>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                {(product.reviewCount ?? 0) > 0
                  ? `${product.averageRating?.toFixed(1) ?? "0.0"}/5 rating from ${product.reviewCount} review${product.reviewCount === 1 ? "" : "s"}`
                  : "No ratings yet"}
              </p>
              <p className="mt-4 text-base leading-8 text-ink-soft">
                {product.shortDescription}
              </p>
            </div>
            <div className="surface-card card-shadow rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl font-bold text-primary">
                  Rs. {product.priceInr}
                </span>
                <span className="status-pill status-pill-blue">{product.shipsIn}</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] bg-[var(--color-surface)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                    Material
                  </p>
                  <p className="mt-2 font-semibold text-[var(--color-blue)]">{product.material}</p>
                </div>
                <div className="rounded-[1.4rem] bg-[var(--color-surface)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                    Size
                  </p>
                  <p className="mt-2 font-semibold text-[var(--color-blue)]">{product.sizeMm}mm</p>
                </div>
                <div className="rounded-[1.4rem] bg-[var(--color-surface)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                    Colourway
                  </p>
                  <p className="mt-2 font-semibold text-[var(--color-blue)]">{product.colourway}</p>
                </div>
                <div className="rounded-[1.4rem] bg-[var(--color-surface)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                    Stock
                  </p>
                  <p className="mt-2 font-semibold text-[var(--color-blue)]">
                    {product.stockQuantity} available
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <AddToCartButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    heroImageUrl: product.heroImageUrl,
                    priceInr: product.priceInr,
                  }}
                  className="site-button site-button-primary"
                />
                <BuyNowButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    heroImageUrl: product.heroImageUrl,
                    priceInr: product.priceInr,
                  }}
                  className="site-button site-button-secondary"
                />
              </div>
            </div>
            <div className="surface-card rounded-[2rem] p-6">
              <h2 className="text-2xl font-semibold text-primary">The Details</h2>
              <p className="mt-4 text-sm leading-8 text-[var(--color-ink-soft)]">
                {product.fullDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      <ProductReviewsSection
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
        initialSummary={reviewSummary}
      />

      <section className="page-shell py-10">
        <h2 className="display-font text-4xl font-semibold text-[var(--color-blue)]">
          You might also like
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-4">
          {relatedProducts.map((item) => (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              className="bg-card rounded-2xl p-4 shadow-card-lg"
            >
              <Image
                src={resolveAssetUrl(item.heroImageUrl)}
                alt={item.name}
                width={900}
                height={900}
                className="h-52 w-full rounded-xl object-cover"
              />
              <h3 className="mt-4 text-lg font-semibold text-[var(--color-blue)]">{item.name}</h3>
              <p className="mt-2 text-sm font-semibold text-[var(--color-ink-soft)]">Rs. {item.priceInr}</p>
            </Link>
          ))}
        </div>
      </section>
    </StorefrontShell>
  );
}
