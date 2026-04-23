"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { resolveAssetUrl } from "@/lib/asset-url";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <StorefrontShell>
      <div className="page-shell py-10">
        {items.length === 0 ? (
          <EmptyState
            title="Your cart is feeling a little lonely"
            description="No toys yet. Explore the animal friends, robot crew, chibi squad, or design something custom."
            action={
              <Link href="/shop" className="site-button site-button-primary">
                Shop the collection
              </Link>
            }
          />
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="surface-card rounded-[2rem] p-4">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <Image
                      src={resolveAssetUrl(item.imageUrl)}
                      alt={item.name}
                      width={300}
                      height={300}
                      className="h-32 w-full rounded-[1.4rem] object-cover md:w-32"
                    />
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-[var(--color-blue)]">{item.name}</h2>
                      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Rs. {item.priceInr}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="rounded-full border border-[var(--color-border)] px-3 py-1"
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="rounded-full border border-[var(--color-border)] px-3 py-1"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-sm font-semibold text-[var(--color-orange)]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[var(--color-ink-soft)]">Line total</p>
                      <p className="text-lg font-bold text-[var(--color-blue)]">
                        Rs. {item.priceInr * item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="surface-card card-shadow rounded-[2rem] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                Order Summary
              </p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{subtotal >= 499 ? "Free" : "Rs. 60"}</span>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                <span className="font-semibold text-[var(--color-blue)]">Total</span>
                <span className="text-2xl font-bold text-[var(--color-blue)]">
                  Rs. {subtotal >= 499 ? subtotal : subtotal + 60}
                </span>
              </div>
              <Link href="/checkout" className="site-button site-button-primary mt-6 w-full">
                Proceed to checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
