"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { LoadingButtonContent } from "@/components/ui/loading-indicator";
import { browserApi } from "@/lib/browser-api";

const passwordRule = "Use at least 8 characters with at least 1 letter and 1 number.";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "invalid" | "success">("checking");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!token) {
      queueMicrotask(() => {
        if (ignore) return;
        setStatus("invalid");
        setError("This reset link is missing or incomplete.");
      });
      return () => {
        ignore = true;
      };
    }

    void (async () => {
      if (ignore) return;
      setStatus("checking");
      setError("");

      try {
        const result = await browserApi.validatePasswordResetToken({ token });
        if (ignore) return;
        if (result.isValid) {
          setStatus("ready");
          return;
        }

        setStatus("invalid");
        setError("This reset link is invalid or has expired.");
      } catch (validationError) {
        if (ignore) return;
        setStatus("invalid");
        setError(validationError instanceof Error ? validationError.message : "Unable to validate reset link.");
      }
    })();

    return () => {
      ignore = true;
    };
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await browserApi.resetPassword({ token, password });
      setStatus("success");
      setTimeout(() => {
        router.replace("/login?reset=success");
      }, 1200);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StorefrontShell>
      <div className="page-shell py-10 sm:py-16">
        <div className="mx-auto max-w-xl surface-card card-shadow rounded-[2rem] p-5 sm:rounded-[2.5rem] sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
            Secure reset
          </p>
          <h1 className="display-font mt-3 text-3xl font-semibold text-[var(--color-blue)] sm:text-4xl">
            Choose a new password
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
            {passwordRule}
          </p>

          {status === "checking" ? (
            <div className="mt-6 rounded-[1.4rem] bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Checking your reset link...
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          {status === "success" ? (
            <div className="mt-6 rounded-[1.4rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Password updated successfully. Redirecting you to login...
            </div>
          ) : null}

          {status === "ready" ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="relative">
                <label className="mb-2 block text-sm font-semibold text-[var(--color-blue)]">New password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 pr-12 outline-none"
                  placeholder="New password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-blue)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <label className="mb-2 block text-sm font-semibold text-[var(--color-blue)]">Confirm password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 pr-12 outline-none"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-blue)]"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <button
                disabled={loading}
                className="site-button site-button-primary w-full disabled:cursor-wait disabled:opacity-60"
              >
                <LoadingButtonContent loading={loading} loadingText="Updating password...">
                  Reset password
                </LoadingButtonContent>
              </button>
            </form>
          ) : null}

          <p className="mt-5 text-sm text-[var(--color-ink-soft)]">
            Need a fresh link?{" "}
            <Link href="/forgot-password" className="font-semibold text-[var(--color-blue)]">
              Request another reset email
            </Link>
          </p>
        </div>
      </div>
    </StorefrontShell>
  );
}
