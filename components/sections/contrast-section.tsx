import { PageContainer } from "@/components/layout/page-container";

const manualPoints = [
  "Inbox drowning by morning",
  "Leads slip through the cracks",
  "Nothing happens after hours",
  "Monday = catching up from the weekend",
];

const flozaPoints = [
  "Leads handled in seconds — even at 2am",
  "No inbox. No manual work. Ever.",
  "Your system keeps going. Always.",
  "Monday = zero backlog. Clean slate.",
];

/**
 * 24/7 contrast section — positions Floza against traditional 9-5 work
 * (24/7 redesign brief). Side-by-side cards: manual processes in muted red
 * vs Floza automation in online-green, split by a hairline grid.
 */
export function ContrastSection() {
  return (
    <section className="border-b border-border-soft">
      <PageContainer className="py-20 sm:py-24">
        <div className="section-head">
          <div>
            <div className="section-tag mb-4">The difference</div>
            <h2 className="section-title">
              Manual processes stop at 5pm. <em>We don&apos;t.</em>
            </h2>
          </div>
          <p className="section-subtitle max-w-[420px]">
            Your customers don&apos;t clock out — neither should your operations. Here&apos;s
            what changes when the system runs without you.
          </p>
        </div>

        <div className="grid gap-px rounded-[14px] border border-border-soft bg-border-soft md:grid-cols-2">
          {/* The 9-5 side */}
          <div className="flex flex-col gap-6 bg-background p-9 sm:p-10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
                Manual processes
              </span>
              <span className="rounded-full border border-red-500/10 bg-red-500/8 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-red-400/60">
                9-5
              </span>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-muted">
              Others work 9-5
            </h3>
            <ul className="flex flex-col gap-3.5">
              {manualPoints.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-px shrink-0 text-red-400/50">
                    ✕
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* The 24/7 side */}
          <div className="flex flex-col gap-6 bg-surface p-9 sm:p-10">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-online">
                <span className="live-dot" aria-hidden="true" />
                Floza automation
              </span>
              <span className="rounded-full border border-online/15 bg-online/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-online">
                24/7
              </span>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
              We work <em className="serif-em">24/7</em>
            </h3>
            <ul className="flex flex-col gap-3.5">
              {flozaPoints.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-foreground">
                  <span aria-hidden="true" className="mt-px shrink-0 text-online">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
