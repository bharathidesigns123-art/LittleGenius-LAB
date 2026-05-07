"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { LoadingButtonContent } from "@/components/ui/loading-indicator";

export function BuyNowButton({
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
  const { items, addItem } = useCart();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBuyNow = () => {
    if (disabled || isNavigating) return;

    const isInCart = items.some((item) => item.productId === product.id);
    
    if (!isInCart) {
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.heroImageUrl,
        priceInr: product.priceInr,
      }, 1);
    }

    setIsNavigating(true);
    router.push("/checkout");
  };

  return (
    <button
      type="button"
      disabled={disabled || isNavigating}
      onClick={handleBuyNow}
      className={`${className ?? "site-button site-button-secondary"} ${
        disabled || isNavigating ? "cursor-wait opacity-70" : ""
      }`}
    >
      <LoadingButtonContent loading={isNavigating} loadingText="Opening checkout...">
        Buy Now
      </LoadingButtonContent>
    </button>
  );
}
