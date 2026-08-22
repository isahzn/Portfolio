import { getAnalyticsEvents, listProjects } from "@/lib/database";
import { isAdminRequest } from "@/lib/auth";
import { summarizeAnalytics } from "@/lib/analytics-summary";

/** GET /api/admin/analytics?days=30 — authenticated engagement summary. */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawDays = Number(url.searchParams.get("days") ?? "30");
  const days = Number.isFinite(rawDays) ? Math.min(90, Math.max(1, Math.floor(rawDays))) : 30;

  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const [events, projects] = await Promise.all([getAnalyticsEvents(since), listProjects()]);
    const titles = Object.fromEntries(projects.map((project) => [project.slug, project.title]));
    const summary = summarizeAnalytics(events, days, titles);
    return Response.json({ summary });
  } catch (error) {
    console.error("[admin] failed to load analytics", error);
    return Response.json({ error: "Failed to load analytics." }, { status: 500 });
  }
}
