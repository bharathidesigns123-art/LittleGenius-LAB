"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "littlegenius.cart.items";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const existing = window.localStorage.getItem(STORAGE_KEY);
    return existing ? (JSON.parse(existing) as CartItem[]) : [];
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.priceInr * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      addItem: (item, quantity = 1) => {
        setItems((current) => {
          const existing = current.find((entry) => entry.productId === item.productId);
          if (existing) {
            return current.map((entry) =>
              entry.productId === item.productId
                ? { ...entry, quantity: entry.quantity + quantity }
                : entry,
            );
          }
          return [...current, { ...item, quantity }];
        });
      },
      updateQuantity: (productId, quantity) => {
        setItems((current) =>
          current
            .map((item) =>
              item.productId === productId
                ? { ...item, quantity: Math.max(1, quantity) }
                : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      removeItem: (productId) => {
        setItems((current) => current.filter((item) => item.productId !== productId));
      },
      clearCart: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
