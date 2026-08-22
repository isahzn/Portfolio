import { isAdminRequest } from "@/lib/auth";
import { listMedia } from "@/lib/database";
import { createMediaBlob, validateUpload } from "@/lib/storage";

/** GET /api/admin/media — authenticated list of the Media Library. */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const media = await listMedia();
    return Response.json({ media });
  } catch (error) {
    console.error("[admin] failed to load media", error);
    return Response.json({ error: "Failed to load media." }, { status: 500 });
  }
}

/**
 * POST /api/admin/media — authenticated image upload.
 * Body: { filename, mime, data } where data is a base64 data URL (the admin
 * UI compresses images client-side before sending).
 */
export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { filename?: unknown; mime?: unknown; data?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const filename = typeof body.filename === "string" ? body.filename : "";
  const mime = typeof body.mime === "string" ? body.mime : "";
  const data = typeof body.data === "string" ? body.data : "";

  const invalid = validateUpload({ data, filename, mime });
  if (invalid) {
    return Response.json({ error: invalid }, { status: 400 });
  }

  try {
    const asset = await createMediaBlob({ data, filename, mime });
    return Response.json({ media: asset }, { status: 201 });
  } catch (error) {
    console.error("[admin] failed to store upload", error);
    return Response.json({ error: "Failed to store the image." }, { status: 500 });
  }
}
