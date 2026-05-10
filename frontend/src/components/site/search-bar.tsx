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
      {/* Desktop & Mobile Search Bar */}
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
            className="h-10 w-full rounded-full border border-transparent bg-gray-100 pl-10 pr-10 text-sm font-medium text-ink transition-all placeholder:text-ink-soft focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 md:h-11"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-soft hover:bg-gray-200 hover:text-ink"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
