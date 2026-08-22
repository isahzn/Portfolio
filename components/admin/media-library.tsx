"use client";

import { useEffect, useState } from "react";
import type { MediaAsset } from "@/lib/database";
import { adminFetch, handleLoadError } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image-upload";
import { IconCheck, IconPlus, IconTrash } from "@/components/ui/icons";
import { formatBytes } from "@/lib/image-utils";

/**
 * Admin Media Library — every uploaded image in one place, reusable across
 * projects, experience logos and branding. Upload here or directly in a form
 * (same ImageUpload flow), copy the URL, or delete.
 */
export function MediaLibrary() {
  const [items, setItems] = useState<MediaAsset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function refresh() {
    adminFetch<{ media: MediaAsset[] }>("/api/admin/media")
      .then((data) => {
        setItems(data.media);
        setError(null);
      })
      .catch((loadError) => handleLoadError(loadError, setError));
  }

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ media: MediaAsset[] }>("/api/admin/media")
      .then((data) => {
        if (!cancelled) {
          setItems(data.media);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (!cancelled) handleLoadError(loadError, setError);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function copyUrl(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard may be unavailable — ignore.
    }
  }

  async function remove(asset: MediaAsset) {
    if (!window.confirm(`Delete "${asset.filename}"?`)) return;
    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed.");
      setItems((current) => current?.filter((item) => item.id !== asset.id) ?? null);
    } catch {
      setError("Could not delete the image.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Images you upload here are stored once and can be reused anywhere — project covers,
          galleries, logos and more.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted">
          <IconPlus className="h-3.5 w-3.5" />
          Use the upload box below
        </div>
      </div>

      <ImageUpload
        value=""
        onChange={refresh}
        label="Upload image"
        hint="Compressed automatically. JPG, PNG, WebP, GIF and AVIF supported."
        aspectClass="aspect-[16/5]"
      />

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            Retry
          </Button>
        </div>
      )}

      {items === null ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10">
          <span className="text-sm text-muted">Loading…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/15 text-sm text-muted">
          No images yet. Upload your first image above.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((asset) => (
            <div
              key={asset.id}
              className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
            >
              <div className="relative aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.filename}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Delete image"
                  onClick={() => void remove(asset)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-background/70 text-muted opacity-0 backdrop-blur transition-opacity hover:border-red-400/40 hover:text-red-300 group-hover:opacity-100"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{asset.filename}</p>
                  <p className="text-[11px] text-muted">{formatBytes(asset.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyUrl(asset.url, asset.id)}
                  className="flex h-7 shrink-0 items-center gap-1 rounded-md border border-white/10 px-2 text-[11px] text-muted transition-colors hover:border-white/25 hover:text-foreground"
                >
                  {copiedId === asset.id ? (
                    <>
                      <IconCheck className="h-3 w-3" /> Copied
                    </>
                  ) : (
                    "Copy URL"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
