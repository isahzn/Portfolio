import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable Badge label primitive (docs/04_COMPONENT_LIBARY.MD).
 * Mono, uppercase, sharp-cornered — used for categories, statuses and small
 * labels across cards and pages.
 */
type BadgeVariant = "primary" | "secondary" | "neutral";

type BadgeProps = ComponentProps<"span"> & {
  variant?: BadgeVariant;
};

/* `secondary` intentionally mirrors `primary` — kept as a separate variant
   for API compatibility with callers that pass variant="secondary". */
const variantClasses: Record<BadgeVariant, string> = {
  primary: "border-primary/30 bg-primary/10 text-primary",
  secondary: "border-primary/30 bg-primary/10 text-primary",
  neutral: "border-border bg-surface text-muted",
};

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.05em]",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
