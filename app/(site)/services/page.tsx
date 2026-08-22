import type { Metadata } from "next";
import { ContactCta } from "@/components/sections/contact-cta";
import { ServicesSection } from "@/components/sections/services-section";
import { PageContainer } from "@/components/layout/page-container";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "AI automation, website development, and custom software solutions built by Floza.",
  path: "/services",
});

/**
 * Services page (docs/08_CONTENT_PLAN.MD): the three service offerings in
 * detail, driven by data/services.json.
 */
export default function ServicesPage() {
  return (
    <>
      <section className="pt-16 sm:pt-24">
        <PageContainer className="flex flex-col items-center gap-3 text-center">
          <h1 className="section-title">Services</h1>
          <p className="section-subtitle">
            From AI assistants to complete business systems — built to run while you sleep,
            around your workflow, not the other way around.
          </p>
        </PageContainer>
      </section>

      <ServicesSection showHeader={false} />

      <ContactCta />
    </>
  );
}
