"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const MAX_VISIBLE_MS = 8000;

function isPlainInternalNavigation(event: MouseEvent, anchor: HTMLAnchorElement) {
  if (event.defaultPrevented || event.button !== 0) {
    return false;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  if (anchor.target && anchor.target !== "_self") {
    return false;
  }

  if (anchor.hasAttribute("download")) {
    return false;
  }

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) {
    return false;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const nextPath = `${url.pathname}${url.search}`;
  return currentPath !== nextPath;
}

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!anchor || !isPlainInternalNavigation(event, anchor)) {
        return;
      }

      setIsPending(true);
      setProgress(18);
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(current + Math.max(2, (92 - current) * 0.18), 92));
    }, 240);

    timeoutRef.current = window.setTimeout(() => {
      setIsPending(false);
      setProgress(0);
    }, MAX_VISIBLE_MS);

    return () => {
      window.clearInterval(interval);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [isPending]);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const completeTimeout = window.setTimeout(() => {
      setProgress(100);
    }, 0);
    const hideTimeout = window.setTimeout(() => {
      setIsPending(false);
      setProgress(0);
    }, 280);

    return () => {
      window.clearTimeout(completeTimeout);
      window.clearTimeout(hideTimeout);
    };
  }, [pathname, isPending]);

  return (
    <>
      {children}
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 transition-opacity duration-200 ${
          isPending ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isPending}
      >
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary shadow-[0_0_18px_rgba(6,182,212,0.45)] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isPending ? "Loading page" : ""}
      </div>
    </>
  );
}
