import type { ReactNode } from "react";
import { NoScriptFallback } from "@/components/site/no-script-fallback";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WhatsAppFloatingButton } from "@/components/site/whatsapp-floating-button";

export function StorefrontShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <NoScriptFallback />
      <main className="mobile-safe-bottom pb-4 md:pb-0">{children}</main>
      <SiteFooter />
      <WhatsAppFloatingButton />
    </div>
  );
}
