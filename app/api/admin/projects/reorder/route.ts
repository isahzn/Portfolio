import { reorderProjects } from "@/lib/database";
import { isAdminRequest } from "@/lib/auth";

/** POST /api/admin/projects/reorder — authenticated reorder of all projects. */
export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { ids?: unknown };
  try {
    body = (await request.json()) as { ids?: unknown };
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string")) {
    return Response.json({ error: "Invalid project order." }, { status: 400 });
  }

  try {
    await reorderProjects(body.ids as string[]);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] failed to reorder projects", error);
    return Response.json({ error: "Failed to reorder projects." }, { status: 500 });
  }
}
