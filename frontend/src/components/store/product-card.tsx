"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { ProductSummary } from "@/lib/types";

export function ProductCard({ product }: { product: ProductSummary }) {
  const hasReviews = (product.reviewCount ?? 0) > 0;

  return (
    <div className="surface-card card-shadow flex h-full flex-col rounded-[2rem] p-4">
      <Link href={`/products/${product.slug}`} className="group block">
        <Image
          src={resolveAssetUrl(product.heroImageUrl)}
          alt={product.name}
          width={900}
          height={900}
          className="h-64 w-full rounded-[1.6rem] object-cover transition duration-200 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="status-pill status-pill-yellow">{product.badge}</span>
          <span className="text-sm font-bold text-[var(--color-blue)]">Rs. {product.priceInr}</span>
        </div>
        <Link href={`/products/${product.slug}`} className="mt-3 text-lg font-semibold text-[var(--color-blue)]">
          {product.name}
        </Link>
        <p className="mt-2 text-sm font-semibold text-[var(--color-orange)]">
          {hasReviews
            ? `${product.averageRating?.toFixed(1) ?? "0.0"}/5 rating (${product.reviewCount} review${product.reviewCount === 1 ? "" : "s"})`
            : "No ratings yet"}
        </p>
        <p className="mt-3 flex-1 text-sm leading-7 text-[var(--color-ink-soft)]">
          {product.shortDescription}
        </p>
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
          />
        </div>
      </div>
    </div>
  );
}
