"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Shield, 
  User as UserIcon, 
  Ban, 
  Trash2, 
  Edit3,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { browserApi } from "@/lib/browser-api";
import { formatUtcDate } from "@/lib/date-time";
import type { AdminUserRow } from "@/lib/types";

const ROLE_ADMIN = "Admin";
const ROLE_CUSTOMER = "Customer";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "createdDesc", label: "Newest First" },
  { value: "createdAsc", label: "Oldest First" },
  { value: "nameAsc", label: "Name A–Z" },
  { value: "nameDesc", label: "Name Z–A" },
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  newPassword: string;
  role: typeof ROLE_ADMIN | typeof ROLE_CUSTOMER;
  isActive: boolean;
};

function emptyForm(): FormState {
  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    newPassword: "",
    role: ROLE_CUSTOMER,
    isActive: true,
  };
}

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [sort, setSort] = useState("createdDesc");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await browserApi.getAdminUsers(token, {
        q: appliedSearch.trim() || undefined,
        page,
        pageSize,
        sort,
      });
      setUsers(res.items || []);
      setTotal(res.total || 0);
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [token, page, pageSize, sort, appliedSearch]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError(null);
    try {
      if (modalMode === "add") {
        await browserApi.createAdminUser(token, { ...form, fullName: form.fullName.trim(), email: form.email.trim() });
        setNotice("Account created.");
      } else if (modalMode === "edit" && editingId != null) {
        await browserApi.updateAdminUser(token, editingId, { 
          ...form, 
          newPassword: form.newPassword.trim() || null 
        });
        setNotice("Profile updated.");
      }
      setModalMode(null);
      await loadUsers();
    } catch (err) { setFormError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const toggleBlock = async (row: AdminUserRow) => {
    if (!token) return;
    try {
      await browserApi.patchAdminUserStatus(token, row.id, !row.isActive);
      setNotice(row.isActive ? "Access restricted." : "Access restored.");
      await loadUsers();
    } catch (e) { setError(getErrorMessage(e)); }
  };

  return (
    <AdminShell title="User Management">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="surface-card card-shadow flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-4 sm:gap-6 sm:p-6">
           <div className="flex flex-1 flex-wrap items-center gap-3 sm:gap-4">
              <div className="relative flex-1">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && setAppliedSearch(searchInput)}
                    placeholder="Search name, email or phone..." 
                    className="h-12 w-full rounded-xl bg-slate-50 pl-12 pr-4 text-sm font-bold text-[var(--color-blue)] outline-none border border-slate-100 focus:ring-2 focus:ring-[var(--color-blue)]/10"
                 />
              </div>
              <select 
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-12 rounded-xl border border-slate-100 bg-white px-4 text-sm font-bold text-[var(--color-blue)] outline-none shadow-sm"
              >
                 {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
           </div>
           
           <button 
             onClick={() => { setForm(emptyForm()); setModalMode("add"); }}
             className="site-button site-button-primary h-12 px-6 flex items-center gap-2"
           >
              <UserPlus size={18} /> Add New User
           </button>
        </div>

        {notice && (
          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 flex items-center gap-3 text-emerald-700 text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-left-4">
             <CheckCircle2 size={16} /> {notice}
          </div>
        )}

        {/* Users List */}
        <div className="surface-card card-shadow overflow-hidden rounded-[2.5rem] bg-white">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                       <th className="px-6 py-5 text-xs font-black uppercase tracking-wide text-slate-400 sm:px-8">User Identity</th>
                       <th className="px-6 py-5 text-xs font-black uppercase tracking-wide text-slate-400 sm:px-8">Access Role</th>
                       <th className="px-6 py-5 text-xs font-black uppercase tracking-wide text-slate-400 sm:px-8">Activity Status</th>
                       <th className="px-6 py-5 text-right text-xs font-black uppercase tracking-wide text-slate-400 sm:px-8">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {loading ? (
                       <tr><td colSpan={4} className="px-8 py-20 text-center"><div className="flex flex-col items-center gap-3 text-slate-400"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-blue)]" /><span className="text-xs font-bold uppercase tracking-widest">Retrieving Directory...</span></div></td></tr>
                    ) : users.map((u) => (
                       <tr key={u.id} className="group transition-colors hover:bg-slate-50/50">
                          <td className="px-6 py-5 sm:px-8">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[var(--color-surface)] text-[var(--color-blue)] font-black text-lg">
                                   {u.fullName[0]}
                                </div>
                                <div className="text-left">
                                   <p className="text-sm font-black text-[var(--color-blue)]">{u.fullName}</p>
                                   <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                                      <span className="flex items-center gap-1"><Mail size={10} /> {u.email}</span>
                                      {u.phone && <span className="flex items-center gap-1"><Phone size={10} /> {u.phone}</span>}
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5 sm:px-8">
                             <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${u.role === ROLE_ADMIN ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                                {u.role === ROLE_ADMIN ? <Shield size={10} /> : <UserIcon size={10} />}
                                {u.role}
                             </span>
                          </td>
                          <td className="px-6 py-5 text-left sm:px-8">
                             <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${u.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500"}`} />
                                <span className={`text-xs font-black uppercase tracking-wide ${u.isActive ? "text-emerald-600" : "text-red-600"}`}>
                                   {u.isActive ? "Authorized" : "Restricted"}
                                </span>
                             </div>
                             <p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Joined {formatUtcDate(u.createdAtUtc)}</p>
                          </td>
                          <td className="px-6 py-5 text-right sm:px-8">
                             <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => { 
                                    setForm({ 
                                      fullName: u.fullName,
                                      email: u.email,
                                      phone: u.phone ?? "",
                                      password: "",
                                      newPassword: "",
                                      role: u.role as typeof ROLE_ADMIN | typeof ROLE_CUSTOMER,
                                      isActive: u.isActive
                                    }); 
                                    setEditingId(u.id); 
                                    setModalMode("edit"); 
                                  }}
                                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:border-[var(--color-blue)] hover:bg-[var(--color-blue)] hover:text-white"
                                >
                                   <Edit3 size={16} />
                                </button>
                                <button 
                                  onClick={() => toggleBlock(u)}
                                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${u.isActive ? "border-slate-200 bg-white text-slate-400 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600" : "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"}`}
                                >
                                   {u.isActive ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                                </button>
                                <button 
                                  disabled={currentUser?.id === u.id}
                                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white disabled:opacity-30"
                                >
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* Pagination */}
           <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                 Directory Record <span className="text-[var(--color-blue)] mx-1">{users.length} of {total}</span>
              </p>
              <div className="flex gap-2">
                 <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={18} /></button>
                 <div className="h-10 px-4 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-xs font-black text-[var(--color-blue)]">{page} / {totalPages}</div>
                 <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={18} /></button>
              </div>
           </div>
        </div>
      </div>

      {/* Modal */}
      {modalMode && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-blue)]/60 backdrop-blur-md p-4" onClick={() => setModalMode(null)}>
            <div className="surface-card card-shadow w-full max-w-lg rounded-[2.5rem] bg-white p-10 overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
               <button onClick={() => setModalMode(null)} className="absolute right-8 top-8 text-slate-300 hover:text-slate-600 transition-colors"><X size={24} /></button>
               
               <h2 className="display-font text-3xl font-black text-[var(--color-blue)] uppercase tracking-tight">
                  {modalMode === 'add' ? 'Initiate Account' : 'Edit Credentials'}
               </h2>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Security & Identity Management</p>

               <form onSubmit={handleFormSubmit} className="mt-10 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2 text-left">
                     <div className="space-y-1.5 text-left">
                        <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-400">Legal Full Name</label>
                        <input required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none" />
                     </div>
                     <div className="space-y-1.5 text-left">
                        <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-400">Email Address</label>
                        <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none" />
                     </div>
                     <div className="space-y-1.5 text-left">
                        <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-400">Phone (WhatsApp)</label>
                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none" />
                     </div>
                     <div className="space-y-1.5 text-left">
                        <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-400">System Role</label>
                        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none">
                           <option value={ROLE_CUSTOMER}>Standard User</option>
                           <option value={ROLE_ADMIN}>Platform Admin</option>
                        </select>
                     </div>
                  </div>

                  {modalMode === 'add' ? (
                     <div className="space-y-1.5 text-left">
                        <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-400">Initial Password</label>
                        <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none" />
                     </div>
                  ) : (
                     <div className="space-y-1.5 text-left">
                        <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-400">Reset Password (Optional)</label>
                        <input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Leave blank to keep current" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-[var(--color-blue)] outline-none" />
                     </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer group text-left">
                    <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${form.isActive ? 'bg-[var(--color-blue)] border-[var(--color-blue)]' : 'border-slate-300'}`}>
                       {form.isActive && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                    <span className="text-xs font-black uppercase tracking-widest text-[var(--color-blue)]">Authorized access enabled</span>
                  </label>

                  {formError && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{formError}</p>}

                  <div className="pt-4 flex gap-4">
                     <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-[var(--color-blue)] py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[var(--color-blue)]/20 transition-all hover:bg-[var(--color-blue)]/90">
                        {saving ? 'Processing...' : 'Authorize Records'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </AdminShell>
  );
}
