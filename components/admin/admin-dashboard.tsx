"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { dashboardSections } from "@/components/admin/dashboard-sections";
import { Button } from "@/components/ui/button";

/**
 * Admin dashboard shell (docs/00_PROJECT_OVERVIEW.MD #11).
 *
 * Tabbed layout driven entirely by the section registry
 * (components/admin/dashboard-sections.tsx): tabs, header copy and content
 * all derive from that array — adding a future section means adding one
 * entry there, nothing else changes.
 */
export function AdminDashboard() {
  const router = useRouter();
  const [activeId, setActiveId] = useState(dashboardSections[0].id);
  const [refreshKey, setRefreshKey] = useState(0);

  const active = dashboardSections.find((section) => section.id === activeId) ?? dashboardSections[0];
  const ActiveComponent = active.component;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">{active.label}</h1>
          <p className="section-subtitle mt-1 !text-sm">{active.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setRefreshKey((key) => key + 1)}>
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void logout()}>
            Sign out
          </Button>
        </div>
      </div>

      <nav
        aria-label="Dashboard sections"
        className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-1"
      >
        {dashboardSections.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === activeId;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveId(section.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          );
        })}
      </nav>

      {/* key remounts the section so Refresh always refetches fresh data. */}
      <div key={`${activeId}-${refreshKey}`}>
        <ActiveComponent />
      </div>
    </div>
  );
}
