import type { Metadata } from "next";
import { ProjectGrid } from "@/components/projects/project-grid";
import { ContactCta } from "@/components/sections/contact-cta";
import { PageContainer } from "@/components/layout/page-container";
import { listProjects } from "@/lib/database";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Case Studies",
  description: "Proof of work — the systems, websites, and automations Floza has shipped.",
  path: "/projects",
});

// Projects are edited from the admin dashboard — render live so edits
// appear without a redeploy (avoids build-time database reads entirely).
export const dynamic = "force-dynamic";

/**
 * Projects page (docs/07_PROJECT_CASE_STUDY_SYSTEM.MD): filterable grid of
 * project cards, driven by the database and editable from /admin → Projects.
 */
export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <>
      <section className="pt-16 sm:pt-24">
        <PageContainer className="flex flex-col items-center gap-3 text-center">
          <h1 className="section-title">Case Studies</h1>
          <p className="section-subtitle">
            Proof of work — the systems, websites, and automations Floza has shipped.
          </p>
        </PageContainer>
      </section>

      <ProjectGrid projects={projects} />

      <ContactCta />
    </>
  );
}
