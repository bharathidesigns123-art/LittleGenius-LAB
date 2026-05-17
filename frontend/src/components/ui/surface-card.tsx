import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/class-names";

type SurfaceCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  tone?: "default" | "muted" | "elevated";
};

const toneClasses: Record<NonNullable<SurfaceCardProps["tone"]>, string> = {
  default: "surface-card",
  muted: "surface-card surface-card-muted",
  elevated: "surface-card surface-card-elevated",
};

export function SurfaceCard({
  children,
  className,
  tone = "default",
  ...props
}: SurfaceCardProps) {
  return (
    <div className={cn(toneClasses[tone], className)} {...props}>
      {children}
    </div>
  );
}
