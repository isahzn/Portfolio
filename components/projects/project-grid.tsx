"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/page-container";
import { ProjectCard } from "@/components/projects/project-card";

/**
 * Filterable projects grid (docs/07_PROJECT_CASE_STUDY_SYSTEM.MD).
 * Receives projects from the server (database-backed) — categories are
 * derived from the data, so adding a new category requires no code.
 */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("All");

  const categories = ["All", ...Array.from(new Set(projects.map((project) => project.category)))];

  const filtered =
    active === "All" ? projects : projects.filter((project) => project.category === active);

  return (
    <PageContainer className="py-12 sm:py-16">
      <div
        role="group"
        aria-label="Filter projects by category"
        className="flex flex-wrap justify-center gap-2"
      >
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            aria-pressed={active === category}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
              active === category
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/10 text-muted hover:border-white/25 hover:text-foreground",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted">
          No projects in this category yet.
        </p>
      )}
    </PageContainer>
  );
}
