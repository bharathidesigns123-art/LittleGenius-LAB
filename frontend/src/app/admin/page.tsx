"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { browserApi } from "@/lib/browser-api";
import type { DashboardMetrics } from "@/lib/types";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    browserApi
      .getDashboard(token)
      .then(setMetrics)
      .catch(() => setError("Could not load metrics. Please retry."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const fulfillmentRate = metrics && metrics.totalOrders > 0 ? Math.round(((metrics.totalOrders - metrics.pendingOrders) / metrics.totalOrders) * 100) : 0;

  return (
    <AdminShell title="Operations overview">
      {error ? (
        <div className="surface-card mb-5 rounded-[1.4rem] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button onClick={loadDashboard} className="ml-3 underline">
            Retry
          </button>
        </div>
      ) : null}
      <div className="grid gap-5 md:grid-cols-4">
        {[
          { label: "Total orders", value: metrics?.totalOrders ?? "-" },
          { label: "Revenue", value: metrics ? `Rs. ${metrics.revenue}` : "-" },
          { label: "Pending orders", value: metrics?.pendingOrders ?? "-" },
          { label: "Low stock products", value: metrics?.lowStockProducts ?? "-" },
        ].map((item) => (
          <div key={item.label} className="surface-card rounded-[2rem] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-orange)]">
              {item.label}
            </p>
            <p className="mt-4 text-3xl font-bold text-[var(--color-blue)]">
              {loading ? <span className="inline-block h-9 w-20 animate-pulse rounded bg-slate-200" /> : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="surface-card rounded-[2rem] p-6 md:col-span-2">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-orange)]">Fulfillment progress</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-blue)]">{fulfillmentRate}% orders processed</p>
          <div className="mt-4 h-3 rounded-full bg-[var(--color-border)]">
            <div className="h-3 rounded-full bg-[var(--color-blue)] transition-all" style={{ width: `${fulfillmentRate}%` }} />
          </div>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
            {metrics?.pendingOrders ?? 0} orders pending action today.
          </p>
        </div>
        <div className="surface-card rounded-[2rem] p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-orange)]">Critical alerts</p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-ink-soft)]">
            <li>Low stock products: {loading ? "-" : metrics?.lowStockProducts ?? 0}</li>
            <li>Pending orders: {loading ? "-" : metrics?.pendingOrders ?? 0}</li>
            <li>Custom orders require manual review</li>
          </ul>
        </div>
      </div>

      <div className="surface-card rounded-[2rem] p-6">
        <h2 className="display-font text-3xl font-semibold text-[var(--color-blue)]">
          Quick management links
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            { href: "/admin/products", label: "Manage products and stock" },
            { href: "/admin/categories", label: "Manage categories" },
            { href: "/admin/orders", label: "Update order statuses" },
            { href: "/admin/custom-orders", label: "Review custom requests" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[1.6rem] bg-[var(--color-surface)] px-5 py-4 text-sm font-semibold text-[var(--color-blue)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
