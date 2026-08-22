import { getMediaBlob } from "@/lib/storage";

// Always read fresh from the store; long-lived cache headers make the CDN
// (Vercel) serve repeated requests without hitting the database again.
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/media/[id] — public image stream (used by <img> everywhere). */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const blob = await getMediaBlob(id);
    if (!blob || !blob.data) {
      return new Response("Not found", { status: 404 });
    }
    const bytes = Buffer.from(blob.data, "base64");
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": blob.mime,
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[media] failed to serve image", error);
    return new Response("Failed to serve image", { status: 500 });
  }
}
