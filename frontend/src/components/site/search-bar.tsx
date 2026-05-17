"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

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
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md lg:mx-auto">
      <form
        onSubmit={handleSearch}
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
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search toys..."
            className="h-11 w-full rounded-full border border-[rgba(20,49,82,0.14)] bg-white/95 pl-10 pr-10 text-sm font-semibold text-ink shadow-[0_10px_24px_rgba(20,49,82,0.07),inset_0_1px_0_rgba(255,255,255,0.7)] transition-all placeholder:text-ink-soft focus:border-brand-secondary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-secondary/15 md:h-12"
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
