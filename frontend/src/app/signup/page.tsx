"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { LoadingButtonContent } from "@/components/ui/loading-indicator";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signup(form);
      router.push("/account");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StorefrontShell>
      <div className="page-shell py-10 sm:py-16">
        <div className="mx-auto max-w-xl surface-card card-shadow rounded-[2rem] p-5 sm:rounded-[2.5rem] sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
            New here
          </p>
          <h1 className="display-font mt-3 text-3xl font-semibold text-[var(--color-blue)] sm:text-4xl">
            Create your account
          </h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
              Full name
              <input
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                className="w-full rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                placeholder="Your full name"
                autoComplete="name"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
              Email address
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--color-blue)]">
              Phone number
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="w-full rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                placeholder="10-digit mobile number"
                autoComplete="tel"
              />
            </label>
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-[var(--color-blue)]">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 pr-12 outline-none"
                placeholder="Password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-blue)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {error ? (
              <div className="rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}
            <button disabled={loading} className="site-button site-button-primary w-full disabled:cursor-wait disabled:opacity-60">
              <LoadingButtonContent loading={loading} loadingText="Creating account...">
                Create account
              </LoadingButtonContent>
            </button>
          </form>
          <p className="mt-5 text-sm text-[var(--color-ink-soft)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--color-blue)]">
              Login
            </Link>
          </p>
        </div>
      </div>
    </StorefrontShell>
  );
}
