import { getBranding } from "@/lib/site";

// Always hit the database on each call — this is public site data (the same
// info shown in the footer), so no caching is needed or wanted.
export const dynamic = "force-dynamic";

/**
 * GET /api/site/settings — public branding + contact settings for client-side
 * rendering (navbar logo, footer, contact page). Only exposes values meant
 * for public display. Set from the admin dashboard, no redeploy.
 * getBranding() degrades internally to data/site.json if the DB is down.
 */
export async function GET() {
  const branding = await getBranding();
  return Response.json({ settings: branding });
}
