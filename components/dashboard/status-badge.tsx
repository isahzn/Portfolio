import type { LeadStatus } from "@/lib/database";
import { Badge } from "@/components/ui/badge";

/**
 * StatusBadge (docs/04_COMPONENT_LIBARY.MD #12).
 * Coloured label per pipeline status: new / contacted / qualified / closed.
 */
const STATUS_STYLES: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "New", className: "border-sky-400/30 bg-sky-400/10 text-sky-300" },
  contacted: {
    label: "Contacted",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  qualified: {
    label: "Qualified",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  closed: { label: "Closed", className: "border-white/10 bg-white/5 text-muted" },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.new;
  return <Badge className={style.className}>{style.label}</Badge>;
}
