import { getAiReply } from "@/lib/ai";
import {
  getScriptedIntakeReply,
  INTAKE_SYSTEM_PROMPT,
  parseIntakeResponse,
  sanitizeLead,
} from "@/lib/ai/intake";
import { rateLimit } from "@/lib/rate-limit";

const MAX_MESSAGE_LENGTH = 800;
const MAX_MESSAGES_PER_MINUTE = 20;

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * POST /api/voice-intake — Voice Project Intake Agent demo.
 *
 * Body: { message: string, lead: object }
 * - Stateless by design: the client sends its current (in-memory) lead profile
 *   each turn and gets the full merged profile back. Nothing is persisted —
 *   the demo is a temporary frontend experience and resets on refresh.
 * - Per-IP rate limiting.
 * - Real AI when AI_API_KEY is set (prompted to extract fields + reply as JSON);
 *   keyword-based scripted fallback otherwise.
 *
 * Returns: { reply: string, lead: IntakeLead, complete: boolean }
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`voice-intake:${ip}`, MAX_MESSAGES_PER_MINUTE, 60_000).ok) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { message, lead } = (payload ?? {}) as { message?: unknown; lead?: unknown };
  if (typeof message !== "string") {
    return Response.json({ error: "Invalid message." }, { status: 400 });
  }
  const content = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!content) {
    return Response.json({ error: "Invalid message." }, { status: 400 });
  }

  const currentLead = sanitizeLead(lead);

  const prompt = [
    INTAKE_SYSTEM_PROMPT,
    "",
    "Current lead profile (fields already collected; null = not asked yet, skipped = prospect declined):",
    JSON.stringify(currentLead),
  ].join("\n");

  const aiReply = await getAiReply([{ role: "user", content }], prompt, 500);
  if (aiReply) {
    const parsed = parseIntakeResponse(aiReply, currentLead);
    if (parsed) {
      return Response.json(parsed);
    }
    // AI answered but not as usable JSON — still surface the spoken reply.
    return Response.json({ reply: aiReply, lead: currentLead, complete: false });
  }

  return Response.json(getScriptedIntakeReply(content, currentLead));
}
