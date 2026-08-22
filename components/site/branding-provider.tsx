"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import site from "@/data/site.json";

/**
 * Public branding + contact settings, loaded client-side from
 * /api/site/settings (docs/08_CONTENT_PLAN.MD — contact).
 *
 * The dashboard is the source of truth (set under /admin → Settings); while
 * it loads, data/site.json defaults render so nothing flashes. Because the
 * fetch happens on every page load, edits appear instantly — no redeploy.
 */

export type PublicBranding = {
  whatsapp: string;
  email: string;
  linkedin: string;
  phone: string;
  booking: string;
  socials: string[];
  logo: string;
  /** Inquiry-form configuration (editable from the dashboard). */
  budgetOptions: string[];
  timelineOptions: string[];
  phoneRequired: boolean;
};

const inquiryDefaults =
  (site as { inquiry?: { budgetOptions?: string[]; timelineOptions?: string[]; phoneRequired?: boolean } })
    .inquiry ?? {};

const FALLBACK: PublicBranding = {
  whatsapp: "",
  email: site.contact.email,
  linkedin: site.contact.linkedin,
  phone: "",
  booking: site.contact.booking,
  socials: [],
  logo: "/logo.jpg",
  budgetOptions: inquiryDefaults.budgetOptions ?? [],
  timelineOptions: inquiryDefaults.timelineOptions ?? [],
  phoneRequired: inquiryDefaults.phoneRequired === true,
};

type BrandingContextValue = {
  branding: PublicBranding;
  loading: boolean;
};

const BrandingContext = createContext<BrandingContextValue>({
  branding: FALLBACK,
  loading: true,
});

export function SiteBrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<PublicBranding>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site/settings")
      .then((response) => (response.ok ? (response.json() as Promise<{ settings: PublicBranding }>) : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.settings) {
          const settings = data.settings;
          setBranding({
            ...FALLBACK,
            ...settings,
            socials: Array.isArray(settings.socials) ? settings.socials : [],
            budgetOptions:
              Array.isArray(settings.budgetOptions) && settings.budgetOptions.length > 0
                ? settings.budgetOptions
                : FALLBACK.budgetOptions,
            timelineOptions:
              Array.isArray(settings.timelineOptions) && settings.timelineOptions.length > 0
                ? settings.timelineOptions
                : FALLBACK.timelineOptions,
            phoneRequired:
              typeof settings.phoneRequired === "boolean"
                ? settings.phoneRequired
                : FALLBACK.phoneRequired,
          });
        }
      })
      .catch(() => {
        // Keep defaults on failure.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

/** Read the current branding (navbar, footer, contact page). */
export function useBranding(): BrandingContextValue {
  return useContext(BrandingContext);
}
