import { reorderExperiences } from "@/lib/database";
import { isAdminRequest } from "@/lib/auth";

/** POST /api/admin/experiences/reorder — authenticated reorder of entries. */
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
    return Response.json({ error: "Invalid order." }, { status: 400 });
  }

  try {
    await reorderExperiences(body.ids as string[]);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] failed to reorder experiences", error);
    return Response.json({ error: "Failed to reorder entries." }, { status: 500 });
  }
}
