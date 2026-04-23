"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { browserApi } from "@/lib/browser-api";
import type { OrderSummary } from "@/lib/types";

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [drafts, setDrafts] = useState<Record<number, { status: string; trackingNumber: string }>>({});

  const loadOrders = async () => {
    if (!token) {
      return;
    }
    const result = await browserApi.getAdminOrders(token);
    setOrders(result);
    setDrafts(
      Object.fromEntries(
        result.map((order) => [
          order.id,
          { status: order.status, trackingNumber: order.trackingNumber ?? "" },
        ]),
      ),
    );
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;
    const hydrate = async () => {
      const result = await browserApi.getAdminOrders(token);
      if (isActive) {
        setOrders(result);
        setDrafts(
          Object.fromEntries(
            result.map((order) => [
              order.id,
              { status: order.status, trackingNumber: order.trackingNumber ?? "" },
            ]),
          ),
        );
      }
    };
    void hydrate();

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <AdminShell title="Order management">
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="surface-card rounded-[2rem] p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                  {order.orderCode}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--color-blue)]">
                  {order.status} · {order.paymentStatus}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                  Rs. {order.totalPriceInr} · {order.paymentMethod}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
                <select
                  value={drafts[order.id]?.status ?? order.status}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [order.id]: {
                        status: event.target.value,
                        trackingNumber: current[order.id]?.trackingNumber ?? "",
                      },
                    }))
                  }
                  className="rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                >
                  {["Pending", "Printing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
                <input
                  value={drafts[order.id]?.trackingNumber ?? ""}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [order.id]: {
                        status: current[order.id]?.status ?? order.status,
                        trackingNumber: event.target.value,
                      },
                    }))
                  }
                  placeholder="Tracking number"
                  className="rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
                <button
                  onClick={async () => {
                    if (!token) {
                      return;
                    }
                    await browserApi.updateOrderStatus(token, order.id, drafts[order.id]);
                    await loadOrders();
                  }}
                  className="site-button site-button-primary"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[var(--color-ink-soft)]">
              {order.items.map((item) => (
                <p key={item.productName}>
                  {item.productName} × {item.quantity} · Rs. {item.totalPriceInr}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
