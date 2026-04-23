"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { resolveAssetUrl } from "@/lib/asset-url";
import { browserApi } from "@/lib/browser-api";
import type { AdminCustomOrder } from "@/lib/types";

export default function AdminCustomOrdersPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<AdminCustomOrder[]>([]);
  const [drafts, setDrafts] = useState<
    Record<number, { status: string; quoteAmountInr: string; adminNotes: string }>
  >({});

  const loadRequests = async () => {
    if (!token) {
      return;
    }
    const result = await browserApi.getAdminCustomOrders(token);
    setRequests(result);
    setDrafts(
      Object.fromEntries(
        result.map((request) => [
          request.id,
          {
            status: request.status,
            quoteAmountInr: String(request.quoteAmountInr ?? ""),
            adminNotes: request.adminNotes ?? "",
          },
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
      const result = await browserApi.getAdminCustomOrders(token);
      if (isActive) {
        setRequests(result);
        setDrafts(
          Object.fromEntries(
            result.map((request) => [
              request.id,
              {
                status: request.status,
                quoteAmountInr: String(request.quoteAmountInr ?? ""),
                adminNotes: request.adminNotes ?? "",
              },
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
    <AdminShell title="Custom order queue">
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="surface-card rounded-[2rem] p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
                  {request.referenceCode}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--color-blue)]">
                  {request.name} · {request.size}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                  {request.occasion} · {request.colorPreference}
                </p>
                {request.photoUrl ? (
                  <a
                    href={resolveAssetUrl(request.photoUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-[var(--color-blue)]"
                  >
                    Open uploaded image
                  </a>
                ) : null}
              </div>
              <div className="grid gap-3 md:w-[360px]">
                <select
                  value={drafts[request.id]?.status ?? request.status}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [request.id]: {
                        ...current[request.id],
                        status: event.target.value,
                      },
                    }))
                  }
                  className="rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                >
                  {["New", "Reviewing", "Quoted", "Approved", "Printing", "Delivered"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
                <input
                  value={drafts[request.id]?.quoteAmountInr ?? ""}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [request.id]: {
                        ...current[request.id],
                        quoteAmountInr: event.target.value,
                      },
                    }))
                  }
                  placeholder="Quote amount"
                  className="rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
                <textarea
                  value={drafts[request.id]?.adminNotes ?? ""}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [request.id]: {
                        ...current[request.id],
                        adminNotes: event.target.value,
                      },
                    }))
                  }
                  placeholder="Admin notes"
                  className="min-h-28 rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
                <button
                  onClick={async () => {
                    if (!token) {
                      return;
                    }
                    await browserApi.updateAdminCustomOrder(token, request.id, {
                      status: drafts[request.id]?.status ?? request.status,
                      quoteAmountInr: drafts[request.id]?.quoteAmountInr
                        ? Number(drafts[request.id].quoteAmountInr)
                        : undefined,
                      adminNotes: drafts[request.id]?.adminNotes,
                    });
                    await loadRequests();
                  }}
                  className="site-button site-button-primary"
                >
                  Save
                </button>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
              {request.characterDescription}
            </p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
