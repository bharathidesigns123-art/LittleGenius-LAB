"use client";

import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-shell flex min-h-[50vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="space-y-2">
        <h1 className="display-font text-3xl font-semibold text-[var(--color-blue)]">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-[var(--color-ink-soft)]">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "The page could not be loaded. If this keeps happening, try again later."}
        </p>
        {process.env.NODE_ENV === "development" && error.digest ? (
          <p className="font-mono text-xs text-[var(--color-ink-soft)]">Digest: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="site-button site-button-primary" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/" className="site-button site-button-secondary">
          Home
        </Link>
      </div>
    </div>
  );
}
