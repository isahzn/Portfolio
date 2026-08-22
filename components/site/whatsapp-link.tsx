"use client";

import { IconMessage } from "@/components/ui/icons";
import { useBranding } from "@/components/site/branding-provider";

/**
 * WhatsApp link rendered client-side (docs/08_CONTENT_PLAN.MD — contact).
 *
 * The number is set from the admin dashboard and served by /api/site/settings
 * (loaded once by the branding provider), so this always reflects the latest
 * value without a redeploy.
 *
 * - variant="link"  → simple anchor (footer)
 * - variant="card"  → full contact-option card (contact page)
 * Renders nothing while unset.
 */
export function WhatsappLink({ variant = "link" }: { variant?: "link" | "card" }) {
  const { branding } = useBranding();
  const href = branding.whatsapp;

  if (!href) return null;

  if (variant === "card") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-track-click="whatsapp"
        className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-200 hover:border-primary/30 hover:bg-white/[0.05]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-primary transition-colors group-hover:border-primary/30">
          <IconMessage className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">WhatsApp</p>
          <p className="truncate text-sm text-muted">Chat with us</p>
        </div>
      </a>
    );
  }

  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-track-click="whatsapp"
        className="transition-colors hover:text-foreground"
      >
        WhatsApp
      </a>
    </li>
  );
}
