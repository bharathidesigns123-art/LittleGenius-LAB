"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { browserApi } from "@/lib/browser-api";
import type { OrderSummary } from "@/lib/types";

const ORDER_STATUSES = ["Pending", "Printing", "Packed", "Shipped", "Delivered", "Cancelled"];
const REFUND_STATUSES = ["NotRequested", "Pending", "Approved", "Rejected"];
const COURIERS = ["India Post", "DTDC", "Delhivery", "Blue Dart", "Professional Courier", "Other"];
const SENDER_DETAILS = {
  name: "LittleGenius LAB",
  line1: "Chennai, Tamil Nadu",
  line2: "India",
  phone: "+91 63837 11863",
};

type Draft = {
  status: string;
  trackingNumber: string;
  packageWeightKg: string;
  packageDimensionsCm: string;
  courierPartner: string;
};

function statusClass(status: string) {
  if (status === "Delivered") return "status-pill status-pill-blue";
  if (status === "Cancelled") return "status-pill bg-red-50 text-red-700";
  if (status === "Shipped") return "status-pill bg-emerald-50 text-emerald-700";
  return "status-pill status-pill-yellow";
}

function shippingLines(order: OrderSummary) {
  const address = order.shippingAddress;
  if (!address) return ["Address not available"];
  return [
    address.customerName,
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.pincode}`,
    address.country,
    `${address.phone} | ${address.email}`,
  ].filter(Boolean);
}

function printShippingLabel(order: OrderSummary) {
  const label = window.open("", "_blank", "width=520,height=720");
  if (!label) return;

  const address = order.shippingAddress;
  const itemSummary = order.items
    .map((item) => `${item.productName} x ${item.quantity}`)
    .join("<br />");
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const weight = order.packageWeightKg ? `${order.packageWeightKg} kg` : "To be weighed";
  const dimensions = order.packageDimensionsCm || "To be measured";
  const courier = order.courierPartner || "To assign";
  const trackingNumber = order.trackingNumber || order.orderCode;
  const barcode = trackingNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const barcodeBars = barcode
    .split("")
    .map((char) => {
      const width = (char.charCodeAt(0) % 3) + 1;
      return `<span style="width:${width}px"></span>`;
    })
    .join("");
  const shipDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const specialInstructions = order.notes?.trim() || "Keep dry. Deliver to recipient only.";

  label.document.write(`
    <html>
      <head>
        <title>Shipping label ${order.orderCode}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 18px;
            background: #1d1d1b;
            color: #f5f1e9;
            font-family: Arial, Helvetica, sans-serif;
          }
          .label {
            width: 600px;
            max-width: 100%;
            border: 2px solid #77746c;
            border-radius: 8px;
            background: #2e2f2c;
            overflow: hidden;
          }
          .topbar {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 10px 16px;
            background: #1d1d34;
            border-bottom: 1px solid #3e3e39;
            font-weight: 800;
          }
          .topbar span:last-child {
            color: #c7c0b7;
            font-size: 12px;
          }
          .section {
            padding: 14px 16px;
            border-bottom: 1px dashed #5b5a54;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-bottom: 1px dashed #5b5a54;
          }
          .grid .section:first-child {
            border-right: 1px dashed #5b5a54;
          }
          .grid .section {
            border-bottom: 0;
          }
          .mini-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            border-bottom: 1px dashed #5b5a54;
          }
          .mini-grid div {
            padding: 12px 16px;
            text-align: center;
          }
          .mini-grid div + div {
            border-left: 1px solid #55544f;
          }
          .eyebrow {
            margin: 0 0 7px;
            color: #b7b4ad;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: .04em;
            text-transform: uppercase;
          }
          .name {
            margin: 0 0 4px;
            color: #ffffff;
            font-size: 16px;
            font-weight: 800;
          }
          p {
            margin: 3px 0;
            color: #d4d0c8;
            font-size: 13px;
            line-height: 1.25;
            font-weight: 650;
          }
          strong {
            color: #ffffff;
          }
          .barcode-wrap {
            padding: 14px 16px 12px;
            text-align: center;
            border-bottom: 1px dashed #5b5a54;
          }
          .barcode {
            display: inline-flex;
            height: 48px;
            gap: 1px;
            padding: 0 4px;
            background: #ffffff;
            align-items: stretch;
          }
          .barcode span {
            display: block;
            background: #1d1d1b;
          }
          .tracking {
            margin-top: 7px;
            color: #ffffff;
            font-size: 17px;
            font-weight: 900;
            letter-spacing: .08em;
          }
          .instructions {
            padding: 10px 16px 12px;
          }
          @media print {
            body { padding: 0; background: #fff; }
            .label { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="topbar">
            <span>SHIPPING LABEL</span>
            <span>${order.status === "Packed" ? "Ready to Ship" : "Priority / Standard"}</span>
          </div>

          <div class="section">
            <p class="eyebrow">From (Sender)</p>
            <p class="name">${SENDER_DETAILS.name}</p>
            <p>${SENDER_DETAILS.line1}</p>
            <p>${SENDER_DETAILS.line2}</p>
            <p>Phone: ${SENDER_DETAILS.phone}</p>
          </div>

          <div class="section">
            <p class="eyebrow">To (Recipient)</p>
            <p class="name">${address?.customerName || order.customerName || "Customer"}</p>
            <p>${address?.line1 || "Address line missing"}</p>
            ${address?.line2 ? `<p>${address.line2}</p>` : ""}
            <p>${address?.city || ""}${address?.city && address?.state ? ", " : ""}${address?.state || ""} ${address?.pincode || ""}</p>
            <p>${address?.country || "India"}</p>
            <p>Phone: ${address?.phone || order.phone || "Not provided"}</p>
            <p>Email: ${address?.email || order.email || "Not provided"}</p>
          </div>

          <div class="grid">
            <div class="section">
              <p class="eyebrow">Product Details</p>
              <p><strong>Items:</strong><br />${itemSummary}</p>
              <p><strong>Qty:</strong> ${totalQuantity}</p>
              <p><strong>Weight:</strong> ${weight}</p>
              <p><strong>Dimensions:</strong> ${dimensions}</p>
            </div>
            <div class="section">
              <p class="eyebrow">Shipment Info</p>
              <p><strong>Order ID:</strong> ${order.orderCode}</p>
              <p><strong>Ship Date:</strong> ${shipDate}</p>
              <p><strong>Courier:</strong> ${courier}</p>
              <p><strong>Service:</strong> ${order.paymentMethod}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
          </div>

          <div class="barcode-wrap">
            <p class="eyebrow">Tracking Number</p>
            <div class="barcode">${barcodeBars}</div>
            <div class="tracking">${trackingNumber}</div>
          </div>

          <div class="mini-grid">
            <div>
              <p class="eyebrow">Declared Value</p>
              <p><strong>Rs. ${order.totalPriceInr}</strong></p>
            </div>
            <div>
              <p class="eyebrow">Contents</p>
              <p><strong>${order.items.length > 1 ? "Multiple items" : order.items[0]?.productName || "Product"}</strong></p>
            </div>
            <div>
              <p class="eyebrow">Handling</p>
              <p><strong>Handle with Care</strong></p>
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <p class="eyebrow">Payment</p>
              <p><strong>${order.paymentMethod}</strong></p>
              <p>${order.paymentStatus}</p>
              <p>Subtotal: Rs. ${order.subtotalInr ?? order.totalPriceInr}</p>
              <p>Shipping: Rs. ${order.shippingFeeInr ?? 0}</p>
            </div>
            <div class="section">
              <p class="eyebrow">Support Reference</p>
              <p><strong>Customer:</strong> ${order.customerName || address?.customerName || "Customer"}</p>
              <p><strong>Phone:</strong> ${order.phone || address?.phone || "Not provided"}</p>
              <p><strong>Refund:</strong> ${order.refundStatus || "NotRequested"}</p>
            </div>
          </div>

          <div class="instructions">
            <p class="eyebrow">Special Instructions</p>
            <p><strong>${specialInstructions}</strong></p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `);
  label.document.close();
}

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [filters, setFilters] = useState({ status: "", dateFrom: "", dateTo: "", customer: "" });
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedOrders = useMemo(
    () => orders.filter((order) => selected.includes(order.id)),
    [orders, selected],
  );

  const seedDrafts = (result: OrderSummary[]) =>
    setDrafts(
      Object.fromEntries(
        result.map((order) => [
          order.id,
          {
            status: order.status,
            trackingNumber: order.trackingNumber ?? "",
            packageWeightKg: order.packageWeightKg?.toString() ?? "",
            packageDimensionsCm: order.packageDimensionsCm ?? "",
            courierPartner: order.courierPartner ?? "",
          },
        ]),
      ),
    );

  const loadOrders = async () => {
    if (!token) return;
    setLoading(true);
    setMessage("");
    try {
      const result = await browserApi.getAdminOrders(token, filters);
      setOrders(result);
      seedDrafts(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    let isActive = true;

    const hydrate = async () => {
      const result = await browserApi.getAdminOrders(token);
      if (isActive) {
        setOrders(result);
        seedDrafts(result);
      }
    };

    void hydrate();

    return () => {
      isActive = false;
    };
  }, [token]);

  const updateDraft = (order: OrderSummary, patch: Partial<Draft>) =>
    setDrafts((current) => ({
      ...current,
      [order.id]: {
        status: current[order.id]?.status ?? order.status,
        trackingNumber: current[order.id]?.trackingNumber ?? order.trackingNumber ?? "",
        packageWeightKg: current[order.id]?.packageWeightKg ?? order.packageWeightKg?.toString() ?? "",
        packageDimensionsCm: current[order.id]?.packageDimensionsCm ?? order.packageDimensionsCm ?? "",
        courierPartner: current[order.id]?.courierPartner ?? order.courierPartner ?? "",
        ...patch,
      },
    }));

  const saveOrder = async (order: OrderSummary) => {
    if (!token) return;
    const draft = drafts[order.id];
    await browserApi.updateOrderStatus(token, order.id, {
      status: draft.status,
      trackingNumber: draft.trackingNumber,
      packageWeightKg: draft.packageWeightKg ? Number(draft.packageWeightKg) : null,
      packageDimensionsCm: draft.packageDimensionsCm,
      courierPartner: draft.courierPartner,
    });
    setMessage(`Saved ${order.orderCode}.`);
    await loadOrders();
  };

  const markSelectedPacked = async () => {
    if (!token || selectedOrders.length === 0) return;
    await Promise.all(
      selectedOrders.map((order) =>
        browserApi.updateOrderStatus(token, order.id, {
          status: "Packed",
          trackingNumber: order.trackingNumber ?? "",
          packageWeightKg: order.packageWeightKg ?? null,
          packageDimensionsCm: order.packageDimensionsCm ?? "",
          courierPartner: order.courierPartner ?? "",
        }),
      ),
    );
    setSelected([]);
    setMessage("Selected orders marked packed.");
    await loadOrders();
  };

  return (
    <AdminShell title="Order management">
      <div className="space-y-5">
        <div className="surface-card rounded-[1.5rem] p-4">
          <div className="grid gap-3 md:grid-cols-[160px_150px_150px_1fr_auto_auto]">
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
              className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
              className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
            />
            <input
              value={filters.customer}
              onChange={(event) => setFilters((current) => ({ ...current, customer: event.target.value }))}
              placeholder="Customer, phone, email, order ID"
              className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
            />
            <button onClick={loadOrders} className="site-button site-button-primary">
              {loading ? "Loading..." : "Filter"}
            </button>
            <button onClick={markSelectedPacked} className="site-button site-button-secondary">
              Pack selected
            </button>
          </div>
          {message ? <p className="mt-3 text-sm font-semibold text-[var(--color-orange)]">{message}</p> : null}
        </div>

        {orders.map((order) => {
          const draft = drafts[order.id];
          return (
            <div key={order.id} className="surface-card rounded-[1.5rem] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(order.id)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, order.id]
                            : current.filter((value) => value !== order.id),
                        )
                      }
                    />
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-orange)]">
                      {order.orderCode}
                    </p>
                    <span className="text-xs font-semibold text-[var(--color-ink-soft)]">
                      {new Date(order.createdAtUtc).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className={statusClass(order.status)}>{order.status}</span>
                    <span className="status-pill status-pill-blue">{order.refundStatus ?? "NotRequested"}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-[var(--color-blue)]">
                    {order.customerName ?? order.shippingAddress?.customerName ?? "Customer"}
                  </h2>
                  <div className="mt-3 grid gap-4 text-sm text-[var(--color-ink-soft)] md:grid-cols-2">
                    <div>
                      <p className="font-bold text-[var(--color-blue)]">Shipping address</p>
                      {shippingLines(order).map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--color-blue)]">Items</p>
                      {order.items.map((item) => (
                        <p key={item.productName}>
                          {item.productName} x {item.quantity} | Rs. {item.totalPriceInr}
                        </p>
                      ))}
                      <p className="mt-2 font-semibold">Total Rs. {order.totalPriceInr}</p>
                    </div>
                  </div>
                </div>

                <div className="grid w-full gap-3 lg:w-[440px]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={draft?.status ?? order.status}
                      onChange={(event) => updateDraft(order, { status: event.target.value })}
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <select
                      value={draft?.courierPartner ?? ""}
                      onChange={(event) => updateDraft(order, { courierPartner: event.target.value })}
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    >
                      <option value="">Courier partner</option>
                      {COURIERS.map((courier) => (
                        <option key={courier}>{courier}</option>
                      ))}
                    </select>
                    <input
                      value={draft?.trackingNumber ?? ""}
                      onChange={(event) => updateDraft(order, { trackingNumber: event.target.value })}
                      placeholder="Tracking number"
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    />
                    <input
                      value={draft?.packageWeightKg ?? ""}
                      onChange={(event) => updateDraft(order, { packageWeightKg: event.target.value })}
                      placeholder="Weight kg"
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    />
                    <input
                      value={draft?.packageDimensionsCm ?? ""}
                      onChange={(event) => updateDraft(order, { packageDimensionsCm: event.target.value })}
                      placeholder="L x W x H cm"
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none sm:col-span-2"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => saveOrder(order)} className="site-button site-button-primary">
                      Save
                    </button>
                    <button onClick={() => printShippingLabel(order)} className="site-button site-button-secondary">
                      Print label
                    </button>
                    {order.status === "Cancelled" ? (
                      REFUND_STATUSES.filter((status) => status !== "NotRequested").map((refundStatus) => (
                        <button
                          key={refundStatus}
                          onClick={async () => {
                            if (!token) return;
                            await browserApi.updateRefundStatus(token, order.id, { refundStatus });
                            await loadOrders();
                          }}
                          className="site-button site-button-secondary"
                        >
                          {refundStatus}
                        </button>
                      ))
                    ) : null}
                  </div>
                  <p className="text-xs font-semibold text-[var(--color-ink-soft)]">
                    Cancellation: {order.cancellationEligible ? "Eligible before shipment" : "Locked by policy"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
