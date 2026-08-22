import site from "@/data/site.json";
import { getSetting } from "@/lib/database";
import type { Branding } from "@/lib/database";

/**
 * Central access to site contact info (docs/05_DATA_MODEL.MD).
 *
 * Static defaults live in data/site.json; every field can be overridden from
 * the admin dashboard (stored in the settings table), so the owner can change
 * contact details and the logo without touching code or redeploying.
 *
 * NOTE: this module imports the database layer ("server-only") — it must
 * never be imported by a client component. Clients read the public values
 * via GET /api/site/settings.
 */
export const contactInfo = site.contact;

/** Placeholder value in data/site.json before a real WhatsApp number is set. */
const WHATSAPP_PLACEHOLDER = "wa.me/00000000000";

/** Normalize a stored WhatsApp value into a wa.me link, or "" when empty/placeholder. */
export function toWhatsappLink(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.includes(WHATSAPP_PLACEHOLDER)) return "";
  // Already a full URL — accept it as-is.
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  // Plain number (with or without +) → wa.me link.
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function parseSocialsStored(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && item.length > 0)
      : [];
  } catch {
    return [];
  }
}

/** Parse a stored JSON list of option strings (budget/timeline). */
function parseOptionsStored(value: string, fallback: string[]): string[] {
  const parsed = parseSocialsStored(value);
  return parsed.length > 0 ? parsed : fallback;
}

/**
 * Full branding + contact settings shown on the public site. Every value
 * falls back to data/site.json; a DB outage degrades to those defaults
 * rather than crashing the request.
 */
const inquiryDefaults = (site as { inquiry?: {
  budgetOptions?: string[];
  timelineOptions?: string[];
  phoneRequired?: boolean;
} }).inquiry ?? {};

export async function getBranding(): Promise<Branding> {
  try {
    const [
      whatsapp,
      email,
      linkedin,
      phone,
      booking,
      socials,
      logo,
      budget,
      timeline,
      phoneRequired,
    ] = await Promise.all([
      getSetting("whatsapp"),
      getSetting("contact.email"),
      getSetting("contact.linkedin"),
      getSetting("contact.phone"),
      getSetting("contact.booking"),
      getSetting("contact.socials"),
      getSetting("logo"),
      getSetting("form.budgetOptions"),
      getSetting("form.timelineOptions"),
      getSetting("form.phoneRequired"),
    ]);
    return {
      whatsapp: toWhatsappLink(whatsapp) || toWhatsappLink(contactInfo.whatsapp),
      email: email || contactInfo.email,
      linkedin: linkedin || contactInfo.linkedin,
      phone,
      booking: booking || contactInfo.booking,
      socials: parseSocialsStored(socials),
      logo,
      budgetOptions: parseOptionsStored(budget, inquiryDefaults.budgetOptions ?? []),
      timelineOptions: parseOptionsStored(timeline, inquiryDefaults.timelineOptions ?? []),
      // Stored value wins when explicitly set; otherwise fall back to the default.
      phoneRequired:
        phoneRequired === "true"
          ? true
          : phoneRequired === "false"
            ? false
            : inquiryDefaults.phoneRequired === true,
    };
  } catch (error) {
    console.warn("[site] settings unavailable — using data/site.json fallback", error);
    return {
      whatsapp: toWhatsappLink(contactInfo.whatsapp),
      email: contactInfo.email,
      linkedin: contactInfo.linkedin,
      phone: "",
      booking: contactInfo.booking,
      socials: [],
      logo: "",
      budgetOptions: inquiryDefaults.budgetOptions ?? [],
      timelineOptions: inquiryDefaults.timelineOptions ?? [],
      phoneRequired: inquiryDefaults.phoneRequired === true,
    };
  }
}

/**
 * The WhatsApp link shown on the site (footer, contact page).
 * Prefers the dashboard setting; falls back to data/site.json. Returns ""
 * while no real number is configured, so a dead link never ships.
 */
export async function whatsappLink(): Promise<string> {
  return (await getBranding()).whatsapp;
}
