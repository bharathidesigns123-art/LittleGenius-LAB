"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { BuyNowButton } from "@/components/store/buy-now-button";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { ProductSummary } from "@/lib/types";

export function ProductCard({ product }: { product: ProductSummary }) {
  const hasReviews = (product.reviewCount ?? 0) > 0;
  const discountPercentage =
    product.compareAtPriceInr && product.compareAtPriceInr > product.priceInr
      ? Math.round(((product.compareAtPriceInr - product.priceInr) / product.compareAtPriceInr) * 100)
      : 0;
  const stockLabel =
    product.stockQuantity <= 0 ? "Out of stock" : product.stockQuantity <= 5 ? `Only ${product.stockQuantity} left` : "In stock";
  const stockClass =
    product.stockQuantity <= 0
      ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
      : product.stockQuantity <= 5
        ? "bg-brand-sunshine text-[var(--color-blue)] ring-1 ring-amber-300"
        : "bg-[rgba(114,191,46,0.16)] text-[var(--color-blue)] ring-1 ring-[rgba(114,191,46,0.28)]";

  return (
    <div className="product-card !p-3 sm:!p-4">
      <Link href={`/products/${product.slug}`} aria-label={`View details for ${product.name}`} className="group block">
        <div className="product-media">
          <Image
            src={resolveAssetUrl(product.heroImageUrl)}
            alt={`${product.name} 3D printed toy or keychain`}
            width={600}
            height={600}
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 50vw"
            className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03] sm:h-60"
          />
          {discountPercentage > 0 ? (
            <span className="absolute left-3 top-3 z-[1] rounded-full bg-[linear-gradient(135deg,#ef314d,#f76a2e)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_14px_24px_rgba(244,67,54,0.3)] sm:px-3 sm:text-[11px]">
              Save {discountPercentage}%
            </span>
          ) : null}
          <span className={`absolute right-3 top-3 z-[1] rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] shadow-[0_12px_24px_rgba(18,52,88,0.12)] sm:px-3 sm:text-[11px] ${stockClass}`}>
            {stockLabel}
          </span>
        </div>
      </Link>
      <div className="mt-4 flex flex-1 flex-col sm:mt-5">
        <div className="flex items-start justify-between gap-3">
          <span className="status-pill status-pill-yellow px-2 py-0.5 text-[10px] shadow-[0_10px_22px_rgba(255,201,51,0.22)] sm:text-xs">{product.badge}</span>
          <p className="rounded-full bg-[linear-gradient(135deg,#155eb5,#1772d0,#66d0ff)] px-3 py-1 text-right text-sm font-bold text-white shadow-[0_14px_28px_rgba(21,94,181,0.18)]">
            Rs. {product.priceInr}
            {product.compareAtPriceInr && product.compareAtPriceInr > product.priceInr ? (
              <span className="ml-1.5 text-[10px] font-medium text-white/70 line-through sm:ml-2 sm:text-xs">
                Rs. {product.compareAtPriceInr}
              </span>
            ) : null}
          </p>
        </div>
        <Link href={`/products/${product.slug}`} aria-label={`View details for ${product.name}`} className="mt-3 line-clamp-2 min-h-[2.8rem] text-base font-semibold leading-snug text-primary sm:min-h-[3.2rem] sm:text-[1.15rem]">
          {product.name}
        </Link>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-secondary sm:text-xs">
          {hasReviews
            ? `${product.averageRating?.toFixed(1) ?? "0.0"}/5 (${product.reviewCount})`
            : "No ratings"}
        </p>

        <div className="mt-4 rounded-[1.15rem] border border-[var(--color-border)]/80 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(255,247,222,0.94))] px-3 py-2 text-[11px] leading-5 text-[var(--color-ink-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:text-xs">
          Crafted in PLA with a collectible-first finish for gifting and display.
        </div>

        <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              heroImageUrl: product.heroImageUrl,
              priceInr: product.priceInr,
            }}
            className="site-button site-button-primary w-full !px-2 !py-2.5 !text-[11px] sm:!px-6 sm:!py-3 sm:!text-sm"
            disabled={product.stockQuantity <= 0}
          />
          <BuyNowButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              heroImageUrl: product.heroImageUrl,
              priceInr: product.priceInr,
            }}
            className="site-button site-button-secondary w-full !px-2 !py-2.5 !text-[11px] sm:!px-6 sm:!py-3 sm:!text-sm"
            disabled={product.stockQuantity <= 0}
          />
        </div>
      </div>
    </div>
  );
}
