import { deleteExperience, updateExperience } from "@/lib/database";
import type { ExperienceInput } from "@/lib/database";
import { isAdminRequest } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

function parseInput(body: Record<string, unknown>): ExperienceInput | null {
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const list = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

  const company = text(body.company);
  if (!company) return null;

  return {
    company,
    projectTitle: text(body.projectTitle),
    description: text(body.description),
    technologies: list(body.technologies),
    completionDate: text(body.completionDate),
    logo: text(body.logo),
  };
}

/** PUT /api/admin/experiences/[id] — authenticated full update. */
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

  const input = parseInput(body);
  if (!input) {
    return Response.json({ error: "A company name is required." }, { status: 400 });
  }

  try {
    const experience = await updateExperience(id, input);
    if (!experience) {
      return Response.json({ error: "Experience not found." }, { status: 404 });
    }
    return Response.json({ experience });
  } catch (error) {
    console.error("[admin] failed to update experience", error);
    return Response.json({ error: "Failed to update the entry." }, { status: 500 });
  }
}

/** DELETE /api/admin/experiences/[id] — authenticated removal. */
export async function DELETE(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    await deleteExperience(id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] failed to delete experience", error);
    return Response.json({ error: "Failed to delete the entry." }, { status: 500 });
  }
}
