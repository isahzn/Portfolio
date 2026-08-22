import type { Metadata } from "next";
import demos from "@/data/demos.json";
import { DemoShell } from "@/components/demos/demo-shell";
import { LeadCrmDemo } from "@/components/demos/lead-crm-demo";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Lead Qualification CRM",
  description:
    "Automatically understand, score, and organize incoming leads in a CRM.",
  path: "/demos/lead-crm",
});

const demo = demos.find((item) => item.id === "lead-crm") ?? demos[0];

/**
 * Demo 3 — AI Lead Qualification + CRM (docs/06_DEMO_SPECIFICATIONS.MD).
 */
export default function LeadCrmPage() {
  return (
    <DemoShell
      demo={demo}
      problem="Leads arrive from everywhere, follow-ups get forgotten, and your team spends time sorting through inquiries that were never going to convert."
      solution="Floza builds systems that talk to prospects, qualify them with the right questions, score every lead, and keep everything organized in one CRM."
      workflow={[
        "Inquiry received",
        "AI asks qualification questions",
        "Lead scored automatically",
        "CRM entry created",
      ]}
    >
      <LeadCrmDemo />
    </DemoShell>
  );
}
