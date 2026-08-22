import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/sections/contact-form";
import { ContactOptions } from "@/components/site/contact-options";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with Floza. Tell us about the process you want to automate and we'll show you how.",
  path: "/contact",
});

/**
 * Contact page (docs/08_CONTENT_PLAN.MD): direct contact options plus the
 * inquiry form. Contact details come from the admin dashboard (Settings)
 * via the branding provider, so edits appear without a redeploy.
 */
export default function ContactPage() {
  return (
    <>
      <section className="pt-16 sm:pt-24">
        <PageContainer className="flex flex-col items-center gap-3 text-center">
          <h1 className="section-title">Contact Floza</h1>
          <p className="section-subtitle">
            Tell us about the process you want to automate — we&apos;ll show you how it can
            run itself.
          </p>
        </PageContainer>
      </section>

      <section>
        <PageContainer className="grid gap-6 py-16 sm:py-20 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <h2 className="text-lg font-semibold tracking-tight">Direct contact</h2>
            <ContactOptions />

            <Card className="mt-2 flex flex-col gap-2 p-5">
              <p className="text-sm font-medium text-foreground">What happens next?</p>
              <ul className="flex flex-col gap-2 text-sm text-muted">
                <li>1. We review your inquiry within one business day.</li>
                <li>2. We schedule a short call to understand your workflow.</li>
                <li>3. You get a clear proposal — no pressure, no jargon.</li>
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="p-6 sm:p-8">
              <ContactForm />
            </Card>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
