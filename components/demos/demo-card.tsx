import Link from "next/link";
import type { Demo } from "@/lib/types";
import { IconArrowRight } from "@/components/ui/icons";

/**
 * DemoCard — clickable tile for an interactive demo (floza-redesign.html),
 * driven by data/demos.json. Sharp corners, mono category, arrow link.
 */
export function DemoCard({ demo }: { demo: Demo }) {
  return (
    <Link
      href={demo.route}
      className="group flex h-full flex-col gap-4 bg-background p-7 transition-colors duration-200 hover:bg-surface"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-primary">
          {demo.category}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-online">
          <span className="live-dot" aria-hidden="true" />
          Live Now
        </span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{demo.title}</h3>
      <p className="flex-grow text-sm leading-relaxed text-muted">{demo.description}</p>
      <span className="flex items-center gap-2 border-t border-border-soft pt-3 font-mono text-[12.5px] text-foreground">
        Try the demo
        <IconArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
