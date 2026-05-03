"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  Calendar, 
  Filter, 
  Truck, 
  Printer, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  PackageCheck,
  User,
  MapPin,
  ExternalLink
} from "lucide-react";
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
  if (status === "Delivered") return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-700/10";
  if (status === "Cancelled") return "bg-red-100 text-red-700 ring-1 ring-red-700/10";
  if (status === "Shipped") return "bg-blue-100 text-blue-700 ring-1 ring-blue-700/10";
  if (status === "Printing") return "bg-amber-100 text-amber-700 ring-1 ring-amber-700/10";
  if (status === "Packed") return "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-700/10";
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-700/10";
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
      <div className="space-y-6">
        {/* Filters Bar */}
        <div className="surface-card card-shadow rounded-[2rem] p-6">
          <div className="flex flex-wrap items-center gap-4">
             <div className="relative flex-1 min-w-[240px]">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.customer}
                  onChange={(event) => setFilters((current) => ({ ...current, customer: event.target.value }))}
                  placeholder="Search customer, phone, or order ID..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10"
                />
             </div>
             
             <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 h-12">
                   <Filter size={16} className="text-slate-400" />
                   <select
                     value={filters.status}
                     onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                     className="bg-transparent text-sm font-semibold text-[var(--color-blue)] outline-none"
                   >
                     <option value="">All Statuses</option>
                     {ORDER_STATUSES.map((status) => (
                       <option key={status}>{status}</option>
                     ))}
                   </select>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 h-12">
                   <Calendar size={16} className="text-slate-400" />
                   <input
                     type="date"
                     value={filters.dateFrom}
                     onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
                     className="bg-transparent text-sm font-semibold text-[var(--color-blue)] outline-none"
                   />
                </div>

                <button 
                  onClick={loadOrders} 
                  disabled={loading}
                  className="site-button site-button-primary h-12 px-6"
                >
                  {loading ? "Searching..." : "Apply Filters"}
                </button>
             </div>
          </div>
        </div>

        {/* Batch Actions */}
        {selected.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl bg-[var(--color-blue)] p-4 text-white animate-in slide-in-from-top-4 duration-300 shadow-lg">
             <div className="flex items-center gap-4 ml-4">
                <CheckCircle2 className="text-[var(--color-orange)]" />
                <span className="font-bold">{selected.length} orders selected</span>
             </div>
             <button onClick={markSelectedPacked} className="site-button site-button-secondary bg-white text-[var(--color-blue)] mr-2">
                Mark as Packed
             </button>
          </div>
        )}

        {message ? (
          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 flex items-center gap-3 text-amber-700 text-sm font-semibold">
            <AlertCircle size={18} />
            {message}
          </div>
        ) : null}

        <div className="grid gap-6">
          {orders.map((order) => {
            const draft = drafts[order.id];
            const date = new Date(order.createdAtUtc);
            return (
              <div key={order.id} className="surface-card card-shadow overflow-hidden rounded-[2.5rem] border border-transparent transition-all hover:border-[var(--color-blue)]/10">
                <div className="flex flex-col lg:flex-row">
                  {/* Order Meta */}
                  <div className="w-full lg:w-80 bg-[var(--color-surface)] p-8 border-b lg:border-b-0 lg:border-r border-slate-200/60">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded-md border-slate-300 accent-[var(--color-blue)] cursor-pointer"
                        checked={selected.includes(order.id)}
                        onChange={(event) =>
                          setSelected((current) =>
                            event.target.checked
                              ? [...current, order.id]
                              : current.filter((value) => value !== order.id),
                          )
                        }
                      />
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-orange)]">
                        {order.orderCode}
                      </span>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-slate-400">
                            <Calendar size={18} />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Placed on</p>
                            <p className="mt-1 text-sm font-bold text-[var(--color-blue)]">
                              {date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                         </div>
                      </div>

                      <div className="flex items-center gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-slate-400">
                            <ShoppingBag size={18} />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Status</p>
                            <span className={`mt-1.5 inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusClass(order.status)}`}>
                              {order.status}
                            </span>
                         </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-200/60">
                         <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment</p>
                         <p className="mt-2 text-sm font-bold text-[var(--color-blue)]">{order.paymentMethod}</p>
                         <p className="mt-1 text-xs font-semibold text-emerald-600">{order.paymentStatus}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 p-8 grid gap-8 md:grid-cols-2">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                         <MapPin size={16} className="text-[var(--color-orange)]" />
                         <h3 className="font-bold text-[var(--color-blue)] uppercase tracking-wider text-xs">Shipping Destination</h3>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-5 space-y-1">
                        <p className="font-bold text-sm text-[var(--color-blue)]">{order.customerName ?? order.shippingAddress?.customerName}</p>
                        {shippingLines(order).slice(1).map((line, i) => (
                          <p key={i} className="text-xs font-medium text-slate-500 leading-relaxed">{line}</p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                         <PackageCheck size={16} className="text-[var(--color-orange)]" />
                         <h3 className="font-bold text-[var(--color-blue)] uppercase tracking-wider text-xs">Line Items</h3>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-semibold text-[var(--color-ink-soft)] bg-white border border-slate-200 px-3 py-2 rounded-xl flex-1">
                              {item.productName} <span className="text-[var(--color-orange)] ml-1">× {item.quantity}</span>
                            </span>
                            <span className="font-bold text-[var(--color-blue)]">Rs. {item.totalPriceInr}</span>
                          </div>
                        ))}
                        <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                          <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-widest">Grand Total</span>
                          <span className="text-lg font-black text-[var(--color-orange)]">Rs. {order.totalPriceInr}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="w-full lg:w-[440px] bg-slate-50/50 p-8 border-t lg:border-t-0 lg:border-l border-slate-200/60">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Update Status</label>
                        <select
                          value={draft?.status ?? order.status}
                          onChange={(event) => updateDraft(order, { status: event.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Courier</label>
                        <select
                          value={draft?.courierPartner ?? ""}
                          onChange={(event) => updateDraft(order, { courierPartner: event.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10"
                        >
                          <option value="">Select Partner</option>
                          {COURIERS.map((courier) => (
                            <option key={courier}>{courier}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Tracking ID</label>
                        <input
                          value={draft?.trackingNumber ?? ""}
                          onChange={(event) => updateDraft(order, { trackingNumber: event.target.value })}
                          placeholder="e.g. 12345678"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10 placeholder:text-slate-300"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Weight (kg)</label>
                        <input
                          value={draft?.packageWeightKg ?? ""}
                          onChange={(event) => updateDraft(order, { packageWeightKg: event.target.value })}
                          placeholder="0.5"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10 placeholder:text-slate-300"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Package Dimensions</label>
                        <input
                          value={draft?.packageDimensionsCm ?? ""}
                          onChange={(event) => updateDraft(order, { packageDimensionsCm: event.target.value })}
                          placeholder="Length x Width x Height (cm)"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-blue)] outline-none focus:ring-2 focus:ring-[var(--color-blue)]/10 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button 
                        onClick={() => saveOrder(order)} 
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-blue)] py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[var(--color-blue)]/90"
                      >
                        <Save size={16} />
                        Save Order
                      </button>
                      <button 
                        onClick={() => printShippingLabel(order)} 
                        className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-[var(--color-blue)] transition-all hover:bg-slate-50"
                      >
                        <Printer size={16} />
                        Print Label
                      </button>
                    </div>

                    {order.status === "Cancelled" && (
                       <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-2">
                          <p className="w-full text-[10px] font-black uppercase tracking-wider text-red-400 mb-1">Process Refund</p>
                          {REFUND_STATUSES.filter((status) => status !== "NotRequested").map((refundStatus) => (
                            <button
                              key={refundStatus}
                              onClick={async () => {
                                if (!token) return;
                                await browserApi.updateRefundStatus(token, order.id, { refundStatus });
                                await loadOrders();
                              }}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-700 hover:bg-red-100 transition-colors"
                            >
                              {refundStatus}
                            </button>
                          ))}
                       </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
