import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/class-names";

type PageSectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  shellClassName?: string;
};

export function PageSection({
  children,
  className,
  shellClassName,
  ...props
}: PageSectionProps) {
  return (
    <section className={cn("section-space", className)} {...props}>
      <div className={cn("page-shell", shellClassName)}>{children}</div>
    </section>
  );
}
