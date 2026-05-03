"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";

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

  const handleBuyNow = () => {
    if (disabled) return;

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

    // Small delay to ensure state update is processed (though usually synchronous in React, 
    // it's safer for the navigation to happen in the next tick)
    router.push("/checkout");
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleBuyNow}
      className={className ?? "site-button site-button-secondary"}
    >
      Buy Now
    </button>
  );
}
