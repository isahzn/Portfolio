import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin session auth (docs/09_SECURITY_AND_PRIVACY.MD — Admin Dashboard Security).
 *
 * The dashboard is protected by a single shared password (ADMIN_SECRET) from the
 * environment — no user accounts or stored passwords. A successful login issues a
 * stateless HMAC-signed token in an HttpOnly cookie; every request re-verifies it,
 * so sessions survive serverless cold starts without extra infrastructure.
 */

export const ADMIN_COOKIE = "floza_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const TOKEN_CONTEXT = "floza-admin-session";

/** Whether ADMIN_SECRET is set (when unset, the dashboard is disabled). */
export const adminConfigured = Boolean(process.env.ADMIN_SECRET);

function secret(): string {
  return process.env.ADMIN_SECRET ?? "";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  return `${exp}.${sign(`${TOKEN_CONTEXT}:${exp}`)}`;
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token || !secret()) return false;
  const [expPart, signature] = token.split(".");
  const exp = Number(expPart);
  if (!Number.isFinite(exp) || exp <= Date.now() || !signature) return false;
  const expected = sign(`${TOKEN_CONTEXT}:${exp}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function cookieValue(header: string, name: string): string | undefined {
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

/** Route-handler check: validates the cookie from the raw Request. */
export function isAdminRequest(request: Request): boolean {
  return verifySessionToken(cookieValue(request.headers.get("cookie") ?? "", ADMIN_COOKIE));
}

/** Server-component check: validates the cookie from the request context. */
export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

function cookieBase(value: string, maxAgeSeconds: number): string {
  const secure = process.env.NODE_ENV === "production";
  return `${ADMIN_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure ? "; Secure" : ""}`;
}

export function adminSessionCookieHeader(): string {
  return cookieBase(createSessionToken(), Math.floor(SESSION_TTL_MS / 1000));
}

export function adminClearCookieHeader(): string {
  return cookieBase("", 0);
}

/** Constant-time comparison of the submitted password against ADMIN_SECRET. */
export function passwordMatches(input: string): boolean {
  const expected = secret();
  if (!expected) return false;
  const a = createHmac("sha256", TOKEN_CONTEXT).update(input).digest();
  const b = createHmac("sha256", TOKEN_CONTEXT).update(expected).digest();
  return timingSafeEqual(a, b);
}
