"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconGear } from "@/components/ui/icons";

/**
 * Project visual — renders the project image when one is set and loads,
 * otherwise a clean gradient placeholder (docs/07_PROJECT_CASE_STUDY_SYSTEM.MD).
 * A broken/missing image never breaks the layout: it silently falls back.
 *
 * Uses a plain <img> on purpose: content is CMS-edited, so image URLs can be
 * /api/media/<id>, /public/… or any external host — the optimizer would
 * reject hosts that aren't preconfigured.
 */
export function ProjectVisual({
  image,
  className,
  priority,
}: {
  image?: string;
  className?: string;
  priority?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(image) && !broken;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-linear-to-br from-primary/15 via-surface to-secondary/15 transition-colors duration-300 group-hover:from-primary/25 group-hover:to-secondary/25",
        className,
      )}
    >
      {showImage && image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={image}
          alt=""
          loading={priority ? "eager" : "lazy"}
          onError={() => setBroken(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <IconGear className="h-10 w-10 text-primary/60 transition-transform duration-300 group-hover:rotate-45" />
        </div>
      )}
    </div>
  );
}
