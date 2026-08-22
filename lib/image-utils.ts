/**
 * Client-side image compression (browser-only — never import from a server
 * component). Keeps uploads small (Vercel body limit + database blobs) by
 * downscaling to a sensible max dimension and re-encoding at descending
 * quality until the payload fits the upload cap.
 */

export const MAX_IMAGE_DIMENSION = 1400;
/** Slightly under the server's MAX_UPLOAD_BYTES to leave JSON/base64 slack. */
const CLIENT_CAP_BYTES = 2_400_000;

/** Formats the canvas can re-encode losslessly-ish; others pass through raw. */
const PROCESSABLE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export type CompressedImage = {
  /** Base64 data URL ready for POST /api/admin/media. */
  dataUrl: string;
  mime: string;
  /** Approximate byte size of the decoded image. */
  size: number;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the image."));
    image.src = src;
  });
}

function dataUrlSize(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

/**
 * Prepare a selected image for upload: downscale + re-encode when possible,
 * otherwise pass through (GIF/AVIF) unchanged.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const mime = file.type || "image/jpeg";

  if (!PROCESSABLE_MIME.has(mime)) {
    // Animated GIFs, AVIF, etc. — upload raw (still size-checked by the server).
    const dataUrl = await fileToDataUrl(file);
    return { dataUrl, mime, size: file.size };
  }

  const dataUrlRaw = await fileToDataUrl(file);
  const image = await loadImage(dataUrlRaw);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return { dataUrl: dataUrlRaw, mime, size: file.size };
  }
  context.drawImage(image, 0, 0, width, height);

  // Quality ladder: keep the highest quality that fits the cap.
  for (const quality of [0.85, 0.7, 0.55]) {
    const dataUrl = canvas.toDataURL(mime, quality);
    if (dataUrlSize(dataUrl) <= CLIENT_CAP_BYTES) {
      return { dataUrl, mime, size: dataUrlSize(dataUrl) };
    }
  }

  const dataUrl = canvas.toDataURL(mime, 0.5);
  return { dataUrl, mime, size: dataUrlSize(dataUrl) };
}

/** Human-readable file size, e.g. "412 KB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
