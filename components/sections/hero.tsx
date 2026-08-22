"use client";

import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { UptimeCounter } from "@/components/site/live-status";

const heroStats = [
  { num: "03", label: "Core Disciplines" },
  { num: "24/7", label: "Systems Running" },
  { num: "100%", label: "Custom Built" },
];

const marqueeItems = [
  "Online Always",
  "Automation Studio",
  "AI-Powered",
  "24/7 Systems",
  "Online Always",
  "Automation Studio",
  "AI-Powered",
  "24/7 Systems",
];

/**
 * Homepage hero — animated marquee eyebrow, typing headline, orbital visual
 * with spinning rings, and floating status cards.
 */
export function Hero() {
  return (
    <section className="relative border-b border-border-soft">
      <PageContainer className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          {/* Marquee eyebrow */}
          <div className="eyebrow mb-8 overflow-hidden">
            <div className="eyebrow-track">
              {marqueeItems.map((item, i) => (
                <span key={i} className="flex items-center gap-2.5">
                  <span className="dot h-[5px] w-[5px] rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Typing headline */}
          <h1 className="text-[clamp(2.6rem,5vw,4.5rem)] font-bold leading-[1.04] tracking-tight text-foreground">
            <span className="hero-line">
              <span>Your business runs</span>
            </span>
            <span className="hero-line">
              <span>
                <em className="serif-em text-primary shadow-[0_0_40px_var(--color-primary)]">24/7.</em>{" "}
                Your systems
              </span>
            </span>
            <span className="hero-line">
              <span>should too.</span>
            </span>
          </h1>

          <p className="hero-fade-up delay-1 mt-6 max-w-[480px] text-[17px] leading-relaxed text-muted">
            AI-powered automations that work while you sleep. No manual tasks. No downtime.
            Floza builds the infrastructure that keeps your business moving around the clock.
          </p>

          <div className="hero-fade-up delay-2 mt-10 flex flex-wrap items-center gap-3.5">
            <Button size="lg" href="/contact" data-track-click="contact">
              Build Something That Never Stops
            </Button>
            <Button size="lg" variant="outline" href="/demos" data-track-click="demos">
              See It Running
            </Button>
          </div>

          <div className="hero-fade-up delay-3 mt-14 flex flex-wrap gap-9 border-t border-border-soft pt-7">
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

        {/* Orbital visual */}
        <div className="relative flex items-center justify-center">
          <div className="orb-container relative aspect-square w-full max-w-[440px]">
            <div className="orb-ring" />
            <div className="orb-ring" />
            <div className="orb-ring" />
            <div className="orb" />

            {/* Status labels */}
            <span className="absolute right-[-10%] top-[10%] flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
              <span className="live-dot" aria-hidden="true" />
              Systems operational
            </span>
            <span className="absolute bottom-[15%] left-[-5%] font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
              Uptime: 99.97%
            </span>

            {/* Floating status cards */}
            <div className="float-status absolute left-[-15%] top-[5%]" style={{ animationDelay: "0s" }}>
              <span className="live-dot" aria-hidden="true" />
              <span className="text-faint">Leads today</span>
              <span className="text-foreground">1,247</span>
            </div>
            <div className="float-status absolute right-[-20%] bottom-[20%]" style={{ animationDelay: "-2s" }}>
              <span className="text-primary">→</span>
              <span className="text-faint">Response time</span>
              <span className="text-foreground">&lt; 1s</span>
            </div>
            <div className="float-status absolute left-[-25%] top-[55%]" style={{ animationDelay: "-4s" }}>
              <span className="text-online">✓</span>
              <span className="text-faint">Automations</span>
              <span className="text-foreground">
                <UptimeCounter />
              </span>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
