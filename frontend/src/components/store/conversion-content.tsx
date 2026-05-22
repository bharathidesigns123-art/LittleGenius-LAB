import Image from "next/image";
import Link from "next/link";
import { MessageCircle, PackageCheck, RefreshCcw, ShieldCheck, Star } from "lucide-react";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  buildWhatsAppUrl,
  competitorDifferentiators,
  contentGuides,
  deliveryPromiseCards,
  homeFaqs,
  homeTrustBadges,
  instagramUrl,
  socialProofTiles,
} from "@/lib/commerce-content";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { ProductSummary, Review } from "@/lib/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[var(--color-orange)]" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={15} fill={index < rating ? "currentColor" : "none"} aria-hidden="true" />
      ))}
    </span>
  );
}

export function TrustBadgeGrid() {
  const icons = [ShieldCheck, PackageCheck, MessageCircle, RefreshCcw];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {homeTrustBadges.map((badge, index) => {
        const Icon = icons[index] ?? ShieldCheck;

        return (
          <SurfaceCard key={badge.title} className="p-5" tone="muted">
            <Icon className="text-[var(--color-orange)]" size={22} aria-hidden="true" />
            <h3 className="mt-4 text-base font-semibold leading-snug text-[var(--color-blue)]">{badge.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{badge.description}</p>
          </SurfaceCard>
        );
      })}
    </div>
  );
}

export function SocialProofSection({
  reviews,
  products,
}: {
  reviews: Review[];
  products: ProductSummary[];
}) {
  const reviewList = reviews.length > 0 ? reviews : [];
  const productImages = products.length > 0 ? products : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div>
        <p className="eyebrow">Trusted by customers</p>
        <h2 className="display-font mt-4 text-4xl font-semibold leading-tight text-[var(--color-blue)] sm:text-5xl">
          Reviews, photos, and real support before you buy
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
          Indian shoppers want proof before paying a new store. These trust signals put reviews, maker support,
          packaging, and delivery clarity in one place.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["4.8/5", "average rating"],
            ["500+", "families reached"],
            ["2-3 days", "ready dispatch"],
          ].map(([value, label]) => (
            <SurfaceCard key={label} className="p-4 text-center" tone="muted">
              <p className="text-2xl font-semibold text-[var(--color-orange)]">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">{label}</p>
            </SurfaceCard>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {reviewList.slice(0, 4).map((review) => (
            <SurfaceCard key={`${review.customerName}-${review.customerLocation}`} className="p-5">
              <Stars rating={review.rating} />
              <p className="mt-4 text-sm leading-7 text-[var(--color-ink)]">&quot;{review.quote}&quot;</p>
              <p className="mt-4 text-sm font-semibold text-[var(--color-blue)]">
                {review.customerName}, {review.customerLocation}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-secondary">
                Verified customer
              </p>
            </SurfaceCard>
          ))}
        </div>

        <SurfaceCard className="p-4" tone="elevated">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-secondary">Instagram proof</p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--color-blue)]">Fresh off the printer</h3>
            </div>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="section-link">
              Follow @littlegenius_lab
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {socialProofTiles.map((tile, index) => {
              const product = productImages[index % Math.max(1, productImages.length)];

              return (
                <a
                  key={tile.title}
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-[1.2rem] border border-[var(--color-border)] bg-white"
                >
                  <div className="relative aspect-square overflow-hidden bg-[var(--color-surface-2)]">
                    <Image
                      src={resolveAssetUrl(product?.heroImageUrl)}
                      alt={`${tile.title} customer photo`}
                      fill
                      sizes="(min-width: 768px) 14vw, 45vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold leading-snug text-[var(--color-blue)]">{tile.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)]">{tile.caption}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

export function DifferentiationSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
      <div>
        <p className="eyebrow">Why buy direct</p>
        <h2 className="display-font mt-4 text-4xl font-semibold leading-tight text-[var(--color-blue)] sm:text-5xl">
          Built to beat marketplace uncertainty
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
          The pitch is simple: clearer support, faster answers, and gift-ready execution from the people making the product.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {competitorDifferentiators.map((item) => (
          <SurfaceCard key={item.title} className="p-5" tone="muted">
            <h3 className="text-lg font-semibold leading-snug text-[var(--color-blue)]">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{item.description}</p>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}

export function DeliveryPromiseSection() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Delivery clarity</p>
          <h2 className="display-font mt-4 text-4xl font-semibold leading-tight text-[var(--color-blue)] sm:text-5xl">
            Know the timeline before you pay
          </h2>
        </div>
        <Link href="/shipping-policy" className="section-link">
          Shipping policy
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {deliveryPromiseCards.map((item) => (
          <SurfaceCard key={item.title} className="p-5" tone="muted">
            <h3 className="text-lg font-semibold text-[var(--color-blue)]">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{item.description}</p>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}

export function ContentMarketingSection() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Gift guides and care</p>
          <h2 className="display-font mt-4 text-4xl font-semibold leading-tight text-[var(--color-blue)] sm:text-5xl">
            Helpful content for high-intent shoppers
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)]">
            Guide content gives Google more context and gives gift buyers the confidence to choose faster.
          </p>
        </div>
        <Link href="/blog" className="section-link">
          Read all guides
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {contentGuides.map((guide) => (
          <SurfaceCard key={guide.slug} className="p-6" tone="elevated">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary">{guide.category}</p>
            <h3 className="mt-4 text-2xl font-semibold leading-tight text-[var(--color-blue)]">{guide.title}</h3>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">{guide.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[var(--color-blue)]">
              {guide.linksTo.slice(0, 3).map((href) => (
                <Link key={href} href={href} className="rounded-full bg-[var(--color-surface-2)] px-3 py-1.5">
                  {href === "/shop" ? "Shop" : href.replace("/", "").replace("-", " ")}
                </Link>
              ))}
            </div>
            <Link href={`/blog/${guide.slug}`} className="site-button site-button-secondary mt-6 w-full">
              Read guide
            </Link>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}

export function FaqSection({
  faqs = homeFaqs,
  title = "Questions shoppers ask before ordering",
}: {
  faqs?: Array<{ question: string; answer: string }>;
  title?: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <div>
        <p className="eyebrow">FAQ</p>
        <h2 className="display-font mt-4 text-4xl font-semibold leading-tight text-[var(--color-blue)] sm:text-5xl">
          {title}
        </h2>
        <a
          href={buildWhatsAppUrl("Hi LittleGenius LAB, I have a question before placing my order.")}
          target="_blank"
          rel="noopener noreferrer"
          className="site-button site-button-primary mt-6"
        >
          Ask on WhatsApp
        </a>
      </div>
      <div className="grid gap-3">
        {faqs.map((faq) => (
          <SurfaceCard key={faq.question} className="p-5" tone="muted">
            <h3 className="text-lg font-semibold text-[var(--color-blue)]">{faq.question}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{faq.answer}</p>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}

export function MobileStickyHomeCta() {
  return (
    <div className="fixed inset-x-3 bottom-[5.4rem] z-40 md:hidden">
      <Link
        href="/shop"
        className="site-button site-button-primary w-full shadow-[0_20px_42px_rgba(244,67,54,0.28)]"
      >
        Shop best sellers
      </Link>
    </div>
  );
}
