import { deleteProject, patchProject, updateProject } from "@/lib/database";
import type { ProjectInput } from "@/lib/database";
import { isAdminRequest } from "@/lib/auth";
import { slugify } from "@/lib/slug";

type RouteContext = { params: Promise<{ id: string }> };

function parseProjectInput(body: Record<string, unknown>): ProjectInput | null {
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const list = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  const bool = (value: unknown) => value === true || value === "true";

  const title = text(body.title);
  if (!title) return null;

  const linksRaw =
    body.links && typeof body.links === "object" ? (body.links as Record<string, unknown>) : {};
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

/** PUT /api/admin/projects/[id] — authenticated full update of a project. */
export async function PUT(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await context.params;

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
    const project = await updateProject(id, input);
    if (!project) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }
    return Response.json({ project });
  } catch (error) {
    console.error("[admin] failed to update project", error);
    return Response.json({ error: "Failed to update the project." }, { status: 500 });
  }
}

/** PATCH /api/admin/projects/[id] — authenticated partial update (featured / order). */
export async function PATCH(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const patch: { featured?: boolean; orderIndex?: number } = {};
  if (body.featured !== undefined) patch.featured = body.featured === true || body.featured === "true";
  if (body.orderIndex !== undefined) {
    const index = Number(body.orderIndex);
    if (!Number.isFinite(index)) {
      return Response.json({ error: "Invalid order index." }, { status: 400 });
    }
    patch.orderIndex = Math.max(0, Math.floor(index));
  }

  try {
    const project = await patchProject(id, patch);
    if (!project) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }
    return Response.json({ project });
  } catch (error) {
    console.error("[admin] failed to update project", error);
    return Response.json({ error: "Failed to update the project." }, { status: 500 });
  }
}

/** DELETE /api/admin/projects/[id] — authenticated removal of a project. */
export async function DELETE(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    await deleteProject(id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] failed to delete project", error);
    return Response.json({ error: "Failed to delete the project." }, { status: 500 });
  }
}
