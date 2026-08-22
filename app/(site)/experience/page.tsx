import type { Metadata } from "next";
import { listExperiences } from "@/lib/database";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactCta } from "@/components/sections/contact-cta";
import { PageContainer } from "@/components/layout/page-container";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Past Projects",
  description:
    "Companies and clients Floza has worked with — the systems, websites and automations delivered.",
  path: "/experience",
});

// Managed from the admin dashboard — render live so entries appear instantly.
export const dynamic = "force-dynamic";

/**
 * Past Projects page — companies/clients Floza has worked with, managed
 * entirely from /admin → Past Projects. Each entry shows the company logo
 * (or a monogram), the engagement, description, technologies and date.
 *
 * With no entries yet it shows a serif italic pitch instead — "we have no
 * experience, try us out" — which disappears the moment an entry is added.
 */
export default async function ExperiencePage() {
  const experiences = await listExperiences();

  return (
    <>
      <section className="pt-16 sm:pt-24">
        <PageContainer className="flex flex-col items-center gap-3 text-center">
          <h1 className="section-title">Past Projects</h1>
          <p className="section-subtitle">
            Companies we&apos;ve worked with — and the systems, websites and automations we
            built for them.
          </p>
        </PageContainer>
      </section>

      <section className="pb-8 pt-12 sm:pt-16">
        <PageContainer>
          {experiences.length === 0 ? (
            <div className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
              <p className="max-w-2xl font-serif text-3xl italic leading-snug text-foreground sm:text-4xl">
                We have no experience yet — try us out, for any price you decide.
              </p>
              <p className="max-w-md text-sm leading-relaxed text-muted">
                Every expert was once a beginner. We&apos;ll bring the same care to your
                project as we will to the first one on this page.
              </p>
              <Button href="/contact" data-track-click="contact">
                Start a project
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {experiences.map((entry) => (
                <Card key={entry.id} hover={false} className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface text-base font-bold text-primary">
                      {entry.logo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={entry.logo} alt={`${entry.company} logo`} className="h-full w-full object-cover" />
                      ) : (
                        entry.company.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold tracking-tight text-foreground">
                        {entry.company}
                      </h2>
                      {entry.completionDate && (
                        <p className="text-xs text-muted">{entry.completionDate}</p>
                      )}
                    </div>
                  </div>

                  {entry.projectTitle && (
                    <p className="text-sm font-medium text-primary">{entry.projectTitle}</p>
                  )}
                  {entry.description && (
                    <p className="text-sm leading-relaxed text-muted">{entry.description}</p>
                  )}

                  {entry.technologies.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                      {entry.technologies.map((tech) => (
                        <Badge key={tech} variant="neutral">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      <ContactCta />
    </>
  );
}
