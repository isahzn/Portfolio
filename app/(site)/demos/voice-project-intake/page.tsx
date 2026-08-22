import type { Metadata } from "next";
import demos from "@/data/demos.json";
import { VoiceProjectIntakeDemo } from "@/components/demos/voice-project-intake-demo";
import { DemoShell } from "@/components/demos/demo-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Voice Project Intake Agent",
  description:
    "Speak your project details and watch an AI agent capture them into a live project brief — a temporary in-browser demo.",
  path: "/demos/voice-project-intake",
});

const demo = demos.find((item) => item.id === "voice-project-intake") ?? demos[0];

/**
 * Temporary demo — Voice Project Intake Agent. Browser speech-to-text, an AI
 * intake agent, text-to-speech replies, and an in-memory project brief panel.
 * Nothing is persisted; refresh resets the session.
 */
export default function VoiceProjectIntakePage() {
  return (
    <DemoShell
      demo={demo}
      problem="Every new project starts the same way: a long back-and-forth of forms, emails, and calls to capture names, budgets, and scopes — details that get lost or typed twice."
      solution="Floza builds voice agents that have a natural conversation, pull every detail into a structured project brief in real time, and hand the team a ready-to-quote profile."
      workflow={[
        "Visitor taps the mic and speaks naturally",
        "Browser transcribes speech in real time",
        "AI captures details and asks the next question",
        "Reply is spoken aloud while the brief fills in live",
      ]}
    >
      <VoiceProjectIntakeDemo />
    </DemoShell>
  );
}
