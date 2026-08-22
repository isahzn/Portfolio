import type { Metadata } from "next";
import demos from "@/data/demos.json";
import { DemoCard } from "@/components/demos/demo-card";
import { ContactCta } from "@/components/sections/contact-cta";
import { PageContainer } from "@/components/layout/page-container";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Live Demos",
  description: "See the 24/7 AI automation systems Floza builds — running live, no sign-up.",
  path: "/demos",
});

/**
 * Demos page (docs/06_DEMO_SPECIFICATIONS.MD): cards for every interactive
 * demo, driven by data/demos.json. Framed as live systems (24/7 brief).
 */
export default function DemosPage() {
  return (
    <>
      <section className="pt-16 sm:pt-24">
        <PageContainer className="flex flex-col items-center gap-3 text-center">
          <h1 className="section-title">Live Demos</h1>
          <p className="section-subtitle">
            No sign-up, no setup — see the real systems running right now. Every demo is
            the 24/7 workflow at work.
          </p>
        </PageContainer>
      </section>

      <section>
        <PageContainer className="py-16 sm:py-20">
          <div className="grid grid-cols-1 gap-px border border-border-soft bg-border-soft md:grid-cols-3">
            {demos.map((demo) => (
              <DemoCard key={demo.id} demo={demo} />
            ))}
          </div>
        </PageContainer>
      </section>

      <ContactCta />
    </>
  );
}
