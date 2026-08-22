/**
 * Minimal in-memory sliding-window rate limiter (docs/09_SECURITY_AND_PRIVACY.MD).
 *
 * Per process instance — sufficient for early-stage traffic; if the site
 * grows to many serverless instances, move this behind the database layer.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean } {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return { ok: false };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { ok: true };
}
