"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";

export function QuantityStepper({
  productId,
  className,
  disabled,
}: {
  productId: number;
  className?: string;
  disabled?: boolean;
}) {
  const { items, updateQuantity } = useCart();
  const item = items.find((i) => i.productId === productId);
  const quantity = item?.quantity ?? 0;

  if (quantity === 0) {
    return null;
  }

  // Filter out site-button specific styling that might break the flex layout of the stepper
  const cleanClassName = className?.split(' ')
    .filter(c => !c.includes('site-button') && !c.includes('primary') && !c.includes('secondary'))
    .join(' ') ?? "";

  return (
    <div 
      className={`flex items-center justify-between overflow-hidden rounded-full border-2 border-[var(--color-blue)] bg-white p-1 shadow-sm ${cleanClassName} ${disabled ? "opacity-60 grayscale" : ""}`}
      style={{ minHeight: '3.5rem' }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          updateQuantity(productId, quantity - 1);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit"
        aria-label="Decrease quantity"
      >
        {quantity === 1 ? (
          <Trash2 className="h-4 w-4" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </button>
      
      <div className="flex flex-1 flex-col items-center justify-center px-2">
        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-ink-soft)] leading-none">
          Quantity
        </span>
        <span className="text-lg font-extrabold text-[var(--color-blue)] leading-tight">
          {quantity}
        </span>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          updateQuantity(productId, quantity + 1);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
