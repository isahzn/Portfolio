import "server-only";
import { createMedia, deleteMedia, getMediaBlob as readBlob } from "@/lib/database";

/**
 * Media storage (docs/03_TECH_ARCHITECTURE.MD #13, docs/10_DEPLOYMENT_PLAN.MD #14).
 *
 * Uploaded images are stored as base64 blobs inside the database layer so
 * the feature works identically on Vercel, a VPS, or local development with
 * zero external services. The public URL is /api/media/<id>, which streams
 * the blob with long-lived cache headers (CDN-friendly).
 *
 * If Floza later moves to S3/VPS object storage, only THIS file changes:
 *   - createMediaBlob()  → upload the bytes and store the object URL
 *   - getMediaBlob()     → fetch from the object store instead of the DB
 *   - deleteMediaBlob()  → delete the object
 * Everything else (routes, admin UI, content) keeps working untouched.
 */

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/** Max raw image bytes (kept under Vercel's ~4.5MB body limit incl. base64). */
export const MAX_UPLOAD_BYTES = 2_500_000;

export type StoredBlob = { id: string; url: string; mime: string; size: number };

export type StoreMediaInput = {
  /** Raw base64 data URI or plain base64 (e.g. from a canvas/dataURL). */
  data: string;
  filename: string;
  mime: string;
};

/** Validate an upload payload. Returns an error message or null. */
export function validateUpload({ data, mime, filename }: StoreMediaInput): string | null {
  if (!filename || typeof filename !== "string") return "A file name is required.";
  if (!ALLOWED_MIME.has(mime)) {
    return "Unsupported file type. Upload a JPG, PNG, WebP, GIF or AVIF image.";
  }
  if (typeof data !== "string" || data.length === 0) return "No image data received.";
  // Reject SVG-like payloads and anything not starting with the image prefix.
  const raw = data.startsWith("data:") ? data.split(",")[1] ?? "" : data;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(raw.slice(0, 200))) return "Invalid image data.";
  const size = Math.floor((raw.length * 3) / 4);
  if (size > MAX_UPLOAD_BYTES) {
    return `Image is too large (${Math.round(size / 1024 / 1024)}MB). Max is ${Math.floor(
      MAX_UPLOAD_BYTES / 1024 / 1024,
    )}MB — the upload tool compresses images automatically.`;
  }
  return null;
}

/** Store an uploaded image and return its public asset record. */
export async function createMediaBlob(input: StoreMediaInput): Promise<StoredBlob> {
  const raw = input.data.startsWith("data:") ? input.data.split(",")[1] ?? "" : input.data;
  const size = Math.floor((raw.length * 3) / 4);
  const id = crypto.randomUUID();
  const url = `/api/media/${id}`;
  await createMedia({
    id,
    url,
    filename: input.filename,
    mime: input.mime,
    size,
    data: raw,
  });
  return { id, url, mime: input.mime, size };
}

/** Delete an uploaded image. */
export async function deleteMediaBlob(id: string): Promise<boolean> {
  return deleteMedia(id);
}

/** Read an image blob for the public proxy. */
export async function getMediaBlob(
  id: string,
): Promise<{ mime: string; data: string } | null> {
  return readBlob(id);
}

/** Media ID → public URL helper. */
export function mediaUrl(id: string): string {
  return `/api/media/${id}`;
}
