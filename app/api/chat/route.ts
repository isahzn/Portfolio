import { getAiReply } from "@/lib/ai";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/knowledge";
import { getScriptedReply } from "@/lib/ai/scripted";
import { getConversation, saveConversation } from "@/lib/database";
import { rateLimit } from "@/lib/rate-limit";

const MAX_USER_MESSAGES = 5;
const MAX_MESSAGE_LENGTH = 500;
const MESSAGES_PER_MINUTE = 12;

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * POST /api/chat (docs/03_TECH_ARCHITECTURE.MD, docs/06_DEMO_SPECIFICATIONS.MD).
 *
 * Body: { visitorId: string, message: string }
 * - Session limit of 5 user messages per visitorId (server-enforced, so the
 *   limit holds even if the client is manipulated).
 * - Per-IP rate limiting.
 * - Real AI reply when AI_API_KEY is set; scripted fallback otherwise.
 * - Conversation persisted via the storage layer for the admin dashboard.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`chat:${ip}`, MESSAGES_PER_MINUTE, 60_000).ok) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { visitorId, message } = (payload ?? {}) as { visitorId?: unknown; message?: unknown };
  if (typeof visitorId !== "string" || visitorId.length < 8 || visitorId.length > 128) {
    return Response.json({ error: "Invalid session." }, { status: 400 });
  }
  if (typeof message !== "string") {
    return Response.json({ error: "Invalid message." }, { status: 400 });
  }
  const content = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!content) {
    return Response.json({ error: "Invalid message." }, { status: 400 });
  }

  // Storage is the source of truth for the session (client history is ignored).
  const conversation = await getConversation(visitorId).catch((error) => {
    console.error("[chat] failed to read conversation", error);
    return null;
  });
  const stored = conversation?.messages ?? [];
  const storedUserCount = stored.filter((msg) => msg.role === "user").length;

  if (storedUserCount + 1 > MAX_USER_MESSAGES) {
    return Response.json({ error: "limit_reached" }, { status: 429 });
  }

  const context = [...stored.slice(-20), { role: "user" as const, content }];
  const reply =
    (await getAiReply(context, CHAT_SYSTEM_PROMPT)) ?? getScriptedReply(content);

  const nextMessages = [...context, { role: "assistant" as const, content: reply }];
  await saveConversation(visitorId, nextMessages).catch((error) => {
    console.error("[chat] failed to save conversation", error);
  });

  return Response.json({ reply });
}
