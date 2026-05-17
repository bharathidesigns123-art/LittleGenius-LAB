import type { ReactNode } from "react";
import { SurfaceCard } from "@/components/ui/surface-card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <SurfaceCard className="px-6 py-10 text-center sm:px-10 sm:py-14" tone="elevated">
      <h3 className="display-font text-3xl font-semibold leading-tight text-[var(--color-blue)] sm:text-4xl">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--color-ink-soft)]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </SurfaceCard>
  );
}
