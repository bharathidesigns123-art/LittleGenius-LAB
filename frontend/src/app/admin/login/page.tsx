"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      router.replace("/admin");
    }
  }, [authLoading, isAdmin, isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login({ email, password });
      if (result.user.role !== "Admin") {
        throw new Error("This account does not have admin access.");
      }
      router.replace("/admin");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell py-16">
      <div className="mx-auto max-w-xl surface-card card-shadow rounded-[2.5rem] p-8">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
          Admin only
        </p>
        <h1 className="display-font mt-3 text-4xl font-semibold text-[var(--color-blue)]">
          LittleGenius LAB dashboard
        </h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-[1.4rem] border border-[var(--color-border)] px-4 py-3 outline-none"
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            disabled={loading || authLoading}
            className="site-button site-button-primary w-full disabled:opacity-60"
          >
            {loading || authLoading ? "Signing in..." : "Login as admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
