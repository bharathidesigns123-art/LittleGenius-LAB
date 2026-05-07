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
}: {
  title?: string;
}) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center bg-transparent py-16" role="status" aria-label={title}>
      <div className="toy-loader" aria-hidden="true">
        <div className="toy-loader-track">
          <span className="toy-loader-block toy-loader-block-cyan" />
          <span className="toy-loader-block toy-loader-block-orange" />
          <span className="toy-loader-block toy-loader-block-pink" />
          <span className="toy-loader-block toy-loader-block-yellow" />
        </div>
        <div className="toy-loader-base">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-2xl bg-slate-200/80 ${className}`} />;
}
