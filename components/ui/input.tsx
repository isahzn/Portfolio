import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable text Input primitive (docs/04_COMPONENT_LIBARY.MD).
 * Optional label, hint and error states; styles are shared by all forms.
 */
type InputProps = ComponentProps<"input"> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground/80">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-11 rounded-lg border bg-white/[0.03] px-4 text-sm text-foreground transition-all duration-200 outline-none placeholder:text-muted/60",
          "border-white/10 hover:border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/25",
          error && "border-red-400/60 focus:border-red-400/60 focus:ring-red-400/20",
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
