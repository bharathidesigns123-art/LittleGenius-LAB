"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  Package,
  Tags,
  Palette
} from "lucide-react";
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

  const stats = [
    { label: "Total orders", value: metrics?.totalOrders ?? "-", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Revenue", value: metrics ? `Rs. ${metrics.revenue}` : "-", icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending orders", value: metrics?.pendingOrders ?? "-", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Low stock", value: metrics?.lowStockProducts ?? "-", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ];

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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="surface-card card-shadow rounded-[2rem] p-6 transition-all hover:translate-y-[-4px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-[var(--color-blue)]">
                    {loading ? <span className="inline-block h-9 w-20 animate-pulse rounded bg-slate-200" /> : item.value}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="surface-card card-shadow rounded-[2.5rem] p-8 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-orange)]">Performance</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-blue)]">Fulfillment Status</h2>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold text-[var(--color-blue)]">{fulfillmentRate}%</span>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-soft)] mt-1 text-right">Processed</p>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]/50 p-1">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-orange)] transition-all duration-1000 ease-out" 
                style={{ width: `${fulfillmentRate}%` }} 
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--color-blue)]" />
                <span className="font-semibold text-[var(--color-ink-soft)]">
                  {metrics?.totalOrders ?? 0} Total Orders
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--color-orange)]" />
                <span className="font-semibold text-[var(--color-orange)]">
                  {metrics?.pendingOrders ?? 0} Pending Action
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card card-shadow rounded-[2.5rem] p-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-[var(--color-orange)]" size={20} />
            <h2 className="text-xl font-semibold text-[var(--color-blue)]">Critical alerts</h2>
          </div>
          <div className="mt-6 space-y-4">
            {[
              { label: "Low stock items", count: metrics?.lowStockProducts ?? 0, urgent: (metrics?.lowStockProducts ?? 0) > 0 },
              { label: "Pending orders", count: metrics?.pendingOrders ?? 0, urgent: (metrics?.pendingOrders ?? 0) > 0 },
              { label: "Custom reviews", count: "Manual", urgent: true },
            ].map((alert, i) => (
              <div key={i} className={`flex items-center justify-between rounded-2xl p-4 ${alert.urgent ? "bg-red-50/50" : "bg-slate-50/50"}`}>
                <span className="text-sm font-semibold text-[var(--color-ink-soft)]">{alert.label}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${alert.urgent ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-600"}`}>
                  {loading ? "..." : alert.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card card-shadow rounded-[2.5rem] p-8">
        <h2 className="display-font text-3xl font-semibold text-[var(--color-blue)]">
          Quick management
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/products", label: "Inventory", desc: "Products and stock", icon: Package },
            { href: "/admin/categories", label: "Categories", desc: "Catalogue structure", icon: Tags },
            { href: "/admin/orders", label: "Orders", desc: "Fulfillment flow", icon: ShoppingBag },
            { href: "/admin/custom-orders", label: "Custom", desc: "Design requests", icon: Palette },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group relative overflow-hidden rounded-[2rem] bg-[var(--color-surface)] p-6 transition-all hover:bg-[var(--color-blue)]"
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--color-blue)] shadow-sm group-hover:bg-[var(--color-orange)] group-hover:text-white transition-colors">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 font-bold text-[var(--color-blue)] group-hover:text-white">{link.label}</h3>
                  <p className="mt-1 text-xs text-[var(--color-ink-soft)] group-hover:text-white/80">{link.desc}</p>
                  <div className="mt-auto pt-4 flex items-center text-xs font-bold text-[var(--color-orange)] group-hover:text-white">
                    Manage <ArrowRight size={14} className="ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
