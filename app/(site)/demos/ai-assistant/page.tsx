import type { Metadata } from "next";
import demos from "@/data/demos.json";
import { AiAssistantDemo } from "@/components/demos/ai-assistant-demo";
import { DemoShell } from "@/components/demos/demo-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI Business Assistant",
  description:
    "An AI assistant that answers customer questions instantly, captures details, and escalates complex requests.",
  path: "/demos/ai-assistant",
});

const demo = demos.find((item) => item.id === "ai-assistant") ?? demos[0];

/**
 * Demo 1 — AI Business Assistant (docs/06_DEMO_SPECIFICATIONS.MD).
 */
export default function AiAssistantPage() {
  return (
    <DemoShell
      demo={demo}
      problem="Businesses waste hours answering the same questions — product inquiries, pricing, support basics. Every repeat answer takes time away from work that actually matters."
      solution="Floza builds AI assistants that understand your business, answer customers instantly, collect important details, and hand off complex requests to your team."
      workflow={[
        "Customer message arrives",
        "AI understands the request",
        "Answer delivered instantly",
        "Complex cases escalated to the team",
      ]}
    >
      <AiAssistantDemo />
    </DemoShell>
  );
}
