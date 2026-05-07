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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <PageLoader title="Authenticating admin" message="Checking dashboard access..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-[var(--color-blue)] text-white shadow-xl">
        <div className="p-8">
          <Link href="/" className="flex flex-col">
            <span className="display-font text-2xl font-bold text-white">
              LittleGenius
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-orange)]">
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
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} className={isActive ? "text-[var(--color-orange)]" : "text-white/40 group-hover:text-white/60"} />
                {link.label}
                {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-orange)] shadow-[0_0_8px_var(--color-orange)]" />}
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
            className="mt-6 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-400/10"
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-[var(--color-blue)] text-white transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-8">
          <span className="display-font text-xl font-bold">LittleGenius</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60">
            <X size={24} />
          </button>
        </div>
        <nav className="space-y-1 px-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold ${
                  isActive ? "bg-white/10 text-white" : "text-white/60"
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
      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="display-font text-2xl font-bold text-[var(--color-blue)]">
                {title}
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
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

          <div className="flex items-center gap-4">
             <div className="hidden md:flex relative mr-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                   type="text" 
                   placeholder="Search..." 
                   className="h-10 w-64 rounded-xl bg-slate-100 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-blue)]/20"
                />
             </div>
             <button className="relative rounded-xl bg-slate-100 p-2.5 text-slate-600 hover:bg-slate-200">
                <Bell size={20} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
             </button>
             <Link 
                href="/account" 
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-orange)] text-white shadow-lg shadow-[var(--color-orange)]/20"
             >
                <User size={20} />
             </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
