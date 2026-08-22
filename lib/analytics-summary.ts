import type { AnalyticsEvent } from "@/lib/database";

/**
 * Analytics aggregation (docs/05_DATA_MODEL.MD — Analytics Model).
 *
 * Pure functions over raw events so Neon and the in-memory store produce
 * identical numbers. For a portfolio the event volume is small — fetching
 * events for the selected window and aggregating in JS is simpler and more
 * portable than hand-written SQL.
 */

export type AnalyticsSummary = {
  days: number;
  totalPageviews: number;
  uniqueSessions: number;
  totalClicks: number;
  avgDurationSec: number;
  /** One entry per day (zero-filled) for the traffic chart. */
  daily: Array<{ date: string; views: number; sessions: number }>;
  topPages: Array<{ path: string; views: number }>;
  topProjects: Array<{
    slug: string;
    title: string;
    views: number;
    clicks: number;
    impressions: number;
    ctr: number | null;
  }>;
  topServices: Array<{ slug: string; views: number }>;
  ctaClicks: Array<{ target: string; count: number }>;
  referrers: Array<{ label: string; count: number }>;
  avgTimeByPage: Array<{ path: string; seconds: number }>;
};

function isoDate(iso: string | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function referrerLabel(referrer: string): string {
  const value = referrer.trim().toLowerCase();
  if (!value) return "Direct";
  if (value.includes("google")) return "Google";
  if (value.includes("linkedin")) return "LinkedIn";
  if (value.includes("instagram")) return "Instagram";
  if (value.includes("facebook") || value.includes("fb.com")) return "Facebook";
  if (value.includes("x.com") || value.includes("twitter")) return "X / Twitter";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host || "Other";
  } catch {
    return "Other";
  }
}

export function summarizeAnalytics(
  events: AnalyticsEvent[],
  days: number,
  projectTitles: Record<string, string>,
): AnalyticsSummary {
  const now = new Date();
  const windowStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Only consider events inside the window (defensive; stores pre-filter too).
  const inWindow = events.filter((event) => {
    if (!event.createdAt) return true;
    return event.createdAt >= windowStart.toISOString();
  });

  /* Daily traffic (zero-filled). */
  const dailyMap = new Map<string, { views: number; sessions: Set<string> }>();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    dailyMap.set(date, { views: 0, sessions: new Set() });
  }

  /* Page views per path. */
  const pageViews = new Map<string, number>();
  const sessions = new Set<string>();
  let totalClicks = 0;

  for (const event of inWindow) {
    if (event.type === "pageview") {
      if (event.sessionId) sessions.add(event.sessionId);
      const date = isoDate(event.createdAt);
      const day = dailyMap.get(date);
      if (day) {
        day.views += 1;
        if (event.sessionId) day.sessions.add(event.sessionId);
      }
      if (event.path) {
        pageViews.set(event.path, (pageViews.get(event.path) ?? 0) + 1);
      }
    } else if (event.type === "click") {
      totalClicks += 1;
    }
  }

  const daily = [...dailyMap.entries()].map(([date, value]) => ({
    date,
    views: value.views,
    sessions: value.sessions.size,
  }));

  /* Projects: views / clicks / impressions → CTR. */
  const projectStats = new Map<
    string,
    { views: number; clicks: number; impressions: number }
  >();
  for (const event of inWindow) {
    if (!event.slug) continue;
    const stats = projectStats.get(event.slug) ?? { views: 0, clicks: 0, impressions: 0 };
    if (event.type === "view" && event.entity === "project") stats.views += 1;
    if (event.type === "click" && event.target === "project-card") stats.clicks += 1;
    if (event.type === "impression" && event.entity === "project") stats.impressions += 1;
    projectStats.set(event.slug, stats);
  }

  const topProjects = [...projectStats.entries()]
    .map(([slug, stats]) => ({
      slug,
      title: projectTitles[slug] ?? slug,
      views: stats.views,
      clicks: stats.clicks,
      impressions: stats.impressions,
      ctr: stats.impressions > 0 ? Math.round((stats.clicks / stats.impressions) * 1000) / 10 : null,
    }))
    .sort((a, b) => b.views - a.views || b.clicks - a.clicks)
    .slice(0, 8);

  /* Services (impressions of service cards). */
  const serviceStats = new Map<string, number>();
  for (const event of inWindow) {
    if (event.type === "impression" && event.entity === "service" && event.slug) {
      serviceStats.set(event.slug, (serviceStats.get(event.slug) ?? 0) + 1);
    }
  }
  const topServices = [...serviceStats.entries()]
    .map(([slug, views]) => ({ slug, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  /* CTA clicks by target. */
  const ctaMap = new Map<string, number>();
  for (const event of inWindow) {
    if (event.type === "click" && event.target) {
      ctaMap.set(event.target, (ctaMap.get(event.target) ?? 0) + 1);
    }
  }
  const ctaOrder = ["book-call", "contact", "contact-form", "whatsapp", "project-card"];
  const ctaClicks = [...ctaMap.entries()]
    .sort((a, b) => (ctaOrder.indexOf(a[0]) - ctaOrder.indexOf(b[0])) || b[1] - a[1])
    .map(([target, count]) => ({ target, count }));

  /* Referrer sources. */
  const referrerMap = new Map<string, number>();
  for (const event of inWindow) {
    if (event.type !== "pageview") continue;
    const label = referrerLabel(event.referrer ?? "");
    referrerMap.set(label, (referrerMap.get(label) ?? 0) + 1);
  }
  const referrers = [...referrerMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  /* Average time on page (duration events). */
  const durationByPath = new Map<string, { total: number; count: number }>();
  for (const event of inWindow) {
    if (event.type !== "duration" || !event.path || !event.value) continue;
    const entry = durationByPath.get(event.path) ?? { total: 0, count: 0 };
    entry.total += event.value;
    entry.count += 1;
    durationByPath.set(event.path, entry);
  }
  const avgTimeByPage = [...durationByPath.entries()]
    .map(([path, entry]) => ({ path, seconds: Math.round(entry.total / entry.count) }))
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, 8);

  const durations = inWindow.filter((event) => event.type === "duration" && (event.value ?? 0) > 0);
  const avgDurationSec = durations.length
    ? Math.round(durations.reduce((sum, event) => sum + (event.value ?? 0), 0) / durations.length)
    : 0;

  return {
    days,
    totalPageviews: inWindow.filter((event) => event.type === "pageview").length,
    uniqueSessions: sessions.size,
    totalClicks,
    avgDurationSec,
    daily,
    topPages: [...pageViews.entries()]
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8),
    topProjects,
    topServices,
    ctaClicks,
    referrers,
    avgTimeByPage,
  };
}
