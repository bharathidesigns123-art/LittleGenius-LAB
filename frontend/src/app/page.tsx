import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { ProductCard } from "@/components/store/product-card";
import { PageSection } from "@/components/ui/page-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getHomeData } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/asset-url";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "3D Printed Toys, Keychains and Custom Gifts in India",
  description:
    "Buy 3D printed toys, custom keychains, anime keychains, and personalized 3D printed gifts from LittleGenius LAB with India-wide shipping.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const data = await getHomeData();
  const heroProduct = data.featuredProducts[0];
  const trendingProducts = data.featuredProducts.slice(0, 3);
  const bestSellers = data.featuredProducts.slice(0, 6);
  const topCategories = data.categories.slice(0, 4);
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LittleGenius LAB",
    url: "https://littlegeniuslab.in",
    logo: "https://littlegeniuslab.in/android-chrome-512x512.png",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "hello@littlegeniuslab.in",
        availableLanguage: ["en", "ta", "hi"],
      },
    ],
    sameAs: ["https://wa.me/919876543210"],
  };
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LittleGenius LAB",
    url: "https://littlegeniuslab.in",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://littlegeniuslab.in/shop?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <StorefrontShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
      <section className="overflow-hidden border-b border-[var(--color-border)]/80 bg-[linear-gradient(180deg,#fff4db_0%,#fff8ed_100%)]">
        <div className="page-shell py-4 sm:py-6 lg:py-7">
          <div className="hero-panel grid gap-6 px-4 py-5 sm:px-6 sm:py-7 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-8 lg:py-8">
            <div className="relative z-[1] animate-home-rise">
              <span className="status-pill status-pill-yellow w-fit">{data.hero.eyebrow}</span>
              <h1 className="display-font mt-4 max-w-2xl text-[2.35rem] font-semibold leading-[0.96] text-[var(--color-blue)] sm:text-5xl lg:text-[4.2rem]">
                Collectible 3D toys and custom gifts made to feel special
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
                Explore cheerful 3D printed toys, anime-style keychains, and personalized keepsakes made in India with collectible-quality PLA finishes.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="site-button site-button-primary">
                  Shop ready toys
                </Link>
                <Link href="/custom-order" className="site-button site-button-secondary">
                  Make a custom toy
                </Link>
              </div>

              <div className="mt-6 grid max-w-xl grid-cols-3 gap-2.5 text-center text-xs font-semibold text-[var(--color-blue)] sm:gap-3">
                <div className="trust-chip px-3 py-3">
                  <span className="block text-lg font-semibold text-brand-secondary">2-4</span>
                  day delivery
                </div>
                <div className="trust-chip px-3 py-3">
                  <span className="block text-lg font-semibold text-[var(--color-orange)]">PLA</span>
                  safe material
                </div>
                <div className="trust-chip px-3 py-3">
                  <span className="block text-lg font-semibold text-[var(--color-blue)]">3D</span>
                  custom prints
                </div>
              </div>
            </div>

            <div className="relative z-[1] grid gap-3 animate-home-rise animation-delay-150 sm:grid-cols-[1fr_0.72fr]">
              <Link
                href={heroProduct ? `/products/${heroProduct.slug}` : "/shop"}
                className="hero-image-card group relative min-h-[320px] overflow-hidden p-2 transition duration-300 hover:-translate-y-1 sm:min-h-[420px]"
              >
                <Image
                  src={resolveAssetUrl(heroProduct?.heroImageUrl ?? data.categories[0]?.imageUrl)}
                  alt={heroProduct?.name ?? "Featured LittleGenius LAB toy"}
                  fill
                  priority
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className="rounded-[2rem] object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute left-5 top-5 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-blue)] shadow-[0_12px_28px_rgba(20,49,82,0.16)]">
                  Featured
                </div>
                <div className="absolute inset-x-0 bottom-0 rounded-b-[2rem] bg-gradient-to-t from-[rgba(20,49,82,0.94)] via-[rgba(20,49,82,0.54)] to-transparent p-6 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[rgba(255,232,207,0.92)]">
                    Trending now
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight sm:text-[1.95rem]">{heroProduct?.name ?? "Featured toys"}</h2>
                  <p className="mt-2 text-sm text-white/82">From Rs. {heroProduct?.priceInr ?? 399}</p>
                </div>
              </Link>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                {trendingProducts.slice(1, 3).map((product) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="group category-card p-3"
                  >
                    <Image
                      src={resolveAssetUrl(product.heroImageUrl)}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="aspect-square w-full rounded-[1.1rem] object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                    <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-[var(--color-blue)]">
                      {product.name}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-secondary">Rs. {product.priceInr}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topCategories.map((category, index) => (
              <Link
                key={category.slug}
                href={category.slug === "custom" ? "/custom-order" : `/shop/${category.slug}`}
                className="group category-card flex-row items-center gap-3 p-3"
              >
                <Image
                  src={resolveAssetUrl(category.imageUrl)}
                  alt={category.name}
                  width={180}
                  height={180}
                  className="size-16 rounded-[1rem] object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">
                    Top {index + 1}
                  </p>
                  <h3 className="truncate text-base font-semibold text-[var(--color-blue)]">{category.name}</h3>
                  <p className="truncate text-xs text-[var(--color-ink-soft)]">{category.priceRange}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ticker hero-accent-strip border-y border-[rgba(20,49,82,0.16)] bg-[linear-gradient(90deg,#f04416_0%,#ff7a1a_42%,#143d66_100%)] py-3 text-sm font-bold tracking-[0.02em] text-white">
        <div className="ticker-track">
          {[...data.trustBar, ...data.trustBar].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </section>

      <PageSection className="section-scene scene-warm">
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
          <SurfaceCard className="overflow-hidden bg-[linear-gradient(135deg,#f04416_0%,#ff982a_46%,#ffce2f_100%)] p-6 text-[var(--color-blue)] sm:p-7" tone="elevated">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[rgba(20,49,82,0.7)]">
              Flash offer
            </p>
            <h2 className="display-font mt-3 text-3xl font-semibold leading-tight">Gift picks under Rs. 999</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-[rgba(20,49,82,0.82)]">
              Quick desk buddies, collectibles, and party gifts with secure checkout and fast shipping.
            </p>
            <Link href="/shop" className="site-button mt-6 bg-white text-brand-primary-dark shadow-[0_14px_30px_rgba(20,49,82,0.16)] hover:scale-[1.01]">
              Explore offers
            </Link>
          </SurfaceCard>

          <div className="grid gap-3 sm:grid-cols-3">
            {trendingProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group category-card p-3"
              >
                <Image
                  src={resolveAssetUrl(product.heroImageUrl)}
                  alt={product.name}
                  width={520}
                  height={520}
                  className="aspect-square w-full rounded-[1.1rem] object-cover transition duration-300 group-hover:scale-[1.03]"
                />
                <p className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-[var(--color-blue)]">
                  {product.name}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-brand-secondary">Rs. {product.priceInr}</span>
                  <span className="rounded-full bg-brand-sunshine/45 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-blue)]">
                    Hot
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection className="section-scene scene-clean">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Find the right toy faster"
          description="Jump straight into animals, robots, chibi figures, and custom toys."
          action={
            <Link href="/shop" className="section-link">
              View all
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.categories.map((category) => (
            <Link
              key={category.slug}
              href={category.slug === "custom" ? "/custom-order" : `/shop/${category.slug}`}
              className="group category-card"
            >
              <Image
                src={resolveAssetUrl(category.imageUrl)}
                alt={category.name}
                width={900}
                height={900}
                className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">
                  {category.priceRange}
                </p>
                <h3 className="mt-3 text-xl font-semibold leading-tight text-[var(--color-blue)]">{category.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </PageSection>

      <PageSection className="section-scene scene-pop">
        <SectionHeading
          eyebrow="Best Sellers"
          title="Ready-to-ship favorites"
          description="Image-first product cards, clear prices, and fast add-to-cart actions for quick buying decisions."
          action={
            <Link href="/shop" className="section-link">
              See all products
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bestSellers.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </PageSection>

      <PageSection className="section-scene scene-cool">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <SurfaceCard className="bg-[linear-gradient(135deg,#1f3550_0%,#31728d_42%,#78cab7_100%)] p-6 text-white sm:p-8" tone="elevated">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-sunshine">
              Custom toy journey
            </p>
            <h2 className="display-font mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              Upload a photo, approve on WhatsApp, receive a toy
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
              Built for gifting: photo upload, character notes, size/color selection, quote follow-up, and secure payment.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/custom-order" className="site-button bg-brand-sunshine text-[var(--color-blue)]">
                Start custom order
              </Link>
              <a href="https://wa.me/919876543210" className="site-button border border-white/25 bg-white/10 text-white">
                Chat on WhatsApp
              </a>
            </div>
          </SurfaceCard>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["01", "Upload"],
              ["02", "Preview"],
              ["03", "Approve"],
              ["04", "Deliver"],
            ].map(([step, title]) => (
              <SurfaceCard key={step} className="bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(235,249,244,0.94))] p-5" tone="muted">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">Step {step}</p>
                <h3 className="mt-3 text-lg font-semibold text-[var(--color-blue)]">{title}</h3>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection className="section-scene scene-clean">
        <SectionHeading eyebrow="Social Proof" title="Loved by families" />
        <div className="grid gap-5 md:grid-cols-3">
          {data.reviews.map((review) => (
            <SurfaceCard key={review.customerName} className="p-6">
              <p className="text-sm font-bold tracking-[0.16em] text-brand-secondary">{"*".repeat(review.rating)}</p>
              <p className="mt-4 text-sm leading-8 text-[var(--color-ink)]">&quot;{review.quote}&quot;</p>
              <p className="mt-6 text-sm font-semibold text-[var(--color-blue)]">
                {review.customerName}, {review.customerLocation}
              </p>
            </SurfaceCard>
          ))}
        </div>
      </PageSection>
    </StorefrontShell>
  );
}
