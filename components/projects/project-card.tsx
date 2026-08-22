import Link from "next/link";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconArrowRight } from "@/components/ui/icons";
import { ProjectVisual } from "@/components/projects/project-visual";

/**
 * ProjectCard — portfolio preview linking to /projects/[slug]
 * (docs/04_COMPONENT_LIBARY.MD). The data-track attributes feed the
 * portfolio analytics (project card clicks / impressions).
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-track-click="project-card"
      data-track-impression="project"
      data-track-slug={project.slug}
      className="group block h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden">
        <ProjectVisual image={project.image} className="aspect-[16/9] border-b border-white/10" />
        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="primary">{project.category}</Badge>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-online">
              <span className="live-dot" aria-hidden="true" />
              24/7 Live
            </span>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {project.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted">{project.shortDescription}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary">
            View case study
            <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
