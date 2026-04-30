"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";

export function AddToCartButton({
  product,
  className,
  disabled,
}: {
  product: {
    id: number;
    slug: string;
    name: string;
    heroImageUrl: string;
    priceInr: number;
  };
  className?: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageUrl: product.heroImageUrl,
          priceInr: product.priceInr,
        });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      className={`${className ?? "site-button site-button-primary"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      {disabled ? "Out of Stock" : added ? "Added to cart" : `Add to Cart - Rs. ${product.priceInr}`}
    </button>
  );
}
