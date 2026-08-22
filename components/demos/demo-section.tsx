import type { ReactNode } from "react";

/**
 * Demo page info block (docs/06_DEMO_SPECIFICATIONS.MD) — Problem,
 * Solution, and How-It-Works sections share this consistent layout.
 */
export function DemoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}
