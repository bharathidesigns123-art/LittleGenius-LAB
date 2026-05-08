"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingButtonContent, PageLoader, SkeletonBlock } from "@/components/ui/loading-indicator";
import { browserApi } from "@/lib/browser-api";
import { formatUtcDate } from "@/lib/date-time";
import type { OrderSummary } from "@/lib/types";

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
    <div className="mt-4 overflow-x-auto pb-1">
      <div className="grid min-w-[520px] grid-cols-4 gap-2 md:min-w-0 md:grid-cols-8">
      {steps.map((step, index) => (
        <div key={step} className="min-w-0">
          <div
            className={`h-2 rounded-full ${
              status === "Cancelled"
                ? "bg-red-100"
                : index <= activeIndex
                  ? "bg-[var(--color-orange)]"
                  : "bg-[var(--color-border)]"
            }`}
          />
          <p className="mt-2 text-xs font-semibold text-[var(--color-ink-soft)] md:truncate">{step}</p>
        </div>
      ))}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { token, user, isAuthenticated, loading, refreshProfile, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [message, setMessage] = useState("");

  const reloadOrders = async () => {
    if (!token) return;
    const result = await browserApi.getAccountOrders(token);
    setOrders(result);
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    let isActive = true;

    const loadOrders = async () => {
      const result = await browserApi.getAccountOrders(token);
      if (isActive) {
        setForm({
          fullName: user?.fullName ?? "",
          phone: user?.phone ?? "",
        });
        setOrders(result);
        setLoadingOrders(false);
      }
    };

    void loadOrders();

    return () => {
      isActive = false;
    };
  }, [token, user]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setMessage("");

    try {
      await browserApi.updateProfile(token, form);
      await refreshProfile();
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const cancelOrder = async (order: OrderSummary) => {
    if (!token) return;
    setMessage("");
    try {
      await browserApi.cancelAccountOrder(token, order.id, "Cancelled from account order history.");
      await reloadOrders();
      setMessage(`Cancellation requested for ${order.orderCode}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not cancel this order.");
    }
  };

  return (
    <StorefrontShell>
      <div className="page-shell py-10">
        {loading ? (
          <PageLoader title="Loading your account" />
        ) : !isAuthenticated ? (
          <EmptyState
            title="Login to view your account"
            description="Order history, account details, and future account-based features are available after login."
            action={
              <Link href="/login" className="site-button site-button-primary">
                Login
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:gap-8">
            <div className="surface-card card-shadow rounded-[1.5rem] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                Profile
              </p>
              <h1 className="display-font mt-2 text-3xl font-semibold text-[var(--color-blue)]">
                Your account
              </h1>
              <Link href="/orders" className="mt-3 inline-block text-sm font-bold text-[var(--color-blue)] underline">
                Orders overview
              </Link>
              <form onSubmit={handleSave} className="mt-6 space-y-4">
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  className="w-full rounded-[1rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
                <input
                  value={user?.email ?? ""}
                  disabled
                  className="w-full rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none"
                />
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="w-full rounded-[1rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
                {message ? <p className="text-sm font-semibold text-[var(--color-orange)]">{message}</p> : null}
                <button disabled={saving} className="site-button site-button-primary w-full disabled:cursor-wait disabled:opacity-70">
                  <LoadingButtonContent loading={saving} loadingText="Saving...">
                    Save profile
                  </LoadingButtonContent>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="site-button site-button-secondary mt-2 w-full"
                >
                  Logout
                </button>
              </form>
            </div>

            <div className="space-y-5">
              <div className="surface-card card-shadow rounded-[1.5rem] p-6">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                  Order history
                </p>
                <h2 className="display-font mt-2 text-3xl font-semibold text-[var(--color-blue)]">
                  Track every purchase
                </h2>
              </div>
              {loadingOrders ? (
                <div className="grid gap-4">
                  <SkeletonBlock className="h-36 bg-white/70" />
                  <SkeletonBlock className="h-36 bg-white/70" />
                </div>
              ) : orders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  description="Once you place an order, it will appear here with live status updates from the backend."
                />
              ) : (
                orders.map((order) => (
                  <div key={order.orderCode} className="surface-card rounded-[1.5rem] p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-orange)]">
                          {order.orderCode}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="status-pill status-pill-blue">
                            {order.orderType === "custom" ? "Custom order" : "Product order"}
                          </span>
                          <span className={statusClass(order.status)}>{order.status}</span>
                          <span className="status-pill status-pill-yellow">{order.paymentStatus}</span>
                          {order.refundStatus && order.refundStatus !== "NotRequested" ? (
                            <span className="status-pill status-pill-orange">Refund {order.refundStatus}</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--color-ink-soft)]">
                          Rs. {order.totalPriceInr}
                        </p>
                        {order.cancellationEligible && order.orderType !== "custom" ? (
                          <button onClick={() => cancelOrder(order)} className="site-button site-button-secondary">
                            Cancel order
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <OrderProgress status={order.status} orderType={order.orderType} />
                    <div className="mt-4 space-y-2 text-sm text-[var(--color-ink-soft)]">
                      {order.items.map((item) => (
                        <p key={item.productName}>
                          {item.productName} x {item.quantity}
                        </p>
                      ))}
                      {order.orderType === "custom" ? (
                        <div className="grid gap-2 rounded-[1rem] bg-[var(--color-surface)] p-4 md:grid-cols-2">
                          {order.occasion ? <p>Occasion: {order.occasion}</p> : null}
                          {order.size ? <p>Size: {order.size}</p> : null}
                          {order.colorPreference ? <p>Colour: {order.colorPreference}</p> : null}
                          {order.baseMessage ? <p>Base message: {order.baseMessage}</p> : null}
                          {order.characterDescription ? (
                            <p className="md:col-span-2">Description: {order.characterDescription}</p>
                          ) : null}
                          {order.notes ? <p className="md:col-span-2">Admin note: {order.notes}</p> : null}
                        </div>
                      ) : null}
                      {order.trackingNumber ? <p>Tracking: {order.trackingNumber}</p> : null}
                      {order.deliveredAtUtc ? (
                        <p>Delivered: {formatUtcDate(order.deliveredAtUtc)}</p>
                      ) : order.shippedAtUtc ? (
                        <p>Shipped: {formatUtcDate(order.shippedAtUtc)}</p>
                      ) : null}
                      {order.orderType === "custom" ? (
                        <p className="font-semibold text-[var(--color-ink-soft)]">
                          Custom requests move through review, quote, approval, printing, packing, shipping, and delivery.
                        </p>
                      ) : order.cancellationEligible ? (
                        <p className="font-semibold text-emerald-700">Eligible for cancellation before shipment.</p>
                      ) : (
                        <p className="font-semibold text-[var(--color-ink-soft)]">
                          Cancellation is unavailable once shipped or delivered.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
