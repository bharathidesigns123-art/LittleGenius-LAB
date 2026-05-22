"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") || "";
  const [draftQuery, setDraftQuery] = useState("");
  const [hasEditedQuery, setHasEditedQuery] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = hasEditedQuery ? draftQuery : currentQuery;

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/shop?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push("/shop");
    }
    // On mobile, collapse after search
    setIsExpanded(false);
    setHasEditedQuery(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setDraftQuery("");
    setHasEditedQuery(true);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md lg:mx-auto">
      <form
        onSubmit={handleSearch}
        action="/shop"
        method="get"
        className={`relative flex items-center transition-all duration-300 ${
          isExpanded ? "w-full" : "w-full md:w-auto"
        }`}
      >
        <div className="relative w-full">
          <label htmlFor="global-search" className="sr-only">
            Search products
          </label>
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
            <Search size={18} />
          </div>
          <input
            ref={inputRef}
            id="global-search"
            name="q"
            type="text"
            value={query}
            onChange={(e) => {
              setDraftQuery(e.target.value);
              setHasEditedQuery(true);
            }}
            placeholder="Search toys..."
            className="h-11 w-full rounded-full border border-[rgba(21,94,181,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,250,239,0.96))] pl-10 pr-10 text-sm font-semibold text-ink shadow-[0_10px_24px_rgba(21,94,181,0.08),inset_0_1px_0_rgba(255,255,255,0.76)] transition-all placeholder:text-ink-soft focus:border-brand-secondary/55 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-sunshine/20 md:h-12"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-soft hover:bg-[var(--color-surface-2)] hover:text-ink"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
