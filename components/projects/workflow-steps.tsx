import { Fragment } from "react";
import { IconArrowRight } from "@/components/ui/icons";

/**
 * Visual workflow steps (docs/07_PROJECT_CASE_STUDY_SYSTEM.MD):
 * numbered steps connected by arrows on desktop, stacked on mobile.
 * Uses div-based list semantics because arrow separators sit between items.
 */
export function WorkflowSteps({ steps }: { steps: string[] }) {
  return (
    <div role="list" className="flex flex-col gap-3 md:flex-row md:items-center">
      {steps.map((step, index) => (
        <Fragment key={step}>
          <div
            role="listitem"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 md:flex-1"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <span className="text-sm font-medium leading-relaxed text-foreground/85">
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <IconArrowRight className="ml-8 hidden h-4 w-4 shrink-0 text-muted md:ml-0 md:block" />
          )}
        </Fragment>
      ))}
    </div>
  );
}
