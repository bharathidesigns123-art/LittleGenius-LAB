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
      ? "bg-red-100 text-red-700"
      : product.stockQuantity <= 5
        ? "bg-yellow-100 text-yellow-800"
        : "bg-emerald-100 text-emerald-700";

  return (
    <div className="product-card !p-3 sm:!p-4">
      <Link href={`/products/${product.slug}`} aria-label={`View details for ${product.name}`} className="group block">
        <div className="relative">
          <Image
            src={resolveAssetUrl(product.heroImageUrl)}
            alt={`${product.name} 3D printed toy or keychain`}
            width={600}
            height={600}
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 50vw"
            className="h-40 w-full rounded-2xl object-cover transition duration-200 group-hover:scale-[1.02] sm:h-56 sm:rounded-[1.6rem]"
          />
          {discountPercentage > 0 ? (
            <span className="absolute left-2 top-2 rounded-full bg-[var(--color-orange)] px-2 py-0.5 text-[10px] font-bold text-white sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
              {discountPercentage}% off
            </span>
          ) : null}
          <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold sm:right-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs ${stockClass}`}>
            {stockLabel}
          </span>
        </div>
      </Link>
      <div className="mt-3 flex flex-1 flex-col sm:mt-5">
        <div className="flex items-center justify-between gap-2">
          <span className="status-pill status-pill-yellow px-2 py-0.5 text-[10px] sm:px-3 sm:py-1 sm:text-xs">{product.badge}</span>
          <p className="text-right text-xs font-bold text-primary sm:text-sm">
            Rs. {product.priceInr}
            {product.compareAtPriceInr && product.compareAtPriceInr > product.priceInr ? (
              <span className="ml-1 text-[10px] font-semibold text-ink-soft line-through sm:ml-2 sm:text-xs">
                Rs. {product.compareAtPriceInr}
              </span>
            ) : null}
          </p>
        </div>
        <Link href={`/products/${product.slug}`} aria-label={`View details for ${product.name}`} className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-bold text-primary sm:mt-3 sm:min-h-[3rem] sm:text-lg">
          {product.name}
        </Link>
        <p className="mt-1 text-[10px] font-semibold text-secondary sm:mt-2 sm:text-sm">
          {hasReviews
            ? `${product.averageRating?.toFixed(1) ?? "0.0"}/5 (${product.reviewCount})`
            : "No ratings"}
        </p>
        
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
