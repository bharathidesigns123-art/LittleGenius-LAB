import Link from "next/link";
import { defaultWhatsAppUrl } from "@/lib/commerce-content";

export function NoScriptFallback() {
  return (
    <noscript>
      <section className="border-b border-[var(--color-border)] bg-white">
        <div className="page-shell grid gap-4 py-4 text-sm leading-6 text-[var(--color-ink-soft)] md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-semibold text-[var(--color-blue)]">JavaScript is turned off.</p>
            <p>
              You can still browse products, read delivery details, and contact LittleGenius LAB.
              Cart and checkout actions need JavaScript.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/shop" className="site-button site-button-secondary !min-h-10 !px-4 !py-2">
              Browse products
            </Link>
            <a href={defaultWhatsAppUrl} className="site-button site-button-primary !min-h-10 !px-4 !py-2">
              WhatsApp support
            </a>
          </div>
        </div>
      </section>
    </noscript>
  );
}
