import { isAdminRequest } from "@/lib/auth";
import { deleteMediaBlob } from "@/lib/storage";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * DELETE /api/admin/media/[id] — authenticated removal of a media item.
 * NOTE: images still referenced by projects/experiences keep working (their
 * /api/media/<id> URL simply 404s and the UI falls back to a placeholder).
 */
export async function DELETE(request: Request, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    await deleteMediaBlob(id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] failed to delete media", error);
    return Response.json({ error: "Failed to delete the image." }, { status: 500 });
  }
}
