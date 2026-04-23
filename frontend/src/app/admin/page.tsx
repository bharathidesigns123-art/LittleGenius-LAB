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

  useEffect(() => {
    if (!token) {
      return;
    }
    browserApi.getDashboard(token).then(setMetrics).catch(() => undefined);
  }, [token]);

  return (
    <AdminShell title="Operations overview">
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
            <p className="mt-4 text-3xl font-bold text-[var(--color-blue)]">{item.value}</p>
          </div>
        ))}
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
