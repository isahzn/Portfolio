import { adminClearCookieHeader } from "@/lib/auth";

/** POST /api/admin/logout — clears the admin session cookie. */
export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Set-Cookie": adminClearCookieHeader() },
  });
}
