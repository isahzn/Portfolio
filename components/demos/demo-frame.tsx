import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

/**
 * Interactive demo frame (docs/04_COMPONENT_LIBARY.MD): a product-like
 * container that makes demos feel like real software.
 */
export function DemoFrame({ children }: { children: ReactNode }) {
  return (
    <Card hover={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 bg-surface/60 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-foreground">Interactive demo</span>
        </div>
        <Badge variant="secondary">Simulation</Badge>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}
