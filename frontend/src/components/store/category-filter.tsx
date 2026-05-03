import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryFilter({
  categories,
  activeSlug,
  query,
}: {
  categories: Category[];
  activeSlug?: string;
  query?: string;
}) {
  const getHref = (path: string) => {
    if (!query) {
      return path;
    }

    const params = new URLSearchParams({ q: query });

    return `${path}?${params.toString()}`;
  };

  const filterItems = [
    {
      label: "All",
      href: getHref("/shop"),
      slug: undefined,
    },
    ...categories.map((category) => ({
      label: category.name,
      href: getHref(`/shop/${category.slug}`),
      slug: category.slug,
    })),
  ];

  return (
    <nav aria-label="Filter products by type" className="mb-8">
      <div className="flex gap-3 overflow-x-auto rounded-[2rem] border border-[var(--color-border)] bg-white/80 p-2 shadow-sm">
        {filterItems.map((item) => {
          const isActive = item.slug === activeSlug || (!item.slug && !activeSlug);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`shrink-0 rounded-full px-5 py-3 text-sm font-bold transition ${
                isActive
                  ? "bg-[var(--color-blue)] text-white shadow-sm"
                  : "text-[var(--color-blue)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
