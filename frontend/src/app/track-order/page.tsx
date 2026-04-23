"use client";

import { useState } from "react";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { browserApi } from "@/lib/browser-api";
import type { TrackOrderResponse } from "@/lib/types";

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<TrackOrderResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const order = await browserApi.trackOrder(orderCode, phone);
      setResult(order);
    } catch (trackError) {
      setResult(null);
      setError(trackError instanceof Error ? trackError.message : "Could not find order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StorefrontShell>
      <div className="page-shell py-16">
        <div className="mx-auto max-w-2xl surface-card card-shadow rounded-[2.5rem] p-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
            Guest tracking
          </p>
          <h1 className="display-font mt-2 text-4xl font-semibold text-[var(--color-blue)]">
            Track your order
          </h1>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              value={orderCode}
              onChange={(event) => setOrderCode(event.target.value)}
              className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              placeholder="LGL-ORD-10001"
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              placeholder="Phone number"
            />
            <button className="site-button site-button-primary md:col-span-2">
              {loading ? "Tracking..." : "Track order"}
            </button>
          </form>
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
          {result ? (
            <div className="mt-6 rounded-[2rem] bg-[var(--color-surface)] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                {result.orderCode}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-blue)]">
                {result.status} · {result.paymentStatus}
              </h2>
              <div className="mt-4 space-y-2 text-sm text-[var(--color-ink-soft)]">
                {result.items.map((item) => (
                  <p key={item.productName}>
                    {item.productName} × {item.quantity} · Rs. {item.totalPriceInr}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </StorefrontShell>
  );
}
