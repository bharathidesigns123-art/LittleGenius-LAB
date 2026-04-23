"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/custom-orders", label: "Custom Orders" },
  { href: "/admin/users", label: "Users" },
];

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isAuthenticated, isAdmin, logout, user } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [isAdmin, isAuthenticated, loading, router]);

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="page-shell py-20">
        <div className="surface-card card-shadow rounded-[2rem] px-6 py-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-orange)]">
            Admin Access
          </p>
          <h1 className="display-font mt-3 text-4xl font-semibold text-[var(--color-blue)]">
            Checking your admin session
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-8">
      <div className="dashboard-grid">
        <aside className="surface-card card-shadow rounded-[2rem] p-5">
          <p className="display-font text-2xl font-semibold text-[var(--color-blue)]">
            Admin Panel
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--color-ink-soft)]">
            Signed in as {user?.fullName}
          </p>
          <nav className="mt-6 flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                  pathname === link.href
                    ? "bg-[var(--color-blue)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-blue)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => {
              logout();
              router.replace("/admin/login");
            }}
            className="mt-6 w-full rounded-full border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--color-blue)]"
          >
            Logout
          </button>
        </aside>

        <section className="space-y-6">
          <div className="surface-card card-shadow rounded-[2rem] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
              Dashboard
            </p>
            <h1 className="display-font mt-2 text-4xl font-semibold text-[var(--color-blue)]">
              {title}
            </h1>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
