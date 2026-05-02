"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { browserApi } from "@/lib/browser-api";
import type { AdminUserRow } from "@/lib/types";

const ROLE_ADMIN = "Admin";
const ROLE_CUSTOMER = "Customer";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "createdDesc", label: "Newest first" },
  { value: "createdAsc", label: "Oldest first" },
  { value: "nameAsc", label: "Name A–Z" },
  { value: "nameDesc", label: "Name Z–A" },
  { value: "emailAsc", label: "Email A–Z" },
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function roleLabel(role: string): string {
  return role === ROLE_ADMIN ? "Admin" : "User";
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

function formFromUser(user: AdminUserRow): FormState {
  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? "",
    password: "",
    newPassword: "",
    role: user.role === ROLE_ADMIN ? ROLE_ADMIN : ROLE_CUSTOMER,
    isActive: user.isActive,
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
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const loadUsers = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await browserApi.getAdminUsers(token, {
        q: appliedSearch.trim() || undefined,
        page,
        pageSize,
        sort,
      });
      setUsers(Array.isArray(res.items) ? res.items : []);
      setTotal(typeof res.total === "number" ? res.total : 0);
    } catch (e) {
      setError(getErrorMessage(e));
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [token, page, pageSize, sort, appliedSearch]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const t = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setModalMode("add");
    setFormError(null);
  };

  const openEdit = (user: AdminUserRow) => {
    setForm(formFromUser(user));
    setEditingId(user.id);
    setModalMode("edit");
    setFormError(null);
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
  };

  const applySearch = () => {
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (modalMode === "add") {
        if (!form.password.trim()) {
          setFormError("Password is required for new users.");
          setSaving(false);
          return;
        }
        await browserApi.createAdminUser(token, {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          role: form.role,
          isActive: form.isActive,
        });
        setNotice("User created.");
      } else if (modalMode === "edit" && editingId != null) {
        await browserApi.updateAdminUser(token, editingId, {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          isActive: form.isActive,
          newPassword: form.newPassword.trim() ? form.newPassword.trim() : null,
        });
        setNotice("User updated.");
      }
      closeModal();
      await loadUsers();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleBlock = async (row: AdminUserRow) => {
    if (!token) {
      return;
    }
    setError(null);
    try {
      await browserApi.patchAdminUserStatus(token, row.id, !row.isActive);
      setNotice(row.isActive ? "User blocked." : "User unblocked.");
      await loadUsers();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const toggleRole = async (row: AdminUserRow) => {
    if (!token) {
      return;
    }
    const next = row.role === ROLE_ADMIN ? ROLE_CUSTOMER : ROLE_ADMIN;
    setError(null);
    try {
      await browserApi.patchAdminUserRole(token, row.id, next);
      setNotice(next === ROLE_ADMIN ? "Promoted to admin." : "Role set to user.");
      await loadUsers();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const confirmDelete = async () => {
    if (!token || !deleteTarget) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await browserApi.deleteAdminUser(token, deleteTarget.id);
      setNotice("User removed.");
      setDeleteTarget(null);
      if (users.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadUsers();
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell title="Registered users">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
              User management
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              Search, add, edit, block, change roles, or remove accounts. API enforces super-admin rules.
            </p>
          </div>
          <button type="button" onClick={openAdd} className="site-button site-button-primary w-full sm:w-auto">
            Add user
          </button>
        </div>

        {error ? (
          <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}
        {notice ? (
          <div className="rounded-[1.25rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</div>
        ) : null}

        <div className="surface-card rounded-[2rem] p-4 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
            <label className="flex min-w-[200px] flex-1 flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
              Search name or email
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                placeholder="e.g. ravi or @gmail"
                className="rounded-[1.25rem] border border-[var(--color-border)] px-4 py-2.5 font-normal outline-none"
              />
            </label>
            <button type="button" onClick={applySearch} className="site-button site-button-primary md:shrink-0">
              Search
            </button>
            <label className="flex min-w-[180px] flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
              Sort
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="rounded-[1.25rem] border border-[var(--color-border)] px-4 py-2.5 font-normal outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <p className="py-12 text-center text-sm text-[var(--color-ink-soft)]">Loading users…</p>
            ) : users.length === 0 ? (
              <p className="py-12 text-center text-sm font-medium text-[var(--color-ink-soft)]">
                No users found. Try another search or add a user.
              </p>
            ) : (
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead>
                  <tr className="text-[var(--color-ink-soft)]">
                    <th className="pb-3 pr-2">Name</th>
                    <th className="pb-3 pr-2">Email</th>
                    <th className="pb-3 pr-2">Phone</th>
                    <th className="pb-3 pr-2">Role</th>
                    <th className="pb-3 pr-2">Status</th>
                    <th className="pb-3 pr-2">Created</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((row) => (
                    <tr key={row.id} className="border-t border-[var(--color-border)] align-top">
                      <td className="py-3 pr-2 font-semibold text-[var(--color-blue)]">{row.fullName}</td>
                      <td className="py-3 pr-2 break-all">{row.email}</td>
                      <td className="py-3 pr-2 whitespace-nowrap">{row.phone || "—"}</td>
                      <td className="py-3 pr-2">{roleLabel(row.role)}</td>
                      <td className="py-3 pr-2 capitalize">
                        {row.status ?? (row.isActive ? "active" : "blocked")}
                      </td>
                      <td className="py-3 pr-2 whitespace-nowrap">
                        {new Date(row.createdAtUtc).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <div className="flex max-w-[280px] flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--color-blue)]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleBlock(row)}
                            className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--color-blue)]"
                          >
                            {row.isActive ? "Block" : "Unblock"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleRole(row)}
                            className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--color-blue)]"
                          >
                            {row.role === ROLE_ADMIN ? "Demote to user" : "Make admin"}
                          </button>
                          <button
                            type="button"
                            disabled={currentUser?.id === row.id}
                            onClick={() => setDeleteTarget(row)}
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && users.length > 0 ? (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4 text-sm sm:flex-row">
              <p className="text-[var(--color-ink-soft)]">
                Page {page} of {totalPages} · {total} user{total === 1 ? "" : "s"}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-blue)] disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-blue)] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {modalMode ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-modal-title"
          onClick={closeModal}
        >
          <div
            className="surface-card card-shadow max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2rem] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="user-modal-title" className="display-font text-xl font-semibold text-[var(--color-blue)]">
              {modalMode === "add" ? "Add user" : "Edit user"}
            </h2>
            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
                Full name
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="rounded-[1.25rem] border border-[var(--color-border)] px-4 py-2.5 font-normal outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="rounded-[1.25rem] border border-[var(--color-border)] px-4 py-2.5 font-normal outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
                Phone
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="rounded-[1.25rem] border border-[var(--color-border)] px-4 py-2.5 font-normal outline-none"
                />
              </label>
              {modalMode === "add" ? (
                <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
                  Password
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="rounded-[1.25rem] border border-[var(--color-border)] px-4 py-2.5 font-normal outline-none"
                  />
                </label>
              ) : (
                <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
                  New password (optional)
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.newPassword}
                    onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                    className="rounded-[1.25rem] border border-[var(--color-border)] px-4 py-2.5 font-normal outline-none"
                  />
                </label>
              )}
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
                Role
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      role: e.target.value === ROLE_ADMIN ? ROLE_ADMIN : ROLE_CUSTOMER,
                    }))
                  }
                  className="rounded-[1.25rem] border border-[var(--color-border)] px-4 py-2.5 font-normal outline-none"
                >
                  <option value={ROLE_CUSTOMER}>User</option>
                  <option value={ROLE_ADMIN}>Admin</option>
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-[var(--color-blue)]">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--color-border)]"
                />
                Active (not blocked)
              </label>
              {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-bold text-[var(--color-blue)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="site-button site-button-primary px-5 py-2.5 text-sm disabled:opacity-60"
                >
                  {saving ? "Saving…" : modalMode === "add" ? "Create user" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-user-title"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="surface-card card-shadow w-full max-w-sm rounded-[2rem] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-user-title" className="text-lg font-semibold text-[var(--color-blue)]">
              Delete user?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              Are you sure you want to delete <strong>{deleteTarget.fullName}</strong> ({deleteTarget.email})?
              This cannot be undone from the storefront.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-bold text-[var(--color-blue)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void confirmDelete()}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
