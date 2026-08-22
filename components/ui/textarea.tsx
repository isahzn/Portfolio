import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable Textarea primitive — same design language as Input,
 * for longer content (e.g. project descriptions).
 */
type TextareaProps = ComponentProps<"textarea"> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Textarea({ label, hint, error, id, className, ...props }: TextareaProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground/80">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        aria-invalid={error ? true : undefined}
        rows={4}
        className={cn(
          "rounded-lg border bg-white/[0.03] px-4 py-2.5 text-sm text-foreground transition-all duration-200 outline-none placeholder:text-muted/60",
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
