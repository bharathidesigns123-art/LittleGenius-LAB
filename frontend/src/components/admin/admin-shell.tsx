"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingBag, 
  Palette, 
  Users, 
  LogOut,
  ChevronRight,
  User,
  Menu,
  X,
  Bell,
  Search
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { PageLoader } from "@/components/ui/loading-indicator";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/custom-orders", label: "Custom Orders", icon: Palette },
  { href: "/admin/users", label: "Users", icon: Users },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [isAdmin, isAuthenticated, loading, router]);

  // Close mobile menu on route change
  useEffect(() => {
    const timeout = window.setTimeout(() => setIsMobileMenuOpen(false), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fffdf4_0%,#f4fbff_100%)]">
        <PageLoader title="Authenticating admin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fffdf4_0%,#f4fbff_100%)]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 flex-col bg-[linear-gradient(180deg,#155eb5_0%,#1772d0_48%,#0f4f9d_100%)] text-white shadow-xl lg:flex">
        <div className="p-8">
          <Link href="/" className="flex flex-col">
            <span className="display-font text-2xl font-bold text-white">
              LittleGenius
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffed9c]">
              Admin Dashboard
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-white/68 hover:bg-white/6 hover:text-white"
                }`}
              >
                <Icon size={20} className={isActive ? "text-[var(--color-orange)]" : "text-white/40 group-hover:text-white/60"} />
                {link.label}
                {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ffed9c] shadow-[0_0_10px_rgba(255,237,156,0.9)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-6">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
              <User size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{user?.fullName}</p>
              <p className="truncate text-xs text-white/50">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace("/admin/login");
            }}
            className="mt-6 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#ffb5bf] transition-colors hover:bg-white/8"
          >
            <LogOut size={18} />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Mobile Menu Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[min(86vw,20rem)] transform bg-[linear-gradient(180deg,#155eb5_0%,#1772d0_48%,#0f4f9d_100%)] text-white transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-6">
          <span className="display-font text-xl font-bold">LittleGenius</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-2 text-white/70 hover:bg-white/10">
            <X size={24} />
          </button>
        </div>
        <nav className="space-y-1 px-4 pb-6">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold ${
                  isActive ? "bg-white/12 text-white" : "text-white/68"
                }`}
              >
                <Icon size={20} className={isActive ? "text-[var(--color-orange)]" : "text-white/40"} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[rgba(21,94,181,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,250,239,0.96))] px-4 sm:h-20 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg p-2.5 text-[var(--color-ink-soft)] hover:bg-[rgba(21,94,181,0.08)] lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="display-font text-xl font-bold text-[var(--color-blue)] sm:text-2xl">
                {title}
              </h1>
              <div className="mt-0.5 hidden items-center gap-2 text-xs font-bold uppercase tracking-wide text-[rgba(21,94,181,0.46)] sm:flex">
                <Link href="/admin">Dashboard</Link>
                {pathname !== "/admin" && (
                  <>
                    <ChevronRight size={10} />
                    <span className="text-[var(--color-orange)]">{title}</span>
                  </>
                )}
              </div>
            </div>
          </div>

           <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
             <div className="relative mr-0 hidden md:flex lg:mr-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(21,94,181,0.45)]" />
                <input 
                   type="text" 
                   placeholder="Search..." 
                 className="h-10 w-56 rounded-xl border border-[var(--color-border)] bg-[rgba(255,247,222,0.65)] pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-blue)]/20 lg:w-64"
                />
             </div>
             <button className="relative rounded-xl border border-[var(--color-border)] bg-[rgba(255,247,222,0.72)] p-2.5 text-[var(--color-blue)] hover:bg-[rgba(255,237,156,0.72)]">
                <Bell size={20} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
             </button>
             <Link 
                href="/account" 
               className="hidden h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#ef314d,#f76a2e,#ffbe1a)] text-white shadow-lg shadow-[rgba(244,67,54,0.22)] sm:flex"
             >
                <User size={20} />
             </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
          <main className="custom-scrollbar flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
           <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
