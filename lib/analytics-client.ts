/**
 * Client-side analytics tracking (browser-only — never import from a server
 * component). Sends small anonymous events to POST /api/analytics:
 *
 *  - pageview   every page navigation (path + referrer + session id)
 *  - view       a project/service detail was viewed
 *  - impression a project/service card was shown (for CTR)
 *  - click      a CTA / project card was clicked (data-track-click)
 *  - duration   seconds spent on a page (sent on navigation / pagehide)
 *
 * No cookies, no third parties, no personal data — just engagement counts.
 */

const SESSION_KEY = "floza_sid";

export type TrackEvent = {
  type: "pageview" | "view" | "impression" | "click" | "duration";
  path?: string;
  entity?: "project" | "service";
  slug?: string;
  target?: string;
  value?: number;
  sessionId?: string;
  referrer?: string;
};

export function sessionId(): string {
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

function send(event: TrackEvent): void {
  try {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {
      /* tracking must never break the page */
    });
  } catch {
    /* ignore */
  }
}

/** Page navigation — path + referrer. */
export function trackPageview(path: string, referrer: string): void {
  send({ type: "pageview", path, referrer, sessionId: sessionId() });
}

/** A project/service detail page was viewed. */
export function trackView(entity: "project" | "service", slug: string): void {
  if (!slug) return;
  send({ type: "view", entity, slug, sessionId: sessionId() });
}

/** A project/service card was shown (denominator for click-through rate). */
export function trackImpression(entity: "project" | "service", slug: string): void {
  if (!slug) return;
  send({ type: "impression", entity, slug, sessionId: sessionId() });
}

/** A CTA / card was clicked (data-track-click attribute). */
export function trackClick(target: string, slug?: string): void {
  send({ type: "click", target, slug, sessionId: sessionId() });
}

/** Seconds spent on a page — sent on navigation and pagehide. */
export function trackDuration(path: string, seconds: number): void {
  const value = Math.max(0, Math.round(seconds));
  if (value < 1 || !path) return;
  send({ type: "duration", path, value, sessionId: sessionId() });
}

/** Best-effort final duration flush via sendBeacon (page unload). */
export function trackDurationBeacon(path: string, seconds: number): void {
  try {
    const value = Math.max(0, Math.round(seconds));
    if (value < 1 || !path) return;
    const blob = new Blob([JSON.stringify({ type: "duration", path, value, sessionId: sessionId() })], {
      type: "application/json",
    });
    navigator.sendBeacon("/api/analytics", blob);
  } catch {
    /* ignore */
  }
}
