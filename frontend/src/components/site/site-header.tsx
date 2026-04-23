"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";

const navItems = [
  { href: "/shop", label: "Shop" },
  { href: "/custom-order", label: "Custom Orders" },
  { href: "/gallery", label: "Gallery" },
  { href: "/how-it-works", label: "How It Works" },
];

const emptySubscribe = () => () => undefined;

export function SiteHeader() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user, isAdmin, logout, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[rgba(253,251,247,0.9)] backdrop-blur">
      <div className="page-shell flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex flex-col">
            <span className="display-font text-2xl font-semibold text-[var(--color-blue)]">
              LittleGenius LAB
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-soft)]">
              Design. Print. Play.
            </span>
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-bold text-[var(--color-blue)] md:hidden"
          >
            Cart ({isClient ? itemCount : 0})
          </Link>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--color-ink-soft)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "text-[var(--color-blue)]" : undefined}
            >
              {item.label}
            </Link>
          ))}
          {isClient && !loading && isAdmin ? <Link href="/admin">Admin</Link> : null}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/cart"
            className="hidden rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-bold text-[var(--color-blue)] md:inline-flex"
          >
            Cart ({isClient ? itemCount : 0})
          </Link>
          {!isClient || loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200" />
          ) : user ? (
            <>
              <Link
                href="/account"
                className="rounded-full bg-[var(--color-blue)] px-4 py-2 text-sm font-bold text-white"
              >
                {user.fullName.split(" ")[0]}
              </Link>
              <button
                onClick={logout}
                className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-bold text-[var(--color-blue)]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-bold text-[var(--color-blue)]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[var(--color-orange)] px-4 py-2 text-sm font-bold text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
