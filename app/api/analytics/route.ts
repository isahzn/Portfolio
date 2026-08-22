import { recordAnalyticsEvent } from "@/lib/database";
import { rateLimit } from "@/lib/rate-limit";

// Always accept fresh events — this is the tracking endpoint.
export const dynamic = "force-dynamic";

const EVENT_TYPES = new Set(["pageview", "view", "impression", "click", "duration"]);

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

/**
 * POST /api/analytics — anonymous engagement tracking from the site.
 * Values are validated and truncated; a generous per-IP rate limit protects
 * the database. Tracking failures never error the page (client fire-and-forget).
 */
export async function POST(request: Request) {
  if (!rateLimit(`analytics:${clientIp(request)}`, 240, 60_000).ok) {
    return new Response(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const event = body as Record<string, unknown>;
  const type = typeof event.type === "string" ? event.type : "";
  if (!EVENT_TYPES.has(type)) {
    return Response.json({ error: "Invalid event type." }, { status: 400 });
  }

  const text = (value: unknown, max: number) =>
    typeof value === "string" ? value.slice(0, max) : "";

  await recordAnalyticsEvent({
    type: type as "pageview" | "view" | "impression" | "click" | "duration",
    path: text(event.path, 500),
    entity: event.entity === "service" || event.entity === "project" ? event.entity : undefined,
    slug: text(event.slug, 200),
    target: text(event.target, 60),
    value:
      typeof event.value === "number" && Number.isFinite(event.value)
        ? Math.min(86_400, Math.max(0, event.value))
        : undefined,
    sessionId: text(event.sessionId, 100),
    referrer: text(event.referrer, 500),
  });

  return new Response(null, { status: 204 });
}
