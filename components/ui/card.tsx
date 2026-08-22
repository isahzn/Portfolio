import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable Card primitive (docs/04_COMPONENT_LIBARY.MD).
 * Sharp corners, hairline border, dark surface — editorial design system.
 */
type CardProps = ComponentProps<"div"> & {
  /** Disable the hover border/surface change. */
  hover?: boolean;
};

export function Card({ className, hover = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[2px] border border-border bg-surface",
        hover && "transition-colors duration-300 hover:border-faint hover:bg-surface-2",
        className,
      )}
      {...props}
    />
  );
}
