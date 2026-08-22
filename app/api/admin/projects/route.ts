import { createProject, listProjects } from "@/lib/database";
import type { ProjectInput } from "@/lib/database";
import { isAdminRequest } from "@/lib/auth";
import { slugify } from "@/lib/slug";

/** GET /api/admin/projects — authenticated list of all projects. */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const projects = await listProjects();
    return Response.json({ projects });
  } catch (error) {
    console.error("[admin] failed to load projects", error);
    return Response.json({ error: "Failed to load projects." }, { status: 500 });
  }
}

function parseProjectInput(body: Record<string, unknown>): ProjectInput | null {
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const list = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  const bool = (value: unknown) => value === true || value === "true";

  const title = text(body.title);
  if (!title) return null;

  const linksRaw = body.links && typeof body.links === "object" ? (body.links as Record<string, unknown>) : {};
  return {
    slug: text(body.slug) || slugify(title),
    title,
    category: text(body.category) || "Website",
    shortDescription: text(body.shortDescription),
    image: text(body.image),
    gallery: list(body.gallery),
    featured: bool(body.featured),
    problem: text(body.problem),
    solution: text(body.solution),
    workflow: list(body.workflow),
    results: list(body.results),
    technologies: list(body.technologies),
    links: {
      live: text(linksRaw.live),
      github: text(linksRaw.github),
      caseStudy: text(linksRaw.caseStudy),
    },
  };
}

/** POST /api/admin/projects — authenticated creation of a new project. */
export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const input = parseProjectInput(body);
  if (!input) {
    return Response.json({ error: "A project title is required." }, { status: 400 });
  }

  try {
    const project = await createProject(input);
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    console.error("[admin] failed to create project", error);
    return Response.json({ error: "Failed to create the project." }, { status: 500 });
  }
}
