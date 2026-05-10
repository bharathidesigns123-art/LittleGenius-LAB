"use client";

import { useCart } from "@/components/providers/cart-provider";
import { QuantityStepper } from "@/components/store/quantity-stepper";

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
  const { items, addItem } = useCart();
  const isInCart = items.some((item) => item.productId === product.id);

  if (isInCart) {
    return <QuantityStepper productId={product.id} className={className} disabled={disabled} />;
  }

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
      }}
      className={`${className ?? "site-button site-button-primary"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      {disabled ? "Out of Stock" : (
        <>
          <span className="sm:hidden">Add to Cart</span>
          <span className="hidden sm:inline">Add to Cart - Rs. {product.priceInr}</span>
        </>
      )}
    </button>
  );
}
