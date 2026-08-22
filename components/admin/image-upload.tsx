"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { IconImage, IconRefresh } from "@/components/ui/icons";

type UploadState = { status: "idle" | "uploading"; error?: string };

/**
 * Reusable image upload field for the admin dashboard.
 *
 * Selects a file → compresses client-side (canvas) → POSTs to
 * /api/admin/media → stores the returned public URL via onChange().
 * Same component powers the logo, project covers/galleries, experience
 * logos and the Media Library — no per-feature upload code.
 */
export function ImageUpload({
  value,
  onChange,
  label = "Image",
  hint,
  className,
  aspectClass = "aspect-video",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  className?: string;
  /** Aspect ratio of the preview tile (e.g. "aspect-video" or "aspect-square"). */
  aspectClass?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setState({ status: "uploading" });
    try {
      const compressed = await compressImage(file);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name || "image",
          mime: compressed.mime,
          data: compressed.dataUrl,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        media?: { url: string };
        error?: string;
      };
      if (!response.ok || !data.media) {
        throw new Error(data.error ?? "Upload failed. Please try again.");
      }
      onChange(data.media.url);
      setState({ status: "idle" });
    } catch (error) {
      setState({
        status: "idle",
        error: error instanceof Error ? error.message : "Upload failed. Please try again.",
      });
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-foreground/80">{label}</span>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void handleFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.02] transition-colors",
          dragOver && "border-primary/50 bg-primary/5",
        )}
      >
        {value ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={value}
            alt=""
            className={cn(
              "w-full object-cover transition-opacity",
              aspectClass,
              state.status === "uploading" && "opacity-40",
            )}
          />
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 text-muted",
              aspectClass,
            )}
          >
            <IconImage className="h-6 w-6" />
            <span className="text-xs">No image — a clean placeholder is shown on the site</span>
          </div>
        )}

        {state.status === "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <IconRefresh className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={state.status === "uploading"}
          onClick={() => inputRef.current?.click()}
        >
          {value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Remove
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>

      {state.error ? (
        <p className="text-xs text-red-400">{state.error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
