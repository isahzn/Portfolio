import type { ReactNode } from "react";

/**
 * Reusable case-study section (docs/04_COMPONENT_LIBARY.MD): a consistent
 * heading + content block used across project pages.
 */
export function CaseStudySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="max-w-3xl">
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
