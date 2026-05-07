"use client";

import { useState } from "react";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { LoadingButtonContent } from "@/components/ui/loading-indicator";
import { browserApi } from "@/lib/browser-api";
import { formatUtcDate } from "@/lib/date-time";
import type { TrackOrderResponse } from "@/lib/types";

const ORDER_STEPS = ["Printing", "Packed", "Shipped", "Delivered"];
const CUSTOM_ORDER_STEPS = ["New", "Reviewing", "Quoted", "Approved", "Printing", "Packed", "Shipped", "Delivered"];

function statusClass(status: string) {
  if (status === "Delivered") return "status-pill status-pill-blue";
  if (status === "Cancelled") return "status-pill bg-red-50 text-red-700";
  if (status === "Shipped") return "status-pill bg-emerald-50 text-emerald-700";
  return "status-pill status-pill-yellow";
}

function OrderProgress({ status, orderType }: { status: string; orderType?: string }) {
  const steps = orderType === "custom" ? CUSTOM_ORDER_STEPS : ORDER_STEPS;
  const activeIndex = steps.indexOf(status);
  return (
    <div className="mt-5 grid grid-cols-4 gap-2 md:grid-cols-8">
      {steps.map((step, index) => (
        <div key={step}>
          <div
            className={`h-2 rounded-full ${
              status === "Cancelled"
                ? "bg-red-100"
                : index <= activeIndex
                  ? "bg-[var(--color-orange)]"
                  : "bg-[var(--color-border)]"
            }`}
          />
          <p className="mt-2 truncate text-xs font-semibold text-[var(--color-ink-soft)]">{step}</p>
        </div>
      ))}
    </div>
  );
}

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<TrackOrderResponse | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let order: TrackOrderResponse;
      try {
        order = await browserApi.trackOrder(orderCode.trim(), phone.trim());
      } catch {
        order = await browserApi.trackCustomOrder(orderCode.trim(), phone.trim());
      }
      setResult(order);
    } catch (trackError) {
      setResult(null);
      setError(trackError instanceof Error ? trackError.message : "Could not find order.");
    } finally {
      setLoading(false);
    }
  };

  const cancelTrackedOrder = async () => {
    if (!result) return;
    setCancelling(true);
    setError("");
    setMessage("");

    try {
      await browserApi.cancelTrackedOrder(result.orderCode, phone.trim(), "Cancelled from guest tracking.");
      const refreshed = await browserApi.trackOrder(result.orderCode, phone.trim());
      setResult(refreshed);
      setMessage("Cancellation request received. Refund status is now visible below.");
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Could not cancel this order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <StorefrontShell>
      <div className="page-shell py-16">
        <div className="mx-auto max-w-2xl surface-card card-shadow rounded-[1.5rem] p-8">
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
              className="rounded-[1rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              placeholder="LGL-ORD-10001"
              required
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="rounded-[1rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              placeholder="Phone number"
              required
            />
            <button disabled={loading} className="site-button site-button-primary md:col-span-2 disabled:cursor-wait disabled:opacity-70">
              <LoadingButtonContent loading={loading} loadingText="Tracking...">
                Track order
              </LoadingButtonContent>
            </button>
          </form>
          {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
          {message ? <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p> : null}
          {result ? (
            <div className="mt-6 rounded-[1.5rem] bg-[var(--color-surface)] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                {result.orderCode}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="status-pill status-pill-blue">
                  {result.orderType === "custom" ? "Custom order" : "Product order"}
                </span>
                <span className={statusClass(result.status)}>{result.status}</span>
                <span className="status-pill status-pill-yellow">{result.paymentStatus}</span>
                {result.refundStatus && result.refundStatus !== "NotRequested" ? (
                  <span className="status-pill status-pill-orange">Refund {result.refundStatus}</span>
                ) : null}
              </div>
              <OrderProgress status={result.status} orderType={result.orderType} />
              <div className="mt-4 space-y-2 text-sm text-[var(--color-ink-soft)]">
                {result.items.map((item) => (
                  <p key={item.productName}>
                    {item.productName} x {item.quantity} | Rs. {item.totalPriceInr}
                  </p>
                ))}
                {result.orderType === "custom" ? (
                  <div className="grid gap-2 rounded-[1rem] bg-white/70 p-4 md:grid-cols-2">
                    {result.occasion ? <p>Occasion: {result.occasion}</p> : null}
                    {result.size ? <p>Size: {result.size}</p> : null}
                    {result.colorPreference ? <p>Colour: {result.colorPreference}</p> : null}
                    {result.baseMessage ? <p>Base message: {result.baseMessage}</p> : null}
                    {result.characterDescription ? (
                      <p className="md:col-span-2">Description: {result.characterDescription}</p>
                    ) : null}
                    {result.notes ? <p className="md:col-span-2">Admin note: {result.notes}</p> : null}
                  </div>
                ) : null}
                {result.trackingNumber ? <p>Tracking: {result.trackingNumber}</p> : null}
                {result.deliveredAtUtc ? (
                  <p>Delivered: {formatUtcDate(result.deliveredAtUtc)}</p>
                ) : result.shippedAtUtc ? (
                  <p>Shipped: {formatUtcDate(result.shippedAtUtc)}</p>
                ) : null}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {result.cancellationEligible && result.orderType !== "custom" ? (
                  <button
                    onClick={cancelTrackedOrder}
                    disabled={cancelling}
                    className="site-button site-button-secondary disabled:cursor-wait disabled:opacity-70"
                  >
                    <LoadingButtonContent loading={cancelling} loadingText="Cancelling...">
                      Cancel order
                    </LoadingButtonContent>
                  </button>
                ) : null}
                <p className="text-sm font-semibold text-[var(--color-ink-soft)]">
                  {result.cancellationEligible
                    ? "Eligible for cancellation before shipment."
                    : "Cancellation is unavailable once shipped or delivered."}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </StorefrontShell>
  );
}
