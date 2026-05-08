"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Palette, 
  Search, 
  Calendar, 
  Filter, 
  Printer, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  PackageCheck,
  User,
  MessageSquare,
  IndianRupee,
  Truck,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { resolveAssetUrl } from "@/lib/asset-url";
import { browserApi } from "@/lib/browser-api";
import { parseUtcDate } from "@/lib/date-time";
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
  if (status === "Delivered" || status === "Approved") return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-700/10";
  if (status === "Cancelled") return "bg-red-100 text-red-700 ring-1 ring-red-700/10";
  if (status === "Shipped" || status === "Quoted") return "bg-blue-100 text-blue-700 ring-1 ring-blue-700/10";
  if (status === "Printing" || status === "Reviewing") return "bg-amber-100 text-amber-700 ring-1 ring-amber-700/10";
  if (status === "Packed") return "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-700/10";
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-700/10";
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
    if (token) loadRequests();
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
    try {
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
      setMessage(`Saved reference ${request.referenceCode}.`);
      await loadRequests();
    } catch (err) { setMessage("Failed to save."); }
  };

  const markSelectedPacked = async () => {
    if (!token || selectedRequests.length === 0) return;
    try {
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
      setMessage("Marked packed.");
      await loadRequests();
    } catch (err) { setMessage("Action failed."); }
  };

  return (
    <AdminShell title="Custom Design Queue">
      <div className="space-y-6">
        {/* Filters */}
        <div className="surface-card card-shadow rounded-[2rem] p-4 sm:p-6">
           <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-0">
                 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input
                   value={filters.customer}
                   onChange={(e) => setFilters(c => ({ ...c, customer: e.target.value }))}
                   placeholder="Search reference, customer or phone..."
                   className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold text-[var(--color-blue)] outline-none"
                 />
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                 <select
                   value={filters.status}
                   onChange={(e) => setFilters(c => ({ ...c, status: e.target.value }))}
                   className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[var(--color-blue)]"
                 >
                    <option value="">All Statuses</option>
                    {CUSTOM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <button onClick={loadRequests} className="site-button site-button-primary h-12">Search</button>
              </div>
           </div>
        </div>

        {selected.length > 0 && (
           <div className="flex items-center justify-between rounded-2xl bg-[var(--color-blue)] p-4 text-white shadow-lg animate-in slide-in-from-top-4">
              <div className="flex items-center gap-3 ml-4">
                 <CheckCircle2 className="text-[var(--color-orange)]" />
                 <span className="font-black uppercase tracking-widest text-xs">{selected.length} Selected</span>
              </div>
              <button onClick={markSelectedPacked} className="site-button bg-white text-[var(--color-blue)] py-2">Batch Pack</button>
           </div>
        )}

        {message && (
          <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 flex items-center gap-3 text-amber-700 text-xs font-black uppercase tracking-wider">
             <AlertCircle size={16} /> {message}
          </div>
        )}

        <div className="grid gap-6">
           {requests.map((request) => {
              const draft = drafts[request.id] ?? makeDraft(request);
              const date = parseUtcDate(request.createdAtUtc);
              return (
                 <div key={request.id} className="surface-card card-shadow overflow-hidden rounded-[2.5rem] border border-transparent transition-all hover:border-[var(--color-blue)]/10 bg-white">
                    <div className="flex flex-col lg:flex-row">
                       {/* Meta Sidebar */}
                       <div className="w-full lg:w-80 bg-slate-50/80 p-8 border-b lg:border-b-0 lg:border-r border-slate-200/60">
                          <div className="flex items-center gap-3">
                             <input
                               type="checkbox"
                               className="h-5 w-5 rounded-md accent-[var(--color-blue)] cursor-pointer"
                               checked={selected.includes(request.id)}
                               onChange={(e) => setSelected(c => e.target.checked ? [...c, request.id] : c.filter(v => v !== request.id))}
                             />
                             <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-orange)]">{request.referenceCode}</span>
                          </div>

                          <div className="mt-8 space-y-5">
                             <div>
                                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Status</p>
                                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusClass(request.status)}`}>
                                   {request.status}
                                </span>
                             </div>

                             <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm text-slate-400"><Calendar size={18} /></div>
                                <div>
                                   <p className="text-xs font-black uppercase tracking-wide text-slate-400 leading-none">Created</p>
                                   <p className="mt-1 text-sm font-bold text-[var(--color-blue)]">{date?.toLocaleString("en-IN", { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' }) ?? ""}</p>
                                </div>
                             </div>

                             <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm text-slate-400"><IndianRupee size={18} /></div>
                                <div>
                                   <p className="text-xs font-black uppercase tracking-wide text-slate-400 leading-none">Quote</p>
                                   <p className="mt-1 text-sm font-black text-[var(--color-orange)]">
                                      {request.quoteAmountInr ? `Rs. ${request.quoteAmountInr}` : "PENDING"}
                                   </p>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Content Area */}
                       <div className="flex-1 p-8 grid gap-8 md:grid-cols-2">
                          <div className="text-left">
                             <div className="flex items-center gap-2 mb-4">
                                <User size={16} className="text-[var(--color-orange)]" />
                                <h3 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-blue)]">Requester</h3>
                             </div>
                             <div className="rounded-[1.5rem] bg-slate-50 p-5">
                                <p className="text-sm font-black text-[var(--color-blue)]">{request.name}</p>
                                <p className="mt-1 text-xs font-medium text-slate-500">{request.email}</p>
                                <p className="text-xs font-medium text-slate-500">{request.whatsAppNumber}</p>
                                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Pincode: {request.pincode || "-"}</p>
                             </div>

                             {request.photoUrl && (
                                <a 
                                   href={resolveAssetUrl(request.photoUrl)} 
                                   target="_blank" 
                                   className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[var(--color-blue)] transition-colors hover:text-[var(--color-orange)]"
                                >
                                   <ImageIcon size={14} /> View Reference Image <ExternalLink size={12} />
                                </a>
                             )}
                          </div>

                          <div className="text-left">
                             <div className="flex items-center gap-2 mb-4">
                                <MessageSquare size={16} className="text-[var(--color-orange)]" />
                                <h3 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-blue)]">Design Details</h3>
                             </div>
                             <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                                      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Occasion</p>
                                      <p className="text-xs font-bold text-[var(--color-blue)] truncate">{request.occasion || "Generic"}</p>
                                   </div>
                                   <div className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                                      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Color Preference</p>
                                      <p className="text-xs font-bold text-[var(--color-blue)] truncate">{request.colorPreference || "Default"}</p>
                                   </div>
                                </div>
                                <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)]/20">
                                   <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                                      "{request.characterDescription || request.baseMessage}"
                                   </p>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Action Sidebar */}
                       <div className="w-full lg:w-[460px] bg-slate-50/50 p-8 border-t lg:border-t-0 lg:border-l border-slate-200/60">
                          <div className="grid gap-3 sm:grid-cols-2">
                             <div className="space-y-1.5 text-left">
                                <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-400">Lifecycle Status</label>
                                <select
                                  value={draft.status}
                                  onChange={(e) => updateDraft(request, { status: e.target.value })}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-blue)] outline-none"
                                >
                                   {CUSTOM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                             </div>

                             <div className="space-y-1.5 text-left">
                                <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-400">Quote (Rs.)</label>
                                <input
                                  value={draft.quoteAmountInr}
                                  onChange={(e) => updateDraft(request, { quoteAmountInr: e.target.value })}
                                  placeholder="0.00"
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-[var(--color-orange)] outline-none"
                                />
                             </div>

                             <div className="space-y-1.5 text-left">
                                <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-400">Courier Partner</label>
                                <select
                                  value={draft.courierPartner}
                                  onChange={(e) => updateDraft(request, { courierPartner: e.target.value })}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-blue)] outline-none"
                                >
                                   <option value="">Select Courier</option>
                                   {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                             </div>

                             <div className="space-y-1.5 text-left">
                                <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-400">Tracking ID</label>
                                <input
                                  value={draft.trackingNumber}
                                  onChange={(e) => updateDraft(request, { trackingNumber: e.target.value })}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-blue)] outline-none"
                                />
                             </div>

                             <div className="sm:col-span-2 space-y-1.5 text-left">
                                <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-400">Internal Notes</label>
                                <textarea
                                  value={draft.adminNotes}
                                  onChange={(e) => updateDraft(request, { adminNotes: e.target.value })}
                                  placeholder="Private notes for team..."
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 outline-none min-h-[80px]"
                                />
                             </div>
                          </div>

                          <div className="mt-6 flex gap-3">
                             <button 
                                onClick={() => saveRequest(request)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-blue)] py-4 text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg transition-all hover:bg-[var(--color-blue)]/90"
                             >
                                <Save size={16} /> Save Record
                             </button>
                             <button className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-4 text-slate-400 hover:bg-slate-50 transition-all">
                                <Printer size={16} />
                             </button>
                          </div>
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
