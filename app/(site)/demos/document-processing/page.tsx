import type { Metadata } from "next";
import demos from "@/data/demos.json";
import { DemoShell } from "@/components/demos/demo-shell";
import { DocumentProcessingDemo } from "@/components/demos/document-processing-demo";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Document Processing",
  description:
    "Upload documents and see how AI extracts structured information automatically.",
  path: "/demos/document-processing",
});

const demo = demos.find((item) => item.id === "document-processing") ?? demos[0];

/**
 * Demo 2 — AI Document Processing (docs/06_DEMO_SPECIFICATIONS.MD).
 */
export default function DocumentProcessingPage() {
  return (
    <DemoShell
      demo={demo}
      problem="Reading documents, copying information, and typing it into systems is slow and error-prone — and the workload grows with every new document."
      solution="Floza builds systems that process documents, extract the information, and push it straight into your workflows — no retyping, no manual checking."
      workflow={[
        "Document uploaded",
        "AI extracts information",
        "Data validated",
        "Sent to your systems",
      ]}
    >
      <DocumentProcessingDemo />
    </DemoShell>
  );
}
