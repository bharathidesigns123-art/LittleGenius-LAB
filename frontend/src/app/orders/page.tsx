"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { browserApi } from "@/lib/browser-api";
import type { OrderSummary } from "@/lib/types";
import { getCurrentUserIdentifier } from "@/lib/user-identifier";

function statusClass(status: string) {
  if (status === "Delivered") return "status-pill status-pill-blue";
  if (status === "Cancelled") return "status-pill bg-red-50 text-red-700";
  if (status === "Shipped") return "status-pill bg-emerald-50 text-emerald-700";
  return "status-pill status-pill-yellow";
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const placed = searchParams.get("placed");
  const { token, user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (token && user) {
          const list = await browserApi.getAccountOrders(token);
          if (!cancelled) setOrders(list);
        } else {
          const id = getCurrentUserIdentifier(user);
          if (id.mode !== "guest" || !id.guestId) {
            if (!cancelled) setOrders([]);
            return;
          }
          const list = await browserApi.getGuestOrders(id.guestId);
          if (!cancelled) setOrders(list);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load orders.");
          setOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, token, user]);

  const displayList = token && user ? orders : orders.filter((o) => o.orderType !== "custom");

  return (
    <StorefrontShell>
      <div className="page-shell py-10 md:py-14">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">Your purchases</p>
          <h1 className="display-font mt-2 text-3xl font-semibold text-[var(--color-blue)] md:text-4xl">Orders</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-soft)]">
            {token
              ? "Signed-in orders and custom requests in one place."
              : "Guest orders are saved on this device. Sign in with the same email to move them to your account."}
          </p>
          {placed ? (
            <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Order {placed} placed successfully.
            </p>
          ) : null}
        </div>

        {loading || authLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-[1.5rem] bg-white/60" />
            ))}
          </div>
        ) : error ? (
          <div className="surface-card rounded-[1.5rem] p-6 text-sm font-semibold text-red-700">{error}</div>
        ) : displayList.length === 0 ? (
          <div className="surface-card card-shadow rounded-[2rem] p-10 text-center">
            <p className="text-lg font-semibold text-[var(--color-blue)]">No orders yet</p>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              When you buy something, it will show up here. Guest checkout works too — we keep your history on this
              browser.
            </p>
            <Link href="/shop" className="site-button site-button-primary mt-6 inline-flex">
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {displayList.map((order) => (
              <div key={`${order.orderType ?? "std"}-${order.orderCode}`} className="surface-card card-shadow rounded-[1.5rem] p-5 md:p-6">
                <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-orange)]">
                      {order.orderType === "custom" ? "Custom" : "Order"} · {order.orderCode}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                      {new Date(order.createdAtUtc).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={statusClass(order.status)}>{order.status}</span>
                    <span className="status-pill status-pill-yellow">{order.paymentStatus}</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <div className="space-y-2 text-sm text-[var(--color-ink-soft)]">
                    {order.items.map((item) => (
                      <p key={`${order.orderCode}-${item.productName}`}>
                        {item.productName} × {item.quantity}{" "}
                        <span className="font-semibold text-[var(--color-blue)]">Rs. {item.totalPriceInr}</span>
                      </p>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase text-[var(--color-ink-soft)]">Total</p>
                    <p className="text-xl font-bold text-[var(--color-blue)]">Rs. {order.totalPriceInr}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/track-order" className="text-sm font-bold text-[var(--color-blue)] underline">
                    Track an order
                  </Link>
                  {!token ? (
                    <Link href="/login" className="text-sm font-bold text-[var(--color-orange)] underline">
                      Sign in to save orders to your account
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </StorefrontShell>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <StorefrontShell>
          <div className="page-shell py-14">
            <div className="h-10 w-48 animate-pulse rounded-xl bg-white/60" />
            <div className="mt-6 h-40 animate-pulse rounded-[1.5rem] bg-white/60" />
          </div>
        </StorefrontShell>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
