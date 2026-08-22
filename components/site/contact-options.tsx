"use client";

import { IconCalendar, IconGlobe, IconLinkedin, IconMail, IconPhone } from "@/components/ui/icons";
import { useBranding } from "@/components/site/branding-provider";
import { WhatsappLink } from "@/components/site/whatsapp-link";

/**
 * Contact page "Direct contact" cards — fully driven by the dashboard
 * settings. Optional entries (phone, booking, WhatsApp, socials) only render
 * once configured, and the whole block reflects saves instantly.
 */
export function ContactOptions() {
  const { branding } = useBranding();

  const options: Array<{ label: string; value: string; href: string; icon: typeof IconMail }> = [];

  if (branding.email) {
    options.push({
      label: "Email",
      value: branding.email,
      href: `mailto:${branding.email}`,
      icon: IconMail,
    });
  }
  if (branding.phone) {
    options.push({
      label: "Phone",
      value: branding.phone,
      href: `tel:${branding.phone}`,
      icon: IconPhone,
    });
  }
  if (branding.linkedin) {
    options.push({
      label: "LinkedIn",
      value: "Connect on LinkedIn",
      href: branding.linkedin,
      icon: IconLinkedin,
    });
  }
  if (branding.booking) {
    options.push({
      label: "Book a call",
      value: "Pick a time",
      href: branding.booking,
      icon: IconCalendar,
    });
  }

  const external = (href: string) =>
    href.startsWith("http") ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};

  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <a
          key={option.label}
          href={option.href}
          data-track-click={
            option.label === "Book a call" ? "book-call" : option.label.toLowerCase()
          }
          {...external(option.href)}
          className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-200 hover:border-primary/30 hover:bg-white/[0.05]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-primary transition-colors group-hover:border-primary/30">
            <option.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{option.label}</p>
            <p className="truncate text-sm text-muted">{option.value}</p>
          </div>
        </a>
      ))}
      {/* Dashboard-set WhatsApp number — appears automatically. */}
      <WhatsappLink variant="card" />

      {branding.socials.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {branding.socials.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted transition-colors hover:border-white/25 hover:text-foreground"
            >
              <IconGlobe className="h-3.5 w-3.5" />
              {new URL(url).hostname.replace(/^www\./, "")}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
