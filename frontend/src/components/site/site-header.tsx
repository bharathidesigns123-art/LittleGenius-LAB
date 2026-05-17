"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { SearchBar } from "@/components/site/search-bar";

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
      <header className="sticky top-0 z-40 border-b border-[rgba(18,52,88,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,246,234,0.92))] shadow-[0_12px_34px_rgba(18,52,88,0.08)] backdrop-blur">
        <div className="page-shell flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between md:py-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex flex-col">
              <span className="display-font text-xl font-semibold text-primary sm:text-[1.7rem]">
                LittleGenius LAB
              </span>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-brand-secondary sm:text-[0.72rem]">
                Design. Print. Play.
              </span>
            </Link>
            <Link
              href="/cart"
              className="nav-chip border border-border bg-white text-primary shadow-[0_10px_24px_rgba(18,52,88,0.1)] md:hidden"
            >
              Cart ({isClient ? itemCount : 0})
            </Link>
          </div>

          <div className="flex-1 md:mx-8">
            <SearchBar />
          </div>

          <nav className="hidden flex-wrap items-center gap-1 text-sm font-semibold md:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-chip ${isActive ? "nav-chip-active" : "nav-chip-idle"}`}
                >
                  {item.label}
                </Link>
              );
            })}
            {isClient && !loading && isAdmin ? (
              <Link
                href="/admin"
                className={`nav-chip ${pathname.startsWith("/admin") ? "nav-chip-active" : "nav-chip-idle"}`}
              >
                Admin
              </Link>
            ) : null}
          </nav>

          <div className="hidden flex-wrap items-center gap-3 md:flex">
            <Link
              href="/cart"
              className="nav-chip border border-border bg-white text-primary shadow-[0_10px_24px_rgba(18,52,88,0.1)]"
            >
              Cart ({isClient ? itemCount : 0})
            </Link>
            {!isClient || loading ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200" />
            ) : user ? (
              <>
                <Link
                  href="/account"
                  className="nav-chip nav-chip-active"
                >
                  {user.fullName.split(" ")[0]}
                </Link>
                <button
                  onClick={logout}
                  className="nav-chip border border-border bg-white text-[var(--color-blue)] shadow-[0_10px_24px_rgba(18,52,88,0.08)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="nav-chip border border-border bg-white text-[var(--color-blue)] shadow-[0_10px_24px_rgba(18,52,88,0.08)]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="nav-chip bg-[linear-gradient(135deg,#ff6b00,#ff8f1f_52%,#ffc933)] text-white shadow-[0_18px_38px_rgba(255,107,0,0.28)]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {!hideMobileNav ? (
        <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[1.4rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.96)] p-1.5 shadow-[0_24px_56px_rgba(18,52,88,0.18)] backdrop-blur md:hidden">
          <div className="grid grid-cols-6 gap-1 text-center text-[0.68rem] font-semibold leading-tight text-[var(--color-ink-soft)]">
            {mobileNavItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex min-h-12 items-center justify-center rounded-[1rem] px-1.5 py-2.5 transition-colors ${
                    isActive
                      ? "bg-[linear-gradient(135deg,#123458,#005b9a)] text-white shadow-[0_14px_28px_rgba(18,52,88,0.18)]"
                      : "text-[var(--color-ink-soft)] hover:bg-white"
                  }`}
                >
                  {item.href === "/cart" ? `Cart${isClient ? ` ${itemCount}` : ""}` : item.label}
                </Link>
              );
            })}
            <Link
              href={user ? "/account" : "/login"}
              className={`inline-flex min-h-12 items-center justify-center rounded-[1rem] px-1.5 py-2.5 transition-colors ${
                pathname === "/account" || pathname === "/login"
                  ? "bg-[linear-gradient(135deg,#123458,#005b9a)] text-white shadow-[0_14px_28px_rgba(18,52,88,0.18)]"
                  : "text-[var(--color-ink-soft)] hover:bg-white"
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
