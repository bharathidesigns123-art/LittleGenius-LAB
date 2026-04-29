"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { resolveAssetUrl } from "@/lib/asset-url";
import { browserApi } from "@/lib/browser-api";
import type { AdminCustomOrder } from "@/lib/types";

const CUSTOM_STATUSES = [
  "New",
  "Reviewing",
  "Quoted",
  "Approved",
  "Printing",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const REFUND_STATUSES = ["NotRequested", "Pending", "Approved", "Rejected"];
const COURIERS = ["India Post", "DTDC", "Delhivery", "Blue Dart", "Professional Courier", "Other"];

type Draft = {
  status: string;
  quoteAmountInr: string;
  adminNotes: string;
  trackingNumber: string;
  packageWeightKg: string;
  packageDimensionsCm: string;
  courierPartner: string;
  refundStatus: string;
  cancellationReason: string;
};

function statusClass(status: string) {
  if (status === "Delivered") return "status-pill status-pill-blue";
  if (status === "Cancelled") return "status-pill bg-red-50 text-red-700";
  if (status === "Shipped") return "status-pill bg-emerald-50 text-emerald-700";
  return "status-pill status-pill-yellow";
}

function makeDraft(request: AdminCustomOrder): Draft {
  return {
    status: request.status,
    quoteAmountInr: String(request.quoteAmountInr ?? ""),
    adminNotes: request.adminNotes ?? "",
    trackingNumber: request.trackingNumber ?? "",
    packageWeightKg: request.packageWeightKg?.toString() ?? "",
    packageDimensionsCm: request.packageDimensionsCm ?? "",
    courierPartner: request.courierPartner ?? "",
    refundStatus: request.refundStatus ?? "NotRequested",
    cancellationReason: request.cancellationReason ?? "",
  };
}

function printCustomLabel(request: AdminCustomOrder) {
  const label = window.open("", "_blank", "width=520,height=720");
  if (!label) return;

  const trackingNumber = request.trackingNumber || request.referenceCode;
  const barcodeBars = trackingNumber
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .split("")
    .map((char) => `<span style="width:${(char.charCodeAt(0) % 3) + 1}px"></span>`)
    .join("");
  const shipDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  label.document.write(`
    <html>
      <head>
        <title>Custom label ${request.referenceCode}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 18px; background: #1d1d1b; color: #f5f1e9; font-family: Arial, Helvetica, sans-serif; }
          .label { width: 600px; max-width: 100%; border: 2px solid #77746c; border-radius: 8px; background: #2e2f2c; overflow: hidden; }
          .topbar { display: flex; justify-content: space-between; gap: 16px; padding: 10px 16px; background: #1d1d34; border-bottom: 1px solid #3e3e39; font-weight: 800; }
          .topbar span:last-child { color: #c7c0b7; font-size: 12px; }
          .section { padding: 14px 16px; border-bottom: 1px dashed #5b5a54; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px dashed #5b5a54; }
          .grid .section { border-bottom: 0; }
          .grid .section:first-child { border-right: 1px dashed #5b5a54; }
          .mini-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 1px dashed #5b5a54; }
          .mini-grid div { padding: 12px 16px; text-align: center; }
          .mini-grid div + div { border-left: 1px solid #55544f; }
          .eyebrow { margin: 0 0 7px; color: #b7b4ad; font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
          .name { margin: 0 0 4px; color: #fff; font-size: 16px; font-weight: 800; }
          p { margin: 3px 0; color: #d4d0c8; font-size: 13px; line-height: 1.25; font-weight: 650; }
          strong { color: #fff; }
          .barcode-wrap { padding: 14px 16px 12px; text-align: center; border-bottom: 1px dashed #5b5a54; }
          .barcode { display: inline-flex; height: 48px; gap: 1px; padding: 0 4px; background: #fff; align-items: stretch; }
          .barcode span { display: block; background: #1d1d1b; }
          .tracking { margin-top: 7px; color: #fff; font-size: 17px; font-weight: 900; letter-spacing: .08em; }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="topbar"><span>CUSTOM SHIPPING LABEL</span><span>${request.status}</span></div>
          <div class="section">
            <p class="eyebrow">From (Sender)</p>
            <p class="name">LittleGenius LAB</p>
            <p>Chennai, Tamil Nadu</p>
            <p>India</p>
            <p>Phone: +91 63837 11863</p>
          </div>
          <div class="section">
            <p class="eyebrow">To (Recipient)</p>
            <p class="name">${request.name}</p>
            <p>Pincode: ${request.pincode || "Not provided"}</p>
            <p>India</p>
            <p>Phone: ${request.whatsAppNumber}</p>
            <p>Email: ${request.email}</p>
          </div>
          <div class="grid">
            <div class="section">
              <p class="eyebrow">Custom Details</p>
              <p><strong>Occasion:</strong> ${request.occasion || "-"}</p>
              <p><strong>Size:</strong> ${request.size || "-"}</p>
              <p><strong>Colour:</strong> ${request.colorPreference || "-"}</p>
              <p><strong>Request:</strong> ${request.characterDescription || request.baseMessage || "Custom toy request"}</p>
            </div>
            <div class="section">
              <p class="eyebrow">Shipment Info</p>
              <p><strong>Order ID:</strong> ${request.referenceCode}</p>
              <p><strong>Ship Date:</strong> ${shipDate}</p>
              <p><strong>Courier:</strong> ${request.courierPartner || "To assign"}</p>
              <p><strong>Weight:</strong> ${request.packageWeightKg || "-"} kg</p>
              <p><strong>Dimensions:</strong> ${request.packageDimensionsCm || "-"}</p>
            </div>
          </div>
          <div class="barcode-wrap">
            <p class="eyebrow">Tracking Number</p>
            <div class="barcode">${barcodeBars}</div>
            <div class="tracking">${trackingNumber}</div>
          </div>
          <div class="mini-grid">
            <div><p class="eyebrow">Declared Value</p><p><strong>Rs. ${request.quoteAmountInr ?? 0}</strong></p></div>
            <div><p class="eyebrow">Contents</p><p><strong>Custom toy</strong></p></div>
            <div><p class="eyebrow">Handling</p><p><strong>Handle with Care</strong></p></div>
          </div>
          <div class="section">
            <p class="eyebrow">Special Instructions</p>
            <p><strong>${request.adminNotes || "Keep dry. Deliver to recipient only."}</strong></p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `);
  label.document.close();
}

export default function AdminCustomOrdersPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<AdminCustomOrder[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [filters, setFilters] = useState({ status: "", dateFrom: "", dateTo: "", customer: "" });
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedRequests = useMemo(
    () => requests.filter((request) => selected.includes(request.id)),
    [requests, selected],
  );

  const seedDrafts = (result: AdminCustomOrder[]) =>
    setDrafts(Object.fromEntries(result.map((request) => [request.id, makeDraft(request)])));

  const loadRequests = async () => {
    if (!token) return;
    setLoading(true);
    setMessage("");
    try {
      const result = await browserApi.getAdminCustomOrders(token, filters);
      setRequests(result);
      seedDrafts(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load custom orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    let isActive = true;

    const hydrate = async () => {
      const result = await browserApi.getAdminCustomOrders(token);
      if (isActive) {
        setRequests(result);
        seedDrafts(result);
      }
    };
    void hydrate();

    return () => {
      isActive = false;
    };
  }, [token]);

  const updateDraft = (request: AdminCustomOrder, patch: Partial<Draft>) =>
    setDrafts((current) => ({
      ...current,
      [request.id]: {
        ...(current[request.id] ?? makeDraft(request)),
        ...patch,
      },
    }));

  const saveRequest = async (request: AdminCustomOrder) => {
    if (!token) return;
    const draft = drafts[request.id] ?? makeDraft(request);
    await browserApi.updateAdminCustomOrder(token, request.id, {
      status: draft.status,
      quoteAmountInr: draft.quoteAmountInr ? Number(draft.quoteAmountInr) : undefined,
      adminNotes: draft.adminNotes,
      trackingNumber: draft.trackingNumber,
      packageWeightKg: draft.packageWeightKg ? Number(draft.packageWeightKg) : null,
      packageDimensionsCm: draft.packageDimensionsCm,
      courierPartner: draft.courierPartner,
      refundStatus: draft.refundStatus,
      cancellationReason: draft.cancellationReason,
    });
    setMessage(`Saved ${request.referenceCode}.`);
    await loadRequests();
  };

  const markSelectedPacked = async () => {
    if (!token || selectedRequests.length === 0) return;
    await Promise.all(
      selectedRequests.map((request) =>
        browserApi.updateAdminCustomOrder(token, request.id, {
          status: "Packed",
          quoteAmountInr: request.quoteAmountInr ?? undefined,
          adminNotes: request.adminNotes ?? "",
          trackingNumber: request.trackingNumber ?? "",
          packageWeightKg: request.packageWeightKg ?? null,
          packageDimensionsCm: request.packageDimensionsCm ?? "",
          courierPartner: request.courierPartner ?? "",
          refundStatus: request.refundStatus ?? "NotRequested",
          cancellationReason: request.cancellationReason ?? "",
        }),
      ),
    );
    setSelected([]);
    setMessage("Selected custom orders marked packed.");
    await loadRequests();
  };

  return (
    <AdminShell title="Custom order queue">
      <div className="space-y-5">
        <div className="surface-card rounded-[1.5rem] p-4">
          <div className="grid gap-3 md:grid-cols-[160px_150px_150px_1fr_auto_auto]">
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
            >
              <option value="">All statuses</option>
              {CUSTOM_STATUSES.map((status) => (
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
              placeholder="Customer, phone, email, reference"
              className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
            />
            <button onClick={loadRequests} className="site-button site-button-primary">
              {loading ? "Loading..." : "Filter"}
            </button>
            <button onClick={markSelectedPacked} className="site-button site-button-secondary">
              Pack selected
            </button>
          </div>
          {message ? <p className="mt-3 text-sm font-semibold text-[var(--color-orange)]">{message}</p> : null}
        </div>

        {requests.map((request) => {
          const draft = drafts[request.id] ?? makeDraft(request);
          return (
            <div key={request.id} className="surface-card rounded-[1.5rem] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(request.id)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, request.id]
                            : current.filter((value) => value !== request.id),
                        )
                      }
                    />
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-orange)]">
                      {request.referenceCode}
                    </p>
                    <span className={statusClass(request.status)}>{request.status}</span>
                    <span className="status-pill status-pill-blue">{request.refundStatus ?? "NotRequested"}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-[var(--color-blue)]">
                    {request.name} | {request.size}
                  </h2>
                  <div className="mt-3 grid gap-4 text-sm text-[var(--color-ink-soft)] md:grid-cols-2">
                    <div>
                      <p className="font-bold text-[var(--color-blue)]">Customer</p>
                      <p>{request.email}</p>
                      <p>{request.whatsAppNumber}</p>
                      <p>Pincode: {request.pincode || "Not provided"}</p>
                      {request.photoUrl ? (
                        <a
                          href={resolveAssetUrl(request.photoUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block font-semibold text-[var(--color-blue)]"
                        >
                          Open uploaded image
                        </a>
                      ) : null}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--color-blue)]">Custom request</p>
                      <p>Occasion: {request.occasion || "-"}</p>
                      <p>Colour: {request.colorPreference || "-"}</p>
                      <p>Quote: {request.quoteAmountInr ? `Rs. ${request.quoteAmountInr}` : "Pending"}</p>
                      <p className="mt-2">{request.characterDescription || request.baseMessage}</p>
                    </div>
                  </div>
                </div>

                <div className="grid w-full gap-3 lg:w-[440px]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={draft.status}
                      onChange={(event) => updateDraft(request, { status: event.target.value })}
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    >
                      {CUSTOM_STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <select
                      value={draft.courierPartner}
                      onChange={(event) => updateDraft(request, { courierPartner: event.target.value })}
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    >
                      <option value="">Courier partner</option>
                      {COURIERS.map((courier) => (
                        <option key={courier}>{courier}</option>
                      ))}
                    </select>
                    <input
                      value={draft.quoteAmountInr}
                      onChange={(event) => updateDraft(request, { quoteAmountInr: event.target.value })}
                      placeholder="Quote amount"
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    />
                    <input
                      value={draft.trackingNumber}
                      onChange={(event) => updateDraft(request, { trackingNumber: event.target.value })}
                      placeholder="Tracking number"
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    />
                    <input
                      value={draft.packageWeightKg}
                      onChange={(event) => updateDraft(request, { packageWeightKg: event.target.value })}
                      placeholder="Weight kg"
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    />
                    <input
                      value={draft.packageDimensionsCm}
                      onChange={(event) => updateDraft(request, { packageDimensionsCm: event.target.value })}
                      placeholder="L x W x H cm"
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    />
                    <select
                      value={draft.refundStatus}
                      onChange={(event) => updateDraft(request, { refundStatus: event.target.value })}
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    >
                      {REFUND_STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <input
                      value={draft.cancellationReason}
                      onChange={(event) => updateDraft(request, { cancellationReason: event.target.value })}
                      placeholder="Cancellation reason"
                      className="rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none"
                    />
                    <textarea
                      value={draft.adminNotes}
                      onChange={(event) => updateDraft(request, { adminNotes: event.target.value })}
                      placeholder="Admin notes"
                      className="min-h-24 rounded-[0.9rem] border border-[var(--color-border)] px-3 py-2 outline-none sm:col-span-2"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => saveRequest(request)} className="site-button site-button-primary">
                      Save
                    </button>
                    <button onClick={() => printCustomLabel(request)} className="site-button site-button-secondary">
                      Print label
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
