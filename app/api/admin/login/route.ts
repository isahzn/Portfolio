import {
  adminConfigured,
  adminSessionCookieHeader,
  passwordMatches,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const ATTEMPTS_PER_HOUR = 10;

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * POST /api/admin/login (docs/09_SECURITY_AND_PRIVACY.MD).
 * Verifies the submitted password against ADMIN_SECRET and issues an
 * HttpOnly session cookie on success. Rate-limited per IP.
 */
export async function POST(request: Request) {
  if (!adminConfigured) {
    return Response.json(
      { error: "Admin access is not configured. Set ADMIN_SECRET in your environment." },
      { status: 403 },
    );
  }

  const ip = clientIp(request);
  if (!rateLimit(`admin-login:${ip}`, ATTEMPTS_PER_HOUR, 60 * 60 * 1000).ok) {
    return Response.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password || password.length > 200) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!passwordMatches(password)) {
    return Response.json({ error: "Incorrect password." }, { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Set-Cookie": adminSessionCookieHeader() },
  });
}
