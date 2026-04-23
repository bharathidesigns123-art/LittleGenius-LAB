"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { browserApi } from "@/lib/browser-api";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<
    Array<{
      id: number;
      fullName: string;
      email: string;
      phone: string;
      role: string;
      isActive: boolean;
      createdAtUtc: string;
    }>
  >([]);

  useEffect(() => {
    if (!token) {
      return;
    }
    browserApi.getAdminUsers(token).then(setUsers).catch(() => undefined);
  }, [token]);

  return (
    <AdminShell title="Registered users">
      <div className="surface-card rounded-[2rem] p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-[var(--color-ink-soft)]">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-[var(--color-border)]">
                  <td className="py-4 font-semibold text-[var(--color-blue)]">{user.fullName}</td>
                  <td className="py-4">{user.email}</td>
                  <td className="py-4">{user.phone}</td>
                  <td className="py-4">{user.role}</td>
                  <td className="py-4">{new Date(user.createdAtUtc).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
