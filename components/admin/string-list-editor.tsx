"use client";

import { IconPlus, IconTrash } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

/**
 * Reusable list-of-strings editor (workflow steps, results, technologies,
 * …). Each row is an input with a remove button; an "Add" button appends
 * a new empty row.
 */
export function StringListEditor({
  label,
  values,
  onChange,
  placeholder = "Enter an item",
  hint,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const update = (index: number, value: string) => {
    onChange(values.map((item, i) => (i === index ? value : item)));
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      {values.map((value, index) => (
        <div key={index} className="flex items-start gap-2">
          <Input
            name={`${label}-${index}`}
            value={value}
            placeholder={placeholder}
            onChange={(event) => update(index, event.target.value)}
          />
          <button
            type="button"
            aria-label={`Remove ${label} item`}
            onClick={() => onChange(values.filter((_, i) => i !== index))}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-red-400/40 hover:text-red-300"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-muted transition-colors hover:border-white/25 hover:text-foreground"
      >
        <IconPlus className="h-3.5 w-3.5" />
        Add {label.toLowerCase()}
      </button>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
