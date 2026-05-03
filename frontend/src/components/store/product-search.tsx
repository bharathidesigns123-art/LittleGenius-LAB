import { Search, X } from "lucide-react";
import Link from "next/link";
import { productCountLabel } from "@/lib/product-count-label";

export function ProductSearch({
  action,
  clearHref,
  query,
  totalCount,
  resultCount,
}: {
  action: string;
  clearHref: string;
  query: string;
  totalCount: number;
  resultCount: number;
}) {
  const hasQuery = query.length > 0;

  return (
    <div className="mb-6 rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-3 shadow-sm">
      <form action={action} className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Search
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by toy name, type, material, or colour"
            className="h-14 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-12 text-sm font-semibold text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-soft)] focus:border-[var(--color-orange)] focus:bg-white focus:ring-4 focus:ring-orange-100"
          />
          {hasQuery ? (
            <Link
              href={clearHref}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-blue)] transition hover:bg-white"
            >
              <X size={18} aria-hidden="true" />
            </Link>
          ) : null}
        </label>
        <button type="submit" className="site-button site-button-primary h-14 px-7">
          Search
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-2 text-sm">
        <p className="font-semibold text-[var(--color-blue)]">
          {hasQuery
            ? `${productCountLabel(resultCount)} of ${productCountLabel(totalCount)} match "${query}"`
            : "Search the full catalogue"}
        </p>
        <p className="text-[var(--color-ink-soft)]">Try names, categories, colours, or PLA.</p>
      </div>
    </div>
  );
}
