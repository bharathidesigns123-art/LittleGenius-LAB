"use client";

import Link from "next/link";
import { useState } from "react";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { LoadingButtonContent } from "@/components/ui/loading-indicator";
import { browserApi } from "@/lib/browser-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await browserApi.forgotPassword({ email });
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StorefrontShell>
      <div className="page-shell py-10 sm:py-16">
        <div className="mx-auto max-w-xl surface-card card-shadow rounded-[2rem] p-5 sm:rounded-[2.5rem] sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
            Password help
          </p>
          <h1 className="display-font mt-3 text-3xl font-semibold text-[var(--color-blue)] sm:text-4xl">
            Reset your password
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
            Enter the email linked to your account and we&apos;ll send you a secure reset link.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            {error ? (
              <div className="rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}
            {message ? (
              <div className="rounded-[1.4rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>
            ) : null}
            <button
              disabled={loading}
              className="site-button site-button-primary w-full disabled:cursor-wait disabled:opacity-60"
            >
              <LoadingButtonContent loading={loading} loadingText="Sending reset link...">
                Send reset link
              </LoadingButtonContent>
            </button>
          </form>
          <p className="mt-5 text-sm text-[var(--color-ink-soft)]">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold text-[var(--color-blue)]">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </StorefrontShell>
  );
}
