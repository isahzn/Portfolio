import { createLead, getSetting } from "@/lib/database";
import type { LeadInput } from "@/lib/database";
import { sendLeadNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const LIMITS = {
  name: 100,
  email: 200,
  company: 200,
  phone: 40,
  message: 5000,
  option: 100,
};

/** A phone is valid when it has 7–15 digits (spaces, +, - and () allowed). */
function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

const SUBMISSIONS_PER_HOUR = 5;

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function validateLead(
  payload: unknown,
): Promise<{ data?: LeadInput; errors?: Record<string, string> }> {
  const body = (payload ?? {}) as Record<string, unknown>;
  const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

  const name = str(body.name).slice(0, LIMITS.name);
  const email = str(body.email).slice(0, LIMITS.email);
  const company = str(body.company).slice(0, LIMITS.company);
  const phone = str(body.phone).slice(0, LIMITS.phone);
  const message = str(body.message).slice(0, LIMITS.message);
  const service = str(body.service).slice(0, LIMITS.option) || undefined;
  const budget = str(body.budget).slice(0, LIMITS.option) || undefined;
  const timeline = str(body.timeline).slice(0, LIMITS.option) || undefined;

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Please enter a valid email address.";
  if (!company) errors.company = "Please enter your company name.";
  if (phone && !isValidPhone(phone)) {
    errors.phone = "Please enter a valid phone number.";
  } else if (!phone) {
    // The dashboard can require a phone number on the inquiry form.
    const phoneRequired =
      (await getSetting("form.phoneRequired").catch(() => "")) === "true";
    if (phoneRequired) errors.phone = "Please enter your phone number.";
  }
  if (message.length < 10) errors.message = "Tell us a little more (at least 10 characters).";

  if (Object.keys(errors).length > 0) return { errors };
  return {
    data: { name, email, company, phone: phone || undefined, service, budget, timeline, message },
  };
}

/**
 * POST /api/leads (docs/03_TECH_ARCHITECTURE.MD, docs/09_SECURITY_AND_PRIVACY.MD).
 * Validates, stores, and notifies about a new lead. The contact form posts here.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`lead:${ip}`, SUBMISSIONS_PER_HOUR, 60 * 60 * 1000).ok) {
    return Response.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { data, errors } = await validateLead(payload);
  if (errors) {
    return Response.json({ errors }, { status: 400 });
  }

  try {
    const lead = await createLead(data!);
    await sendLeadNotification(lead);
    return Response.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("[leads] failed to store lead", error);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
