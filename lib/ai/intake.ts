/**
 * Voice Project Intake Agent — shared logic (pure module, client-safe).
 *
 * The demo's AI layer: a system prompt that makes the model act as a voice
 * intake agent, a tolerant JSON parser for its replies, and a keyword-based
 * scripted fallback so the demo keeps working when no AI is configured or the
 * provider is unreachable. No database, no persistence — all state lives in
 * the browser (React state/memory) and resets on refresh.
 */

export type IntakeLead = {
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  service: string | null;
  budget: string | null;
  timeline: string | null;
  extras: string | null;
  description: string | null;
  /** Field keys the prospect chose not to answer ("skip"). */
  skipped: string[];
};

export type IntakeResponse = {
  /** What the agent says aloud. */
  reply: string;
  /** Full merged lead profile (current + newly extracted). */
  lead: IntakeLead;
  /** True when every field is filled or skipped. */
  complete: boolean;
};

export const EMPTY_LEAD: IntakeLead = {
  name: null,
  email: null,
  company: null,
  phone: null,
  service: null,
  budget: null,
  timeline: null,
  extras: null,
  description: null,
  skipped: [],
};

export const LEAD_FIELDS: { key: Exclude<keyof IntakeLead, "skipped">; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "company", label: "Company" },
  { key: "phone", label: "Phone" },
  { key: "service", label: "Service" },
  { key: "budget", label: "Budget" },
  { key: "timeline", label: "Timeline" },
  { key: "extras", label: "Extras" },
  { key: "description", label: "Project description" },
];

const FIELD_KEYS = LEAD_FIELDS.map((field) => field.key);

export const INTAKE_SYSTEM_PROMPT = [
  "You are the Voice Project Intake Agent for Floza, a company that builds AI automations, websites, voice agents, text agents, and custom software.",
  "A visitor is describing a project out loud, and your job is to collect their details conversationally — exactly like a skilled sales assistant would.",
  "",
  "Collect these fields (ask one or two questions at a time, never a long list):",
  "- name: the prospect's name",
  "- email: their best email address",
  "- company: the business name",
  "- phone: a phone number",
  "- service: exactly one of \"AI Automation\", \"Website\", \"Voice Agent\", \"Text Agent\", \"Custom\", \"Not Sure\"",
  "- budget: a price range in plain words, e.g. \"$2,000 – $5,000\"",
  "- timeline: exactly one of \"ASAP\", \"In a week\", \"In a few months\"",
  "- extras: anything else they want included",
  "- description: a short project description in their own words",
  "",
  "Rules:",
  "- The current lead profile (fields already known) is provided below. Never re-ask for a field that is already filled or in the skipped list.",
  "- People often share several details in one sentence — extract every field you can and briefly confirm what you captured (e.g. \"Great — Sarah from ABC Accounting, got it.\").",
  "- If the prospect says they don't want to answer a field, add that field key to the skipped list and move on. Never push.",
  "- Use natural, warm spoken language. Keep replies to 1-3 short sentences because they are read aloud.",
  "- When every field is either filled or in the skipped list, set \"complete\" to true and close warmly with next steps.",
  "",
  "Respond ONLY with a single JSON object in exactly this shape (no markdown, no extra words):",
  '{"reply":"what you say aloud","lead":{"name":"","email":"","company":"","phone":"","service":"","budget":"","timeline":"","extras":"","description":"","skipped":[]},"complete":false}',
  "Use null for fields not known yet. Lead values must be short, plain strings.",
].join("\n");

/** Restrict an unknown payload to a valid IntakeLead (used for API input). */
export function sanitizeLead(payload: unknown): IntakeLead {
  const source = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const lead: IntakeLead = { ...EMPTY_LEAD };

  for (const key of FIELD_KEYS) {
    const value = source[key];
    if (typeof value === "string" && value.trim() && value.trim().toLowerCase() !== "null") {
      lead[key] = value.trim().slice(0, 200);
    }
  }

  if (Array.isArray(source.skipped)) {
    lead.skipped = source.skipped.filter(
      (key): key is string => typeof key === "string" && FIELD_KEYS.includes(key as (typeof FIELD_KEYS)[number]),
    );
  }
  return lead;
}

/** Merge newly extracted values into the current lead, returning a fresh object. */
function mergeLeads(current: IntakeLead, incoming: unknown): IntakeLead {
  const next: IntakeLead = { ...current, skipped: [...current.skipped] };
  if (!incoming || typeof incoming !== "object") return next;
  const source = incoming as Record<string, unknown>;

  for (const key of FIELD_KEYS) {
    const value = source[key];
    if (typeof value === "string" && value.trim() && value.trim().toLowerCase() !== "null") {
      next[key] = value.trim().slice(0, 200);
    }
  }
  if (Array.isArray(source.skipped)) {
    for (const key of source.skipped) {
      if (typeof key === "string" && FIELD_KEYS.includes(key as (typeof FIELD_KEYS)[number]) && !next.skipped.includes(key)) {
        next.skipped.push(key);
      }
    }
  }
  return next;
}

/**
 * Tolerant JSON extraction from an AI reply: strips markdown fences, grabs the
 * outermost object, and normalizes it. Returns null when the reply isn't usable
 * so callers can fall back gracefully.
 */
export function parseIntakeResponse(raw: string, current: IntakeLead): IntakeResponse | null {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  let data: unknown;
  try {
    data = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;

  const object = data as Record<string, unknown>;
  const reply = typeof object.reply === "string" ? object.reply.trim().slice(0, 600) : "";
  if (!reply) return null;

  return {
    reply,
    lead: mergeLeads(current, object.lead),
    complete: object.complete === true,
  };
}

const SERVICE_KEYWORDS: [RegExp, string][] = [
  [/(voice|talk to|conversational ai|voice agent)/i, "Voice Agent"],
  [/(text agent|whatsapp|sms|chatbot|chat bot|texting)/i, "Text Agent"],
  [/(website|landing page|\bsite\b)/i, "Website"],
  [/(custom|bespoke|from scratch)/i, "Custom"],
  [/(automation|\bai\b|ai agent|agent)/i, "AI Automation"],
];

const SKIP_PHRASE = /(skip|pass on|no thanks|rather not|prefer not|don'?t want to|don'?t know|i'?m not sure about|i won'?t)/i;

function isComplete(lead: IntakeLead): boolean {
  return FIELD_KEYS.every((key) => lead[key] !== null || lead.skipped.includes(key));
}

function nextQuestion(lead: IntakeLead, userName: string | null): string {
  if (!lead.name) return "Let's start with your name — what should I call you?";
  if (!lead.email) {
    return userName ? `Thanks, ${userName}! What's the best email to reach you?` : "What's the best email to reach you?";
  }
  if (!lead.company) return "Which company or business is this project for?";
  if (!lead.phone) return "Got a phone number I can use — or you can skip that if you prefer.";
  if (!lead.service) {
    return "Which service are you after — AI Automation, a Website, Voice Agent, Text Agent, Custom, or are you not sure yet?";
  }
  if (!lead.budget) return "What's your budget range for this project?";
  if (!lead.timeline) return "When would you like to start — ASAP, in a week, or in a few months?";
  if (!lead.extras) return "Anything else you'd like to include — extra features, integrations, preferences?";
  return "Last one — in a sentence or two, what are you looking to build?";
}

/**
 * Keyword-based fallback intake agent. Extracts what it can from free speech
 * (email/phone via regex, the rest via phrases), marks fields as skipped when
 * the prospect declines, and asks for the first missing field.
 */
export function getScriptedIntakeReply(message: string, current: IntakeLead): IntakeResponse {
  const text = message.trim();
  const lead: IntakeLead = { ...current, skipped: [...current.skipped] };
  const saysSkip = SKIP_PHRASE.test(text);

  const add = (key: (typeof FIELD_KEYS)[number], value: string | null, skip: boolean) => {
    if (value) {
      lead[key] = value.slice(0, 200);
      lead.skipped = lead.skipped.filter((entry) => entry !== key);
    } else if (skip && lead[key] === null && !lead.skipped.includes(key)) {
      lead.skipped.push(key);
    }
  };

  if (lead.email === null) {
    add("email", text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0]?.toLowerCase() ?? null, saysSkip);
  }
  if (lead.phone === null) {
    const match = text.match(/\+?\d[\d\s().-]{7,}\d/);
    add("phone", match ? match[0].replace(/[\s()-]/g, "") : null, saysSkip);
  }
  if (lead.name === null) {
    const match = text.match(/(?:my name is|i'?m|i am|call me)\s+([A-Za-z][A-Za-z' -]{1,40})/i);
    add("name", match ? match[1].trim().split(/\s+/).slice(0, 2).join(" ") : null, saysSkip);
  }
  if (lead.company === null) {
    const match = text.match(/(?:i (?:work|run|own)|the company is|company is|for my company)\s+(?:at|for|with)?\s*(.+?)[.,!?]?$/i);
    add("company", match ? match[1].trim().split(/\s+/).slice(0, 4).join(" ") : null, saysSkip);
  }
  if (lead.service === null) {
    let service: string | null = null;
    if (/\bnot sure\b|unsure|don'?t know/.test(text) && !SERVICE_KEYWORDS.some(([pattern]) => pattern.test(text))) {
      service = "Not Sure";
    } else {
      for (const [pattern, value] of SERVICE_KEYWORDS) {
        if (pattern.test(text)) {
          service = value;
          break;
        }
      }
    }
    add("service", service, saysSkip);
  }
  if (lead.budget === null) {
    const range = text.match(/\$?\s?(\d[\d,]*(?:\.\d+)?)\s*[-–—to]+\s*\$?\s?(\d[\d,]*(?:\.\d+)?)/i);
    const under = text.match(/(?:under|less than)\s+\$?\s?(\d[\d,]+)/i);
    const over = text.match(/(?:over|above|more than)\s+\$?\s?(\d[\d,]+)/i);
    const single = text.match(/\$\s?(\d[\d,]*(?:\.\d+)?)/i);
    let budget: string | null = null;
    if (range) budget = `$${range[1]} – $${range[2]}`;
    else if (under) budget = `Under $${under[1]}`;
    else if (over) budget = `$${over[1]}+`;
    else if (single) budget = `$${single[1]}`;
    add("budget", budget, saysSkip);
  }
  if (lead.timeline === null) {
    let timeline: string | null = null;
    if (/(asap|right away|immediately|urgent|\bnow\b|soon)/i.test(text)) timeline = "ASAP";
    else if (/\bin a week\b|next week|within a week/i.test(text)) timeline = "In a week";
    else if (/(month|months)/i.test(text)) timeline = "In a few months";
    else if (/\bnot sure\b|unsure|flexible/i.test(text)) timeline = "Not sure yet";
    add("timeline", timeline, saysSkip);
  }
  if (lead.extras === null) {
    const match = text.match(/(?:also|plus|additionally|as well)\s+(?:i )?(?:want|need|like|would like)?\s*(.+?)[.,!?]?$/i);
    add("extras", match ? match[1].trim() : null, saysSkip);
  }
  if (lead.description === null) {
    const match = text.match(
      /(?:i want|i need|we want|we need|looking for|i'?d like|i would like|i'?m looking to|want to|need to|build me)\s+(.+?)[.,!?]?$/i,
    );
    add("description", match ? match[1].trim().split(/\s+/).slice(0, 20).join(" ") : null, saysSkip);
  }

  if (isComplete(lead)) {
    return {
      reply:
        "That's everything I need — your project brief is complete and ready for the Floza team. Thanks for your time!",
      lead,
      complete: true,
    };
  }

  return {
    reply: nextQuestion(lead, lead.name),
    lead,
    complete: false,
  };
}
