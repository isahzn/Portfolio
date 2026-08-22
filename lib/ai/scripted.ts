/**
 * Scripted assistant knowledge base — used as a zero-cost fallback when
 * no AI provider key is configured (or the provider is unreachable).
 * Pure module: safe to import from client components.
 */
export function getScriptedReply(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("service")) {
    return "We build AI automations, websites, and custom software. AI automation covers assistants, document processing, and lead management — the systems that remove repetitive work.";
  }
  if (q.includes("automation")) {
    return "Automation takes over repetitive tasks like data entry, answering common questions, and organizing leads — so your team can focus on work that actually needs a human.";
  }
  if (q.includes("time")) {
    return "It depends on the process. Work that takes a person hours — like document processing — can run in minutes with AI. Most clients see the biggest savings in data entry and customer messaging.";
  }
  if (q.includes("build") || q.includes("similar")) {
    return "Yes — that's exactly what we do. Tell us about your process on the contact page and we'll show you how it can be automated.";
  }
  if (q.includes("price") || q.includes("cost") || q.includes("budget")) {
    return "Every project is scoped individually, so we tailor the proposal to your process. Share it with us and we'll give you a clear, no-pressure estimate.";
  }
  if (q.includes("contact")) {
    return "You can reach us through the contact page or directly at hello@floza.com — we reply within one business day.";
  }
  return "Good question. For details specific to your business, the fastest way is to tell us about your process on the contact page — we'll show you exactly how it could be automated.";
}
