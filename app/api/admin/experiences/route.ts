import { createExperience, listExperiences } from "@/lib/database";
import type { ExperienceInput } from "@/lib/database";
import { isAdminRequest } from "@/lib/auth";

/** GET /api/admin/experiences — authenticated list of experience entries. */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const experiences = await listExperiences();
    return Response.json({ experiences });
  } catch (error) {
    console.error("[admin] failed to load experiences", error);
    return Response.json({ error: "Failed to load experiences." }, { status: 500 });
  }
}

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

/** POST /api/admin/experiences — authenticated creation of an experience entry. */
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

  const input = parseInput(body);
  if (!input) {
    return Response.json({ error: "A company name is required." }, { status: 400 });
  }

  try {
    const experience = await createExperience(input);
    return Response.json({ experience }, { status: 201 });
  } catch (error) {
    console.error("[admin] failed to create experience", error);
    return Response.json({ error: "Failed to create the entry." }, { status: 500 });
  }
}
