"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StorefrontShell } from "@/components/site/storefront-shell";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState("admin@littlegeniuslab.in");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(isAdmin ? "/admin" : "/account");
    }
  }, [authLoading, isAdmin, isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login({ email, password });
      router.replace(result.user.role === "Admin" ? "/admin" : "/account");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StorefrontShell>
      <div className="page-shell py-16">
        <div className="mx-auto max-w-xl surface-card card-shadow rounded-[2.5rem] p-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
            Welcome back
          </p>
          <h1 className="display-font mt-3 text-4xl font-semibold text-[var(--color-blue)]">
            Login to your account
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
            Customer logins, admin logins, and JWT-based session handling all run through the same secure backend auth service.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
              placeholder="Password"
            />
            {error ? (
              <div className="rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}
            <button
              disabled={loading || authLoading}
              className="site-button site-button-primary w-full disabled:opacity-60"
            >
              {loading || authLoading ? "Signing in..." : "Login"}
            </button>
          </form>
          <p className="mt-5 text-sm text-[var(--color-ink-soft)]">
            Need an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--color-blue)]">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </StorefrontShell>
  );
}
