import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

type LoadingSpinnerProps = {
  className?: string;
  label?: string;
};

export function LoadingSpinner({
  className = "h-5 w-5 text-current",
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <LoaderCircle
      className={`${className} animate-spin`}
      aria-label={label}
      role="status"
    />
  );
}

export function LoadingButtonContent({
  loading,
  loadingText,
  children,
}: {
  loading: boolean;
  loadingText: string;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex min-w-0 items-center justify-center gap-2">
      {loading ? <LoadingSpinner className="h-4 w-4 shrink-0 text-current" label={loadingText} /> : null}
      <span className="truncate">{loading ? loadingText : children}</span>
    </span>
  );
}

export function InlineLoader({
  label = "Loading...",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 text-sm font-bold text-brand-primary-dark ${className}`}>
      <LoadingSpinner className="h-4 w-4 text-brand-primary" label={label} />
      <span>{label}</span>
    </div>
  );
}

export function PageLoader({
  title = "Loading LittleGenius LAB",
  message = "Getting everything ready...",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="page-shell flex min-h-[55vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-7 text-center shadow-brand-card backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
          <LoadingSpinner className="h-8 w-8 text-brand-primary" label={title} />
        </div>
        <h1 className="display-font mt-5 text-2xl font-semibold text-[var(--color-blue)]">
          {title}
        </h1>
        <p className="mt-2 text-sm font-semibold text-[var(--color-ink-soft)]">
          {message}
        </p>
        <div className="mt-6 overflow-hidden rounded-full bg-brand-primary/10">
          <div className="app-loader-bar h-2 w-1/2 rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-2xl bg-slate-200/80 ${className}`} />;
}
