"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { useAuth } from "@/components/providers/auth-provider";

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
      <div className="page-shell py-16">
        <div className="mx-auto max-w-xl surface-card card-shadow rounded-[2.5rem] p-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
            New here
          </p>
          <h1 className="display-font mt-3 text-4xl font-semibold text-[var(--color-blue)]">
            Create your account
          </h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              placeholder="Full name"
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              placeholder="Email"
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              placeholder="Phone number"
            />
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              placeholder="Password"
            />
            {error ? (
              <div className="rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}
            <button disabled={loading} className="site-button site-button-primary w-full disabled:opacity-60">
              {loading ? "Creating account..." : "Create account"}
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
