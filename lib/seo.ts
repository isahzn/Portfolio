import type { Metadata } from "next";
import { contactInfo } from "@/lib/site";

/**
 * Central SEO configuration (docs/11_DEPLOYMENT_ROADMAP.MD — Phase 7).
 *
 * One source of truth for the canonical site URL, the per-page metadata
 * helper (title, description, canonical, Open Graph, Twitter), and the
 * site-wide JSON-LD structured data (docs/08_CONTENT_PLAN.MD — SEO).
 */
export const SITE_NAME = "Floza";
export const SITE_TAGLINE = "AI Automation & Software Solutions";
export const SITE_DESCRIPTION =
  "Floza builds AI-powered automations, websites, and software systems that help businesses work faster.";

function resolveSiteUrl(): string {
  // Priority: explicit env → Vercel's auto-injected production URL → fallback.
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (fromEnv) return fromEnv;

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  // docs/10_DEPLOYMENT_PLAN.MD: floza.vercel.app first, custom domain later.
  return process.env.NODE_ENV === "production"
    ? "https://floza.vercel.app"
    : "http://localhost:3000";
}

/** Canonical absolute origin, e.g. `https://floza.vercel.app` (no trailing slash). */
export const SITE_URL = resolveSiteUrl();

/** Absolute URL for a site path, e.g. `/services` → `https://…/services`. */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "" : normalized}`;
}

/**
 * Share preview image (app/opengraph-image.tsx, 1200×630).
 * Referenced explicitly because Next does not auto-inject the meta tag
 * for a file-convention image when custom openGraph metadata is exported.
 */
export const OG_IMAGE = {
  url: absoluteUrl("/opengraph-image"),
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
} as const;

/** A plain schema.org JSON-LD object. */
export type JsonLdObject = Record<string, unknown>;

/**
 * Organization schema (schema.org/Organization) — site-wide identity used
 * for knowledge-panel-style rich results. Consumes real brand data from
 * `data/site.json` so contact info stays in one place.
 */
export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    description: SITE_DESCRIPTION,
    email: contactInfo.email,
    // WhatsApp is a placeholder (wa.me/000…) — only real profiles go here.
    sameAs: [contactInfo.linkedin].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: contactInfo.email,
      url: absoluteUrl("/contact"),
      availableLanguage: "English",
    },
  };
}

/** WebSite schema (schema.org/WebSite) linking back to the Organization. */
export function webSiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * Serialized site-wide JSON-LD (Organization + WebSite) for the <script> tag.
 * `<` is escaped (Google best practice) so no future dynamic value can ever
 * break out of the script tag.
 */
export function siteJsonLd(): string {
  return JSON.stringify([organizationJsonLd(), webSiteJsonLd()]).replace(
    /</g,
    "\\u003c"
  );
}

/**
 * Build the metadata for a public page. `title` is the page name only —
 * the root layout's title template appends "— Floza".
 */
export function buildMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE_NAME}`,
      description,
      images: [OG_IMAGE],
    },
  };
}
