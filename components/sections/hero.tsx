import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { UptimeCounter } from "@/components/site/live-status";

const heroStats = [
  { num: "03", label: "Core Disciplines" },
  { num: "24/7", label: "Systems Running" },
  { num: "100%", label: "Custom Built" },
];

const statusRows = [
  { label: "Status", value: "Operational", live: true },
  { label: "Availability", value: "99.97%" },
  { label: "Last Downtime", value: "Never" },
];

/**
 * Homepage hero (24/7 redesign brief): headline built on the reliability
 * promise, the "others stop at 5pm" contrast line, CTAs, stat row and a live
 * FLOZA NETWORK STATUS panel — availability, a ticking uptime counter and
 * a zero-downtime bar that sells infrastructure language instead of a
 * generic terminal.
 */
export function Hero() {
  return (
    <section className="border-b border-border-soft">
      <PageContainer className="grid items-start gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <div className="eyebrow mb-7">Online Always · Automation Studio</div>

          <h1 className="text-[clamp(2.6rem,4.6vw,4.1rem)] font-semibold leading-[1.06] tracking-tight text-foreground">
            Your business runs <em className="serif-em">24/7.</em> <br />
            Your systems should too.
          </h1>

          <p className="mt-5 flex items-center gap-3 font-mono text-[12.5px] uppercase tracking-[0.06em] text-muted">
            <span aria-hidden="true" className="h-px w-8 bg-border" />
            Others stop at 5pm. <span className="text-online">We don&apos;t.</span>
          </p>

          <p className="mt-6 max-w-[480px] text-[17px] leading-relaxed text-muted">
            AI-powered automations that work while you sleep. No manual tasks. No downtime.
            Floza builds the infrastructure that keeps your business moving around the clock.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3.5">
            <Button size="lg" href="/contact" data-track-click="contact">
              Build Something That Never Stops
            </Button>
            <Button size="lg" variant="outline" href="/demos" data-track-click="demos">
              See It Running
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap gap-9 border-t border-border-soft pt-7">
            {heroStats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-serif text-[28px] leading-none text-foreground">
                  {stat.num}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-faint">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Network status — a live-feeling uptime readout (24/7 brief) */}
        <div className="border border-border bg-surface font-mono text-[12.5px]">
          <div className="flex items-center justify-between border-b border-border-soft px-5 py-3.5">
            <span className="flex items-center gap-2.5 text-[11px] tracking-[0.03em] text-foreground">
              <span className="live-dot" aria-hidden="true" />
              FLOZA NETWORK STATUS<span className="term-cursor" aria-hidden="true" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.08em] text-online">Live</span>
          </div>
          <div className="px-5 py-1.5">
            {statusRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 border-b border-border-soft py-3.5 last:border-b-0"
              >
                <span className="text-faint">{row.label}</span>
                <span className="flex items-center gap-2 text-foreground">
                  {row.live && <span className="live-dot" aria-hidden="true" />}
                  {row.value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 py-3.5">
              <span className="text-faint">Uptime</span>
              <span className="text-online">
                <UptimeCounter />
              </span>
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.06em] text-faint">
              <span>Uptime this quarter</span>
              <span className="text-online">100%</span>
            </div>
            <div className="h-1 overflow-hidden bg-border" aria-hidden="true">
              <div className="h-full w-full bg-online" />
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
