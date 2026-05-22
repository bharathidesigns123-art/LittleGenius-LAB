import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MessageCircle, PackageCheck, RefreshCcw, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { BuyNowButton } from "@/components/store/buy-now-button";
import { FaqSection } from "@/components/store/conversion-content";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductReviewsSection } from "@/components/store/product-reviews-section";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getProductDetail, getProductReviews } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/asset-url";
import { buildFaqSchema, buildWhatsAppUrl, productFaqs, siteBaseUrl } from "@/lib/commerce-content";
import { formatEstimatedDispatchDate, getDeliveryTimeline, parseShipsInDays } from "@/lib/fulfillment";

export const revalidate = 300;

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
    description: `${product.shortDescription} Buy this 3D printed ${product.categoryName.toLowerCase()} product from LittleGenius LAB with WhatsApp support, gift packaging, and clear dispatch timelines.`,
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

  const { product, relatedProducts, images, reviews: productQuotes } = detail;
  const productionDays = parseShipsInDays(product.shipsIn);
  const dispatchDate = formatEstimatedDispatchDate(product.shipsIn);
  const deliveryTimeline = getDeliveryTimeline(product.shipsIn);
  const productWhatsAppUrl = buildWhatsAppUrl(
    `Hi LittleGenius LAB, I want to ask about ${product.name}. Product link: ${siteBaseUrl}/products/${product.slug}`,
  );
  const productReviewEntries = reviewSummary?.reviews ?? [];
  const visibleProofReviews =
    productReviewEntries.length > 0
      ? productReviewEntries.map((review) => ({
          customerName: review.customerName,
          customerLocation: review.customerLocation,
          rating: review.rating,
          quote: review.comment,
        }))
      : productQuotes;
  const productTrustItems = [
    {
      icon: MessageCircle,
      title: "Product-specific WhatsApp help",
      text: "The support message includes this product name and link.",
    },
    {
      icon: PackageCheck,
      title: "Premium packing check",
      text: "Each order is inspected, cushioned, and packed for gifting.",
    },
    {
      icon: RefreshCcw,
      title: "Easy replacements",
      text: "Verified damage or defects are handled through quick replacement support.",
    },
  ];
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
      url: `${siteBaseUrl}/products/${product.slug}`,
      priceCurrency: "INR",
      price: String(product.priceInr),
      availability:
        product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: productionDays,
            maxValue: productionDays + 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 2,
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    aggregateRating:
      (reviewSummary?.reviewCount ?? product.reviewCount ?? 0) > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: reviewSummary?.averageRating ?? product.averageRating ?? 0,
            reviewCount: reviewSummary?.reviewCount ?? product.reviewCount ?? 0,
          }
        : undefined,
    review: productReviewEntries.slice(0, 5).map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.customerName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
      },
      reviewBody: review.comment,
    })),
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
  const faqSchema = buildFaqSchema(productFaqs);

  return (
    <StorefrontShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PageSection>
        <div className="grid gap-10 md:grid-cols-[1fr_0.9fr]">
          <ProductGallery images={images} productName={product.name} />

          <div className="space-y-5 lg:space-y-6">
            <span className="status-pill status-pill-yellow">{product.badge}</span>
            <div>
              <h1 className="display-font text-4xl font-semibold leading-[0.96] text-primary sm:text-5xl lg:text-6xl">
                {product.name}
              </h1>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary sm:text-xs">
                {(product.reviewCount ?? 0) > 0
                  ? `${product.averageRating?.toFixed(1) ?? "0.0"}/5 rating from ${product.reviewCount} review${product.reviewCount === 1 ? "" : "s"}`
                  : "No ratings yet"}
              </p>
              <p className="mt-4 text-base leading-8 text-ink-soft">
                {product.shortDescription}
              </p>
            </div>
            <SurfaceCard className="p-6 sm:p-7" tone="elevated">
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl font-semibold text-primary sm:text-4xl">
                  Rs. {product.priceInr}
                </span>
                <span className="status-pill status-pill-blue">{product.shipsIn}</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-[var(--color-border)]/70 bg-[rgba(248,244,238,0.72)] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                    Material
                  </p>
                  <p className="mt-3 font-semibold text-[var(--color-blue)]">{product.material}</p>
                </div>
                <div className="rounded-[1.4rem] border border-[var(--color-border)]/70 bg-[rgba(248,244,238,0.72)] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                    Size
                  </p>
                  <p className="mt-3 font-semibold text-[var(--color-blue)]">{product.sizeMm}mm</p>
                </div>
                <div className="rounded-[1.4rem] border border-[var(--color-border)]/70 bg-[rgba(248,244,238,0.72)] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                    Colourway
                  </p>
                  <p className="mt-3 font-semibold text-[var(--color-blue)]">{product.colourway}</p>
                </div>
                <div className="rounded-[1.4rem] border border-[var(--color-border)]/70 bg-[rgba(248,244,238,0.72)] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                    Stock
                  </p>
                  <p className="mt-3 font-semibold text-[var(--color-blue)]">
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
                <a
                  href={productWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-button site-button-secondary"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </SurfaceCard>
            <SurfaceCard className="p-6 sm:p-7" tone="muted">
              <div className="flex items-start gap-3">
                <Truck className="mt-1 text-[var(--color-orange)]" size={22} aria-hidden="true" />
                <div>
                  <h2 className="text-2xl font-semibold text-primary">Delivery and replacement promise</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                    Estimated dispatch by <span className="font-semibold text-[var(--color-blue)]">{dispatchDate}</span>.
                    Production takes {deliveryTimeline.production}; shipping usually takes {deliveryTimeline.shipping}.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["COD availability", deliveryTimeline.cod],
                  ["Packaging", "Checked, cushioned, and packed for gifting before dispatch."],
                  ["Replacement", deliveryTimeline.returns],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-[1.2rem] border border-[var(--color-border)] bg-white/82 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary">{title}</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">{text}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
            <SurfaceCard className="p-6 sm:p-7" tone="muted">
              <h2 className="text-2xl font-semibold text-primary">The Details</h2>
              <p className="mt-4 text-sm leading-8 text-[var(--color-ink-soft)]">
                {product.fullDescription}
              </p>
            </SurfaceCard>
          </div>
        </div>
      </PageSection>

      <PageSection className="section-scene scene-clean">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow">Product trust</p>
            <h2 className="display-font mt-4 text-4xl font-semibold leading-tight text-[var(--color-blue)] sm:text-5xl">
              Clear support before this reaches your cart
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
              Ask about colors, gifting, delivery pincode, or bulk quantities on WhatsApp before ordering.
            </p>
            <div className="mt-6 grid gap-3">
              {productTrustItems.map((item) => {
                const Icon = item.icon;

                return (
                <SurfaceCard key={item.title} className="flex gap-4 p-5" tone="muted">
                  <Icon className="mt-1 shrink-0 text-[var(--color-orange)]" size={22} aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-blue)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-ink-soft)]">{item.text}</p>
                  </div>
                </SurfaceCard>
                );
              })}
            </div>
          </div>

          <SurfaceCard className="p-4" tone="elevated">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary">Customer photos</p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--color-blue)]">See the finish before buying</h3>
              </div>
              <a href={productWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="section-link">
                Ask for photos
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(images.length > 0 ? images : [{ id: 0, imageUrl: product.heroImageUrl, width: 1200, height: 1200, sortOrder: 1 }])
                .slice(0, 4)
                .map((image, index) => (
                  <div key={`${image.id}-${index}`} className="overflow-hidden rounded-[1.2rem] border border-[var(--color-border)] bg-white">
                    <Image
                      src={resolveAssetUrl(image.imageUrl)}
                      alt={`${product.name} customer photo ${index + 1}`}
                      width={image.width || 700}
                      height={image.height || 700}
                      sizes="(min-width: 1024px) 22vw, 45vw"
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {visibleProofReviews.slice(0, 2).map((review) => (
                <div key={`${review.customerName}-${review.customerLocation}`} className="rounded-[1.2rem] bg-[var(--color-surface-2)] p-4">
                  <p className="text-sm font-bold text-brand-secondary">{"\u2605".repeat(review.rating)}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-ink)]">&quot;{review.quote}&quot;</p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-blue)]">
                    {review.customerName}, {review.customerLocation}
                  </p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </PageSection>

      <ProductReviewsSection
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
        initialSummary={reviewSummary}
      />

      <PageSection className="section-scene scene-pop">
        <FaqSection
          faqs={productFaqs}
          title="Questions before buying this gift"
        />
      </PageSection>

      <PageSection>
        <h2 className="display-font text-4xl font-semibold leading-tight text-[var(--color-blue)] sm:text-5xl">
          You might also like
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-4">
          {relatedProducts.map((item) => (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              className="category-card p-4"
            >
              <Image
                src={resolveAssetUrl(item.heroImageUrl)}
                alt={`${item.name} related 3D printed toy or keychain`}
                width={900}
                height={900}
                className="h-52 w-full rounded-[1.2rem] object-cover"
              />
              <h3 className="mt-4 text-lg font-semibold leading-snug text-[var(--color-blue)]">{item.name}</h3>
              <p className="mt-2 text-sm font-semibold text-brand-secondary">Rs. {item.priceInr}</p>
            </Link>
          ))}
        </div>
      </PageSection>
    </StorefrontShell>
  );
}
