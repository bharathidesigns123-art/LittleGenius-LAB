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
    <div className="product-card">
      <Link href={`/products/${product.slug}`} aria-label={`View details for ${product.name}`} className="group block">
        <div className="relative">
          <Image
            src={resolveAssetUrl(product.heroImageUrl)}
            alt={product.name}
            width={600}
            height={600}
            className="h-56 w-full rounded-[1.6rem] object-cover transition duration-200 group-hover:scale-[1.02]"
          />
          {discountPercentage > 0 ? (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--color-orange)] px-3 py-1 text-xs font-bold text-white">
              {discountPercentage}% off
            </span>
          ) : null}
          <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${stockClass}`}>
            {stockLabel}
          </span>
        </div>
      </Link>
      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="status-pill status-pill-yellow">{product.badge}</span>
          <p className="text-right text-sm font-bold text-primary">
            Rs. {product.priceInr}
            {product.compareAtPriceInr && product.compareAtPriceInr > product.priceInr ? (
              <span className="ml-2 text-xs font-semibold text-ink-soft line-through">
                Rs. {product.compareAtPriceInr}
              </span>
            ) : null}
          </p>
        </div>
        <Link href={`/products/${product.slug}`} aria-label={`View details for ${product.name}`} className="mt-3 text-lg font-semibold text-primary">
          {product.name}
        </Link>
        <p className="mt-2 text-sm font-semibold text-secondary">
          {hasReviews
            ? `${product.averageRating?.toFixed(1) ?? "0.0"}/5 rating (${product.reviewCount} review${product.reviewCount === 1 ? "" : "s"})`
            : "No ratings yet"}
        </p>
        <p className="mt-3 flex-1 text-sm leading-7 text-ink-soft">
          {product.shortDescription}
        </p>
        <div className="mt-4 rounded-2xl bg-[var(--color-surface)] p-3 text-xs text-[var(--color-ink-soft)]">
          <p className="font-semibold text-[var(--color-blue)]">Delivery in {product.shipsIn || "2-4 days"}</p>
          <p className="mt-1">Made in India | Safe material | BIS compliant finish</p>
        </div>
        <div className="mt-5">
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              heroImageUrl: product.heroImageUrl,
              priceInr: product.priceInr,
            }}
            className="site-button site-button-primary w-full"
            disabled={product.stockQuantity <= 0}
          />
        </div>
        <BuyNowButton
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            heroImageUrl: product.heroImageUrl,
            priceInr: product.priceInr,
          }}
          className="site-button site-button-secondary mt-3 w-full"
          disabled={product.stockQuantity <= 0}
        />
      </div>
    </div>
  );
}
