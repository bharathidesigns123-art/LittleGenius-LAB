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
  { href: "/how-it-works", label: "How It Works" },
];

const mobileNavItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/orders", label: "Orders" },
  { href: "/custom-order", label: "Custom" },
  { href: "/cart", label: "Cart" },
];

const emptySubscribe = () => () => undefined;

export function SiteHeader() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user, isAdmin, logout, loading } = useAuth();
  const hideMobileNav = pathname.startsWith("/checkout");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="page-shell flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex flex-col">
              <span className="display-font text-xl font-semibold text-primary sm:text-2xl">
                LittleGenius LAB
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink-soft sm:text-xs sm:tracking-[0.24em]">
                Design. Print. Play.
              </span>
            </Link>
            <Link
              href="/cart"
              className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-bold text-primary md:hidden"
            >
              Cart ({isClient ? itemCount : 0})
            </Link>
          </div>

          <nav className="hidden flex-wrap items-center gap-1 text-sm font-semibold md:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-ink-soft hover:bg-border/30 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {isClient && !loading && isAdmin ? (
              <Link
                href="/admin"
                className={`rounded-full px-4 py-2 transition-all ${
                  pathname.startsWith("/admin")
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink-soft hover:bg-border/30 hover:text-primary"
                }`}
              >
                Admin
              </Link>
            ) : null}
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
                  className="rounded-full border border-(--color-border) bg-white px-4 py-2 text-sm font-bold text-(--color-blue)"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-(--color-border) bg-white px-4 py-2 text-sm font-bold text-(--color-blue)"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-(--color-orange) px-4 py-2 text-sm font-bold text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {!hideMobileNav ? (
        <nav className="fixed inset-x-2 bottom-2 z-40 rounded-2xl border border-(--color-border) bg-white/95 p-1.5 shadow-lg backdrop-blur md:hidden">
          <div className="grid grid-cols-6 gap-1 text-center text-[0.7rem] font-semibold leading-tight text-(--color-ink-soft)">
            {mobileNavItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl px-1.5 py-2 transition-colors ${
                    isActive
                      ? "bg-(--color-blue)/10 text-(--color-blue)"
                      : "text-(--color-ink-soft) hover:bg-slate-100"
                  }`}
                >
                  {item.href === "/cart" ? `Cart${isClient ? ` ${itemCount}` : ""}` : item.label}
                </Link>
              );
            })}
            <Link
              href={user ? "/account" : "/login"}
              className={`inline-flex min-h-11 items-center justify-center rounded-xl px-1.5 py-2 transition-colors ${
                pathname === "/account" || pathname === "/login"
                  ? "bg-(--color-blue)/10 text-(--color-blue)"
                  : "text-(--color-ink-soft) hover:bg-slate-100"
              }`}
            >
              {user ? "You" : "Login"}
            </Link>
          </div>
        </nav>
      ) : null}
    </>
  );
}
