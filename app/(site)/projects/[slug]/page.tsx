import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/database";
import { buildMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ContactCta } from "@/components/sections/contact-cta";
import { CaseStudySection } from "@/components/projects/case-study-section";
import { ProjectVisual } from "@/components/projects/project-visual";
import { WorkflowSteps } from "@/components/projects/workflow-steps";
import { PageContainer } from "@/components/layout/page-container";

// Case studies are database-backed and edited from the admin dashboard —
// render live so edits appear without a redeploy.
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return buildMetadata({
    title: project.title,
    description: project.shortDescription,
    path: `/projects/${project.slug}`,
  });
}

const projectLinks = (project: { links?: { live?: string; github?: string; caseStudy?: string } }) => [
  { href: project.links?.live, label: "Live site" },
  { href: project.links?.github, label: "View code" },
  { href: project.links?.caseStudy, label: "Case study" },
].filter((link): link is { href: string; label: string } => Boolean(link.href));

/**
 * Case-study page (docs/07_PROJECT_CASE_STUDY_SYSTEM.MD): generated from the
 * database. Sections render only when present, so new projects can be added
 * with just the data they have.
 */
export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const heroImage = project.gallery[0] || project.image;

  return (
    <>
      <section className="pt-16 sm:pt-24">
        <PageContainer className="flex flex-col items-center gap-5 text-center">
          <Badge variant="primary">{project.category}</Badge>
          <h1 className="section-title">{project.title}</h1>
          <p className="section-subtitle">{project.shortDescription}</p>
          {projectLinks(project).length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {projectLinks(project).map((link) => (
                <Button
                  key={link.label}
                  variant="outline"
                  size="sm"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Button>
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      <section className="pt-10">
        <PageContainer className="group">
          <ProjectVisual image={heroImage} priority className="aspect-[16/7] rounded-2xl" />
        </PageContainer>
      </section>

      <PageContainer className="flex flex-col gap-14 py-16 sm:py-20">
        {project.problem && (
          <CaseStudySection title="The problem">
            <p className="leading-relaxed text-muted">{project.problem}</p>
          </CaseStudySection>
        )}

        {project.solution && (
          <CaseStudySection title="The solution">
            <p className="leading-relaxed text-muted">{project.solution}</p>
          </CaseStudySection>
        )}

        {project.workflow && project.workflow.length > 0 && (
          <CaseStudySection title="How it works">
            <WorkflowSteps steps={project.workflow} />
          </CaseStudySection>
        )}

        {project.gallery.length > 1 && (
          <CaseStudySection title="Screenshots">
            <div className="grid gap-4 sm:grid-cols-2">
              {project.gallery.slice(1).map((screenshot) => (
                <div key={screenshot} className="group">
                  <ProjectVisual image={screenshot} className="aspect-[16/10] rounded-xl" />
                </div>
              ))}
            </div>
          </CaseStudySection>
        )}

        {project.results && project.results.length > 0 && (
          <CaseStudySection title="Results">
            <ul className="flex flex-col gap-3">
              {project.results.map((result) => (
                <li key={result} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconCheck className="h-3 w-3" />
                  </span>
                  <span className="text-sm leading-relaxed text-foreground/85">{result}</span>
                </li>
              ))}
            </ul>
          </CaseStudySection>
        )}

        {project.technologies && project.technologies.length > 0 && (
          <CaseStudySection title="Technology">
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="neutral">
                  {tech}
                </Badge>
              ))}
            </div>
          </CaseStudySection>
        )}
      </PageContainer>

      <ContactCta />
    </>
  );
}
