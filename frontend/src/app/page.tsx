import Image from "next/image";
import Link from "next/link";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getHomeData } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/asset-url";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomeData();
  const heroProduct = data.featuredProducts[0];
  const trendingProducts = data.featuredProducts.slice(0, 3);
  const bestSellers = data.featuredProducts.slice(0, 6);
  const topCategories = data.categories.slice(0, 4);

  return (
    <StorefrontShell>
      <section className="overflow-hidden border-b border-[var(--color-border)] bg-[linear-gradient(180deg,#fffaf2_0%,#f4fbff_100%)]">
        <div className="page-shell grid gap-5 py-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-7">
          <div className="animate-home-rise">
            <span className="status-pill status-pill-yellow w-fit">{data.hero.eyebrow}</span>
            <h1 className="display-font mt-3 max-w-2xl text-4xl font-semibold leading-tight text-[var(--color-blue)] sm:text-5xl lg:text-6xl">
              3D-printed toys kids spot instantly
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
              Colorful ready-to-ship animals, robots, chibi figures, and custom toys made in India with safe PLA finishes.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="site-button site-button-primary">
                Shop ready toys
              </Link>
              <Link href="/custom-order" className="site-button site-button-secondary">
                Make a custom toy
              </Link>
            </div>

            <div className="mt-5 grid max-w-xl grid-cols-3 gap-2 text-center text-xs font-bold text-[var(--color-blue)]">
              <div className="rounded-2xl bg-white/90 px-3 py-3 shadow-brand-card">
                <span className="block text-lg text-brand-secondary">2-4</span>
                day delivery
              </div>
              <div className="rounded-2xl bg-white/90 px-3 py-3 shadow-brand-card">
                <span className="block text-lg text-brand-primary-dark">PLA</span>
                safe material
              </div>
              <div className="rounded-2xl bg-white/90 px-3 py-3 shadow-brand-card">
                <span className="block text-lg text-brand-accent">3D</span>
                custom prints
              </div>
            </div>
          </div>

          <div className="grid gap-3 animate-home-rise animation-delay-150 sm:grid-cols-[1fr_0.72fr]">
            <Link
              href={heroProduct ? `/products/${heroProduct.slug}` : "/shop"}
              className="group relative min-h-[310px] overflow-hidden rounded-[2rem] bg-white shadow-brand-card transition duration-300 hover:-translate-y-1 hover:shadow-brand-card-hover sm:min-h-[390px]"
            >
              <Image
                src={resolveAssetUrl(heroProduct?.heroImageUrl ?? data.categories[0]?.imageUrl)}
                alt={heroProduct?.name ?? "Featured LittleGenius LAB toy"}
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute left-4 top-4 rounded-full bg-brand-sunshine px-3 py-1 text-xs font-extrabold text-yellow-900 shadow-brand-orange">
                Featured
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-5 text-white">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-sunshine">
                  Trending now
                </p>
                <h2 className="mt-2 text-2xl font-extrabold">{heroProduct?.name ?? "Featured toys"}</h2>
                <p className="mt-1 text-sm text-white/85">From Rs. {heroProduct?.priceInr ?? 399}</p>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
              {trendingProducts.slice(1, 3).map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-[1.5rem] bg-white p-3 shadow-brand-card transition duration-300 hover:-translate-y-1 hover:shadow-brand-blue"
                >
                  <Image
                    src={resolveAssetUrl(product.heroImageUrl)}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="aspect-square w-full rounded-[1.1rem] object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <p className="mt-3 line-clamp-1 text-sm font-extrabold text-[var(--color-blue)]">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs font-bold text-brand-secondary">Rs. {product.priceInr}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="page-shell pb-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topCategories.map((category, index) => (
              <Link
                key={category.slug}
                href={category.slug === "custom" ? "/custom-order" : `/shop/${category.slug}`}
                className="group flex items-center gap-3 rounded-[1.5rem] bg-white/95 p-3 shadow-brand-card transition duration-300 hover:-translate-y-1 hover:shadow-brand-card-hover"
              >
                <Image
                  src={resolveAssetUrl(category.imageUrl)}
                  alt={category.name}
                  width={180}
                  height={180}
                  className="size-16 rounded-[1rem] object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-secondary">
                    Top {index + 1}
                  </p>
                  <h3 className="truncate text-base font-extrabold text-[var(--color-blue)]">{category.name}</h3>
                  <p className="truncate text-xs font-semibold text-[var(--color-ink-soft)]">{category.priceRange}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ticker border-y border-[var(--color-border)] bg-[var(--color-blue)] py-3 text-sm font-bold text-white">
        <div className="ticker-track">
          {[...data.trustBar, ...data.trustBar].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </section>

      <section className="page-shell py-8">
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,#06b6d4_0%,#d946ef_52%,#ff7a1a_100%)] p-5 text-white shadow-brand-card-hover sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/85">
              Flash offer
            </p>
            <h2 className="display-font mt-2 text-3xl font-semibold">Gift picks under Rs. 999</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/85">
              Quick desk buddies, collectibles, and party gifts with secure checkout and fast shipping.
            </p>
            <Link href="/shop" className="site-button mt-5 bg-white text-brand-primary-dark hover:scale-[1.02]">
              Explore offers
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {trendingProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group rounded-[1.5rem] bg-white p-3 shadow-brand-card transition duration-300 hover:-translate-y-1 hover:shadow-brand-card-hover"
              >
                <Image
                  src={resolveAssetUrl(product.heroImageUrl)}
                  alt={product.name}
                  width={520}
                  height={520}
                  className="aspect-square w-full rounded-[1.1rem] object-cover transition duration-300 group-hover:scale-[1.03]"
                />
                <p className="mt-3 line-clamp-2 min-h-10 text-sm font-extrabold text-[var(--color-blue)]">
                  {product.name}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                  <span className="font-extrabold text-brand-secondary">Rs. {product.priceInr}</span>
                  <span className="rounded-full bg-brand-sunshine/30 px-2 py-1 text-xs font-bold text-yellow-800">
                    Hot
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-8">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Find the right toy faster"
          description="Jump straight into animals, robots, chibi figures, and custom toys."
          action={
            <Link href="/shop" className="text-sm font-extrabold text-[var(--color-blue)]">
              View all
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.categories.map((category) => (
            <Link
              key={category.slug}
              href={category.slug === "custom" ? "/custom-order" : `/shop/${category.slug}`}
              className="group overflow-hidden rounded-[1.75rem] bg-white shadow-brand-card transition duration-300 hover:-translate-y-1 hover:shadow-brand-card-hover"
            >
              <Image
                src={resolveAssetUrl(category.imageUrl)}
                alt={category.name}
                width={900}
                height={900}
                className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-secondary">
                  {category.priceRange}
                </p>
                <h3 className="mt-2 text-xl font-extrabold text-[var(--color-blue)]">{category.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell py-8">
        <SectionHeading
          eyebrow="Best Sellers"
          title="Ready-to-ship favorites"
          description="Image-first product cards, clear prices, and fast add-to-cart actions for quick buying decisions."
          action={
            <Link href="/shop" className="text-sm font-extrabold text-[var(--color-blue)]">
              See all products
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bestSellers.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="page-shell py-8">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-[2rem] bg-[var(--color-blue)] p-6 text-white shadow-brand-card-hover sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-sunshine">
              Custom toy journey
            </p>
            <h2 className="display-font mt-2 text-3xl font-semibold sm:text-4xl">
              Upload a photo, approve on WhatsApp, receive a toy
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
              Built for gifting: photo upload, character notes, size/color selection, quote follow-up, and secure payment.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/custom-order" className="site-button bg-brand-sunshine text-[var(--color-blue)]">
                Start custom order
              </Link>
              <a href="https://wa.me/919876543210" className="site-button border border-white/25 bg-white/10 text-white">
                Chat on WhatsApp
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["01", "Upload"],
              ["02", "Preview"],
              ["03", "Approve"],
              ["04", "Deliver"],
            ].map(([step, title]) => (
              <div key={step} className="rounded-[1.5rem] bg-white p-5 shadow-brand-card">
                <p className="text-sm font-extrabold text-brand-secondary">Step {step}</p>
                <h3 className="mt-2 text-lg font-extrabold text-[var(--color-blue)]">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-8">
        <SectionHeading eyebrow="Social Proof" title="Loved by families" />
        <div className="grid gap-5 md:grid-cols-3">
          {data.reviews.map((review) => (
            <div key={review.customerName} className="rounded-[1.75rem] bg-white p-6 shadow-brand-card">
              <p className="text-sm font-bold text-brand-secondary">{"*".repeat(review.rating)}</p>
              <p className="mt-4 text-sm leading-8 text-[var(--color-ink)]">&quot;{review.quote}&quot;</p>
              <p className="mt-6 text-sm font-semibold text-[var(--color-blue)]">
                {review.customerName}, {review.customerLocation}
              </p>
            </div>
          ))}
        </div>
      </section>
    </StorefrontShell>
  );
}
