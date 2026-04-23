"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { browserApi } from "@/lib/browser-api";
import type { OrderSummary } from "@/lib/types";

export default function AccountPage() {
  const { token, user, isAuthenticated, loading, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [message, setMessage] = useState("");

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
    if (!token) {
      return;
    }
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

  return (
    <StorefrontShell>
      <div className="page-shell py-10">
        {loading ? (
          <div className="surface-card rounded-[2rem] p-6 text-sm text-[var(--color-ink-soft)]">
            Loading your account...
          </div>
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
          <div className="grid gap-8 md:grid-cols-[360px_1fr]">
            <div className="surface-card card-shadow rounded-[2rem] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                Profile
              </p>
              <h1 className="display-font mt-2 text-3xl font-semibold text-[var(--color-blue)]">
                Your account
              </h1>
              <form onSubmit={handleSave} className="mt-6 space-y-4">
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
                <input
                  value={user?.email ?? ""}
                  disabled
                  className="w-full rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none"
                />
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
                {message ? <p className="text-sm text-[var(--color-orange)]">{message}</p> : null}
                <button disabled={saving} className="site-button site-button-primary w-full">
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </form>
            </div>

            <div className="space-y-5">
              <div className="surface-card card-shadow rounded-[2rem] p-6">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                  Order history
                </p>
                <h2 className="display-font mt-2 text-3xl font-semibold text-[var(--color-blue)]">
                  Track every purchase
                </h2>
              </div>
              {loadingOrders ? (
                <div className="surface-card rounded-[2rem] p-6 text-sm text-[var(--color-ink-soft)]">
                  Loading your orders...
                </div>
              ) : orders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  description="Once you place an order, it will appear here with live status updates from the backend."
                />
              ) : (
                orders.map((order) => (
                  <div key={order.orderCode} className="surface-card rounded-[2rem] p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-orange)]">
                          {order.orderCode}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-[var(--color-blue)]">
                          {order.status} · {order.paymentStatus}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-ink-soft)]">
                        Rs. {order.totalPriceInr}
                      </p>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-[var(--color-ink-soft)]">
                      {order.items.map((item) => (
                        <p key={item.productName}>
                          {item.productName} × {item.quantity}
                        </p>
                      ))}
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
