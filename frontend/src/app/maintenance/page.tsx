import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Under Maintenance | LittleGenius LAB",
  description:
    "LittleGenius LAB is currently under maintenance or development. Please check back soon.",
};

export default function MaintenancePage() {
  return (
    <main className="page-shell py-16 sm:py-24">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--color-border)] bg-white/95 p-8 shadow-[0_32px_80px_rgba(43,56,88,0.12)] backdrop-blur-sm sm:p-12">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-orange)]">
            Under maintenance
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-blue)] sm:text-5xl">
            We&apos;re making improvements.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--color-ink-soft)] sm:text-lg">
            LittleGenius LAB is currently under maintenance or development. We&apos;re working to make the site better and will be back shortly.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-[1fr_1fr]">
          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left">
            <h2 className="text-xl font-semibold text-[var(--color-blue)]">What this means</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
              Customers will see this message until maintenance mode is disabled. Your order information and backend services remain protected while we refresh the storefront.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left">
            <h2 className="text-xl font-semibold text-[var(--color-blue)]">Need help?</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
              If you need to contact us, email hello@littlegeniuslab.in or send a WhatsApp message. We&apos;ll respond as soon as possible.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/" className="site-button site-button-secondary">
            Return to homepage
          </Link>
          <a
            href="https://wa.me/917297121898"
            className="site-button site-button-primary"
          >
            Contact via WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
