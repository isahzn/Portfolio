import "server-only";
import type { ProjectInput } from "@/lib/database/types";
import projectsData from "@/data/projects.json";
import { slugify } from "@/lib/slug";

/**
 * Content seeding (docs/05_DATA_MODEL.MD).
 *
 * data/*.json remains the source of truth for initial content. On first run
 * the database layer seeds the `projects` table from data/projects.json;
 * afterwards everything is edited from the admin dashboard and the JSON file
 * is only used as the fallback seed. Services and demos stay static JSON.
 */

/** Seed projects from data/projects.json (kept in sync with the DB schema). */
export function defaultProjects(): ProjectInput[] {
  return (projectsData as Array<{
    id: string;
    title: string;
    category: string;
    shortDescription: string;
    image: string;
    featured: boolean;
    slug: string;
    problem?: string;
    solution?: string;
    workflow?: string[];
    screenshots?: string[];
    results?: string[];
    technologies?: string[];
  }>).map((project) => ({
    slug: project.slug || slugify(project.title),
    title: project.title,
    category: project.category ?? "",
    shortDescription: project.shortDescription ?? "",
    image: project.image ?? "",
    gallery: project.screenshots ?? [],
    featured: Boolean(project.featured),
    problem: project.problem,
    solution: project.solution,
    workflow: project.workflow ?? [],
    results: project.results ?? [],
    technologies: project.technologies ?? [],
    links: {},
  }));
}

