"use client";

import { useEffect, useState } from "react";
import type { AnalyticsSummary } from "@/lib/analytics-summary";
import { adminFetch, handleLoadError } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { BarList, DonutChart, LineChart } from "@/components/admin/charts";
import { cn } from "@/lib/utils";

const RANGES = [7, 30, 90] as const;

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wider text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted/70">{hint}</p>}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
}

function formatDate(label: string): string {
  const [, month, day] = label.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function ctaLabel(target: string): string {
  const labels: Record<string, string> = {
    "book-call": "Book a call",
    contact: "Contact buttons",
    "contact-form": "Form submits",
    whatsapp: "WhatsApp",
    "project-card": "Project cards",
  };
  return labels[target] ?? target;
}

/**
 * Portfolio analytics (docs/05_DATA_MODEL.MD — Analytics Model): visitor
 * engagement — most viewed pages/projects/services, time on page, CTA
 * clicks, project click-through rates and traffic over time.
 */
export function AnalyticsSection() {
  const [days, setDays] = useState<number>(30);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    adminFetch<{ summary: AnalyticsSummary }>(`/api/admin/analytics?days=${days}`)
      .then((data) => {
        setSummary(data.summary);
        setError(null);
      })
      .catch((loadError) => handleLoadError(loadError, setError));
  }

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ summary: AnalyticsSummary }>(`/api/admin/analytics?days=${days}`)
      .then((data) => {
        if (!cancelled) {
          setSummary(data.summary);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (!cancelled) handleLoadError(loadError, setError);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const traffic = (summary?.daily ?? []).map((point) => ({
    label: formatDate(point.date),
    value: point.views,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-white/10 p-1">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDays(range)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                days === range
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              {range} days
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {summary === null ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10">
          <span className="text-sm text-muted">Loading…</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Page views" value={String(summary.totalPageviews)} hint={`last ${days} days`} />
            <StatCard label="Visitors" value={String(summary.uniqueSessions)} hint="approx. unique sessions" />
            <StatCard
              label="Avg. time on page"
              value={formatDuration(summary.avgDurationSec)}
              hint="across all pages"
            />
            <StatCard label="CTA clicks" value={String(summary.totalClicks)} hint="buttons & cards" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="mb-1 text-sm font-semibold text-foreground">Traffic over time</h3>
            <p className="mb-4 text-xs text-muted">Daily page views — hover a point for details.</p>
            <LineChart data={traffic} height={190} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Most viewed pages</h3>
              <BarList items={summary.topPages.map((item) => ({ label: item.path, value: item.views }))} />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Most viewed projects</h3>
              <BarList
                items={summary.topProjects.map((item) => ({
                  label: item.title,
                  sublabel: `${item.clicks} clicks`,
                  value: item.views,
                }))}
              />
            </div>
          </div>

          {summary.topProjects.some((project) => project.impressions > 0) && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-1 text-sm font-semibold text-foreground">Project click-through</h3>
              <p className="mb-4 text-xs text-muted">
                Card clicks ÷ card impressions, plus how many visitors opened the case study.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-muted">
                      <th className="pb-2 pr-3 font-medium">Project</th>
                      <th className="pb-2 pr-3 text-right font-medium">Impressions</th>
                      <th className="pb-2 pr-3 text-right font-medium">Clicks</th>
                      <th className="pb-2 pr-3 text-right font-medium">CTR</th>
                      <th className="pb-2 text-right font-medium">Case study views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.topProjects.map((project) => (
                      <tr key={project.slug} className="border-b border-white/5 text-muted">
                        <td className="py-2.5 pr-3 text-foreground/85">{project.title}</td>
                        <td className="py-2.5 pr-3 text-right">{project.impressions}</td>
                        <td className="py-2.5 pr-3 text-right">{project.clicks}</td>
                        <td className="py-2.5 pr-3 text-right font-medium text-foreground">
                          {project.ctr === null ? "—" : `${project.ctr}%`}
                        </td>
                        <td className="py-2.5 text-right">{project.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">CTA clicks</h3>
              <BarList
                items={summary.ctaClicks.map((item) => ({
                  label: ctaLabel(item.target),
                  value: item.count,
                }))}
              />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Traffic sources</h3>
              <DonutChart segments={summary.referrers.map((item) => ({ label: item.label, value: item.count }))} />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Time on page</h3>
              <BarList
                items={summary.avgTimeByPage.map((item) => ({
                  label: item.path,
                  value: item.seconds,
                }))}
                format={formatDuration}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
