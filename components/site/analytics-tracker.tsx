"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  trackClick,
  trackDuration,
  trackDurationBeacon,
  trackImpression,
  trackPageview,
  trackView,
} from "@/lib/analytics-client";

/**
 * Site-wide analytics tracker — mounted once in the public layout.
 *
 * Records pageviews + time-on-page for every route change, project detail
 * views, and clicks on elements carrying [data-track-click]. Sends events to
 * POST /api/analytics, aggregated in /admin → Analytics.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const startedAt = useRef<number>(0);
  const currentPath = useRef<string>(pathname);

  // Pageview + duration on route changes.
  useEffect(() => {
    if (startedAt.current === 0) startedAt.current = Date.now();
    const now = Date.now();
    trackDuration(currentPath.current, (now - startedAt.current) / 1000);
    trackPageview(pathname, document.referrer);
    startedAt.current = now;
    currentPath.current = pathname;

    // Project detail views (case studies).
    const match = pathname.match(/^\/projects\/([^/]+)/);
    if (match) trackView("project", match[1]);
  }, [pathname]);

  // Delegated click tracking for [data-track-click] elements.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const tracked = target?.closest?.("[data-track-click]") as HTMLElement | null;
      if (!tracked) return;
      const clickTarget = tracked.getAttribute("data-track-click");
      const slug = tracked.getAttribute("data-track-slug") ?? undefined;
      if (clickTarget) trackClick(clickTarget, slug);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Impression tracking: once per page render, report every visible
  // [data-track-impression] element (project/service cards) — the
  // denominator for click-through rates.
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-track-impression]");
    elements.forEach((element) => {
      const entity = element.getAttribute("data-track-impression");
      const slug = element.getAttribute("data-track-slug");
      if (entity === "project" || entity === "service") {
        trackImpression(entity, slug ?? "");
      }
    });
  }, [pathname]);

  // Final duration flush on unload (beacon — survives the page closing).
  useEffect(() => {
    const onHide = () => {
      trackDurationBeacon(currentPath.current, (Date.now() - startedAt.current) / 1000);
    };
    document.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return null;
}
