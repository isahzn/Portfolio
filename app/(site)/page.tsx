import type { Metadata } from "next";
import { ContactCta } from "@/components/sections/contact-cta";
import { ContrastSection } from "@/components/sections/contrast-section";
import { Hero } from "@/components/sections/hero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI Automation & Software Solutions",
  description:
    "AI-powered automations that work while you sleep — no manual tasks, no downtime. Floza builds 24/7 systems, websites, and software.",
  path: "/",
});

/**
 * Homepage: hero → 9-5 vs 24/7 contrast → contact CTA. Services, demos,
 * projects and experience all live on their own pages — linked from the
 * navbar and footer.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <ContrastSection />
      <ContactCta />
    </>
  );
}
