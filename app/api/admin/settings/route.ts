import { setSetting } from "@/lib/database";
import { isAdminRequest } from "@/lib/auth";
import { getBranding, toWhatsappLink } from "@/lib/site";

const URL_PATTERN = /^https?:\/\/.+/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

type SettingsBody = {
  whatsapp?: unknown;
  email?: unknown;
  linkedin?: unknown;
  phone?: unknown;
  booking?: unknown;
  logo?: unknown;
  socials?: unknown;
  budgetOptions?: unknown;
  timelineOptions?: unknown;
  phoneRequired?: unknown;
};

const MAX_OPTIONS = 20;
const MAX_OPTION_LENGTH = 80;

/** Validate + normalize a list of option strings (budget/timeline). */
function parseOptions(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const options: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") return null;
    const trimmed = entry.trim().slice(0, MAX_OPTION_LENGTH);
    if (trimmed) options.push(trimmed);
  }
  if (options.length === 0 || options.length > MAX_OPTIONS) return null;
  return options;
}

function isUrl(value: unknown): value is string {
  return typeof value === "string" && (value === "" || URL_PATTERN.test(value.trim()));
}

/** Logo may be an absolute URL or a relative site path (/api/media/<id>). */
function isLogoUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (value === "" || URL_PATTERN.test(value.trim()) || value.trim().startsWith("/"))
  );
}

/** GET /api/admin/settings — authenticated current branding + contact settings. */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const settings = await getBranding();
    return Response.json({ settings });
  } catch (error) {
    console.error("[admin] failed to load settings", error);
    return Response.json({ error: "Failed to load settings." }, { status: 500 });
  }
}

/**
 * PUT /api/admin/settings — authenticated save of branding + contact settings.
 * Accepts any subset of fields; every value is validated and normalized
 * before storage. The public site reads these live (no redeploy needed).
 */
export async function PUT(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: SettingsBody;
  try {
    body = (await request.json()) as SettingsBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const updates: Array<[string, string]> = [];

  if (body.whatsapp !== undefined) {
    if (typeof body.whatsapp !== "string") {
      return Response.json({ error: "Invalid WhatsApp value." }, { status: 400 });
    }
    updates.push(["whatsapp", toWhatsappLink(body.whatsapp)]);
  }

  if (body.email !== undefined) {
    if (
      typeof body.email !== "string" ||
      (body.email.trim() !== "" && !EMAIL_PATTERN.test(body.email.trim()))
    ) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    updates.push(["contact.email", body.email.trim()]);
  }

  for (const [key, label] of [
    ["linkedin", "LinkedIn"],
    ["booking", "Booking"],
  ] as const) {
    const value = body[key];
    if (value === undefined) continue;
    if (!isUrl(value)) {
      return Response.json(
        { error: `${label} must be a full URL (https://…) or empty.` },
        { status: 400 },
      );
    }
    updates.push([`contact.${key}`, value.trim()]);
  }

  if (body.logo !== undefined) {
    if (!isLogoUrl(body.logo)) {
      return Response.json(
        { error: "Logo must be a URL (https://… or /api/media/…) or empty." },
        { status: 400 },
      );
    }
    updates.push(["logo", body.logo.trim()]);
  }

  if (body.phone !== undefined) {
    if (typeof body.phone !== "string") {
      return Response.json({ error: "Invalid phone value." }, { status: 400 });
    }
    updates.push(["contact.phone", body.phone.trim()]);
  }

  if (body.budgetOptions !== undefined) {
    const options = parseOptions(body.budgetOptions);
    if (!options) {
      return Response.json(
        { error: "Budget options must be 1–20 non-empty values." },
        { status: 400 },
      );
    }
    updates.push(["form.budgetOptions", JSON.stringify(options)]);
  }

  if (body.timelineOptions !== undefined) {
    const options = parseOptions(body.timelineOptions);
    if (!options) {
      return Response.json(
        { error: "Timeline options must be 1–20 non-empty values." },
        { status: 400 },
      );
    }
    updates.push(["form.timelineOptions", JSON.stringify(options)]);
  }

  if (body.phoneRequired !== undefined) {
    if (typeof body.phoneRequired !== "boolean") {
      return Response.json({ error: "Invalid phoneRequired value." }, { status: 400 });
    }
    updates.push(["form.phoneRequired", body.phoneRequired ? "true" : "false"]);
  }

  if (body.socials !== undefined) {
    if (!Array.isArray(body.socials)) {
      return Response.json({ error: "Invalid socials value." }, { status: 400 });
    }
    const socials: string[] = [];
    for (const entry of body.socials) {
      if (typeof entry !== "string") {
        return Response.json({ error: "Invalid socials value." }, { status: 400 });
      }
      const trimmed = entry.trim();
      if (!trimmed) continue;
      if (!URL_PATTERN.test(trimmed)) {
        return Response.json(
          { error: "Social links must be full URLs (https://…)." },
          { status: 400 },
        );
      }
      socials.push(trimmed);
    }
    updates.push(["contact.socials", JSON.stringify(socials)]);
  }

  try {
    for (const [key, value] of updates) {
      await setSetting(key, value);
    }
    const settings = await getBranding();
    return Response.json({ settings });
  } catch (error) {
    console.error("[admin] failed to save settings", error);
    return Response.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
