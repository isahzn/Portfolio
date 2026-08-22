import "server-only";
import type { ChatMessage } from "@/lib/database";

/**
 * AI provider client (docs/03_TECH_ARCHITECTURE.MD).
 *
 * OpenAI-compatible chat completions, so any provider works by setting env:
 * - AI_API_KEY (required)
 * - AI_BASE_URL (defaults to OpenRouter)
 * - AI_MODEL (defaults to a low-cost OpenRouter model)
 *
 * The key is only ever used server-side. Returns null when the provider is
 * not configured or fails, so callers can fall back gracefully.
 */
const BASE_URL = (process.env.AI_BASE_URL ?? "https://openrouter.ai/api/v1").replace(/\/+$/, "");
const MODEL = process.env.AI_MODEL ?? "openai/gpt-4o-mini";

export async function getAiReply(
  messages: ChatMessage[],
  systemPrompt: string,
  maxTokens = 300,
): Promise<string | null> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      console.error(`[ai] provider error: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    return typeof content === "string" && content.trim() ? content.trim() : null;
  } catch (error) {
    console.error("[ai] request failed", error);
    return null;
  }
}
