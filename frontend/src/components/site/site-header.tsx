"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";

const navItems = [
  { href: "/shop", label: "Shop" },
  { href: "/orders", label: "Orders" },
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
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="page-shell flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex flex-col">
              <span className="display-font text-2xl font-semibold text-primary">
                LittleGenius LAB
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-soft">
                Design. Print. Play.
              </span>
            </Link>
            <Link
              href="/cart"
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-primary md:hidden"
            >
              Cart ({isClient ? itemCount : 0})
            </Link>
          </div>

          <nav className="hidden flex-wrap items-center gap-3 text-sm font-semibold text-ink-soft md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "text-primary" : "text-ink-soft"}
              >
                {item.label}
              </Link>
            ))}
            {isClient && !loading && isAdmin ? <Link href="/admin">Admin</Link> : null}
          </nav>

          <div className="hidden flex-wrap items-center gap-3 md:flex">
            <Link
              href="/cart"
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-primary"
            >
              Cart ({isClient ? itemCount : 0})
            </Link>
            {!isClient || loading ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200" />
            ) : user ? (
              <>
                <Link
                  href="/account"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white"
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

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-[var(--color-border)] bg-white/95 p-2 shadow-lg backdrop-blur md:hidden">
        <div className="grid grid-cols-6 text-center text-[0.65rem] font-semibold leading-tight text-[var(--color-ink-soft)] sm:text-xs">
          <Link href="/" className={pathname === "/" ? "text-[var(--color-blue)]" : ""}>
            Home
          </Link>
          <Link href="/shop" className={pathname.startsWith("/shop") ? "text-[var(--color-blue)]" : ""}>
            Shop
          </Link>
          <Link href="/orders" className={pathname === "/orders" ? "text-[var(--color-blue)]" : ""}>
            Orders
          </Link>
          <Link href="/custom-order" className={pathname === "/custom-order" ? "text-[var(--color-blue)]" : ""}>
            Custom
          </Link>
          <Link href="/cart" className={pathname === "/cart" ? "text-[var(--color-blue)]" : ""}>
            Cart{isClient ? ` ${itemCount}` : ""}
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            className={pathname === "/account" || pathname === "/login" ? "text-[var(--color-blue)]" : ""}
          >
            {user ? "You" : "Login"}
          </Link>
        </div>
      </nav>
    </>
  );
}
