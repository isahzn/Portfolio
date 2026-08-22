"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBranding } from "@/components/site/branding-provider";

/**
 * Floza brand logo (docs/04_COMPONENT_LIBARY.MD, floza-redesign.html).
 *
 * Mono "FLOZA" wordmark with the logo image inside a bordered square mark —
 * the dashboard setting (logo uploaded in /admin → Settings) or the bundled
 * public/logo.jpg. Falls back to a bordered "F" tile if the image fails.
 */
export function Logo() {
  const { branding } = useBranding();
  const [broken, setBroken] = useState(false);

  const src = branding.logo || "/logo.jpg";

  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Floza — home">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-border bg-surface transition-colors duration-200 group-hover:border-faint">
        {broken ? (
          <span className="flex h-full w-full items-center justify-center font-mono text-[11px] text-primary">
            F
          </span>
        ) : (
          <Image
            src={src}
            alt="Floza logo"
            width={28}
            height={28}
            className="h-6 w-6 object-contain"
            onError={() => setBroken(true)}
            priority
          />
        )}
      </span>
      <span className="font-mono text-sm font-medium tracking-[0.02em] text-foreground">
        FLOZA
      </span>
    </Link>
  );
}
