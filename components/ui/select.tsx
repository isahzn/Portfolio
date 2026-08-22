import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable Select primitive — same design language as Input, with an
 * explicit chevron so the dropdown affordance stays visible (appearance-none).
 */
type SelectProps = ComponentProps<"select"> & {
  label?: string;
  children: ReactNode;
};

export function Select({ label, id, className, children, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-foreground/80">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border border-white/10 bg-white/[0.03] px-4 pr-9 text-sm text-foreground transition-all duration-200 outline-none hover:border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/25",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
