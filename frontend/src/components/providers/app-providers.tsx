"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { RouteTransitionProvider } from "@/components/providers/route-transition-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <RouteTransitionProvider>{children}</RouteTransitionProvider>
      </CartProvider>
    </AuthProvider>
  );
}
