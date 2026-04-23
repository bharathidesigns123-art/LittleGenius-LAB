import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { getHomeData } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/asset-url";

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <StorefrontShell>
      <section className="page-shell grid gap-10 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-16">
        <div className="flex flex-col justify-center gap-6">
          <span className="status-pill status-pill-yellow w-fit">{data.hero.eyebrow}</span>
          <div>
            <h1 className="display-font max-w-2xl text-5xl font-semibold leading-tight text-[var(--color-blue)] md:text-7xl">
              {data.hero.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--color-ink-soft)]">
              {data.hero.subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="site-button site-button-primary">
              {data.hero.primaryCta}
            </Link>
            <Link href="/custom-order" className="site-button site-button-secondary">
              {data.hero.secondaryCta}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface-card rounded-[1.8rem] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                Trusted by Parents
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                Friendly product copy, safe materials, and strong WhatsApp reassurance built into every flow.
              </p>
            </div>
            <div className="surface-card rounded-[1.8rem] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                Built for Scale
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                Customer storefront, admin operations, inventory, and payments all sit on the same API foundation.
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card card-shadow overflow-hidden rounded-[2.5rem] p-5">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,#fff4cf_0%,#ffe1d2_55%,#e9f0fb_100%)] p-4">
            <Image
              src={resolveAssetUrl(
                data.featuredProducts[0]?.heroImageUrl ?? data.categories[0]?.imageUrl,
              )}
              alt="LittleGenius LAB featured toy"
              width={1200}
              height={1200}
              className="h-[420px] w-full rounded-[1.6rem] object-cover"
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {data.categories.map((category) => (
              <Link
                key={category.slug}
                href={`/shop/${category.slug}`}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--color-blue)]"
              >
                {category.name}
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

      <section className="page-shell py-14">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Pick a world and start exploring"
          description="The category grid follows your business flows closely: animals, robots, chibi figurines, and custom toys as the premium conversion path."
        />
        <div className="grid gap-5 md:grid-cols-4">
          {data.categories.map((category) => (
            <Link
              key={category.slug}
              href={category.slug === "custom" ? "/custom-order" : `/shop/${category.slug}`}
              className="surface-card card-shadow rounded-[2rem] p-5"
            >
              <Image
                src={resolveAssetUrl(category.imageUrl)}
                alt={category.name}
                width={900}
                height={900}
                className="h-44 w-full rounded-[1.6rem] object-cover"
              />
              <p className="mt-4 text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                {category.priceRange}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--color-blue)]">{category.name}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell py-10">
        <SectionHeading
          eyebrow="Fresh Off The Printer"
          title="Bestsellers ready to ship"
          description="Image-first commerce cards, trust signals, and fast add-to-cart CTAs built for mobile-first browsing."
          action={
            <Link href="/shop" className="text-sm font-bold text-[var(--color-blue)]">
              See all products
            </Link>
          }
        />
        <div className="grid gap-5 md:grid-cols-3">
          {data.featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="page-shell py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Browse and choose",
              description: "Browse categories, open a detail page, and add products to the cart without being forced to log in.",
            },
            {
              step: "02",
              title: "Print with care",
              description: "Inventory, order management, and status transitions now live in the backend so the business can track every order.",
            },
            {
              step: "03",
              title: "Deliver with confidence",
              description: "Guest order tracking and account order history both sit on the same order model for a smoother support experience.",
            },
          ].map((item) => (
            <div key={item.step} className="surface-card card-shadow rounded-[2rem] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                Step {item.step}
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[var(--color-blue)]">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-10">
        <div className="grid gap-8 rounded-[2.5rem] bg-[linear-gradient(135deg,#1a3c6e_0%,#234c85_58%,#2e65b0_100%)] p-8 text-white md:grid-cols-[0.9fr_1.1fr]">
          <Image
            src={resolveAssetUrl(data.categories[2]?.imageUrl ?? data.categories[0]?.imageUrl)}
            alt="Custom order inspiration"
            width={1200}
            height={1200}
            className="h-full min-h-72 w-full rounded-[2rem] object-cover"
          />
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-yellow)]">
              Turn Any Memory Into A Toy
            </p>
            <h2 className="display-font mt-3 text-4xl font-semibold">
              Upload a photo, get a quote, approve on WhatsApp
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/80">
              The custom order flow now supports image upload, detailed character notes, size and colour selection, and admin follow-up from a single request queue.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/custom-order" className="site-button bg-[var(--color-yellow)] text-[var(--color-blue)]">
                Start My Custom Toy
              </Link>
              <a
                href="https://wa.me/919876543210"
                className="site-button border border-white/25 bg-white/10 text-white"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-14">
        <SectionHeading eyebrow="Social Proof" title="What families are saying" />
        <div className="grid gap-5 md:grid-cols-3">
          {data.reviews.map((review) => (
            <div key={review.customerName} className="surface-card card-shadow rounded-[2rem] p-6">
              <p className="text-sm font-bold text-[var(--color-orange)]">{"★".repeat(review.rating)}</p>
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
