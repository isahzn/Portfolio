"use client";

import { IconGlobe } from "@/components/ui/icons";
import { useBranding } from "@/components/site/branding-provider";
import { WhatsappLink } from "@/components/site/whatsapp-link";

/**
 * Footer contact column — driven by the dashboard settings (email, phone,
 * WhatsApp, LinkedIn, socials). Renders nothing for unset values, so a
 * half-configured contact section never looks broken.
 */
export function FooterContact() {
  const { branding } = useBranding();

  return (
    <ul className="flex flex-col gap-2 text-sm text-muted">
      {branding.email && (
        <li>
          <a
            href={`mailto:${branding.email}`}
            className="transition-colors hover:text-foreground"
          >
            {branding.email}
          </a>
        </li>
      )}
      {branding.phone && (
        <li>
          <a href={`tel:${branding.phone}`} className="transition-colors hover:text-foreground">
            {branding.phone}
          </a>
        </li>
      )}
      <WhatsappLink variant="link" />
      {branding.linkedin && (
        <li>
          <a
            href={branding.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            LinkedIn
          </a>
        </li>
      )}
      {branding.socials.map((url) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <IconGlobe className="h-3.5 w-3.5" />
            {new URL(url).hostname.replace(/^www\./, "")}
          </a>
        </li>
      ))}
    </ul>
  );
}
