/**
 * Dynamic data types (docs/05_DATA_MODEL.MD): leads, conversations,
 * projects, experiences, media, analytics and settings stored in the
 * database layer, separate from static content (data/*.json).
 */

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

export type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  /** Phone number (optional unless the inquiry form requires it). */
  phone?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
};

export type LeadInput = Omit<Lead, "id" | "status" | "createdAt">;

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type Conversation = {
  id: string;
  visitorId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* CMS content (editable from the admin dashboard)                     */
/* ------------------------------------------------------------------ */

/** External links shown on a case study (all optional). */
export type ProjectLinks = {
  live?: string;
  github?: string;
  caseStudy?: string;
};

/**
 * A portfolio project / case study. Stored in the `projects` table and
 * seeded from data/projects.json on first run, then fully editable from
 * the admin dashboard.
 */
export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  /** Cover image URL (public path or /api/media/<id>). Empty = placeholder. */
  image: string;
  /** Additional gallery image URLs. */
  gallery: string[];
  featured: boolean;
  /** Admin-controlled display order (lower first). */
  orderIndex: number;
  problem?: string;
  solution?: string;
  workflow?: string[];
  results?: string[];
  technologies?: string[];
  links?: ProjectLinks;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = Omit<
  Project,
  "id" | "orderIndex" | "createdAt" | "updatedAt"
>;

/**
 * A "Previous Experience" entry — a company/client Floza has worked with.
 * Stored in the `experiences` table.
 */
export type Experience = {
  id: string;
  company: string;
  /** The project / engagement title (e.g. "Invoice automation platform"). */
  projectTitle: string;
  description: string;
  technologies: string[];
  /** Display date, e.g. "2025" or "2025-03" or free text. */
  completionDate: string;
  /** Company logo URL (public path or /api/media/<id>). Empty = monogram placeholder. */
  logo: string;
  orderIndex: number;
  createdAt: string;
};

export type ExperienceInput = Omit<Experience, "id" | "orderIndex" | "createdAt">;

/** An uploaded image in the Media Library. Data is stored via lib/storage. */
export type MediaAsset = {
  id: string;
  /** Public URL used in content (e.g. /api/media/<id>). */
  url: string;
  filename: string;
  mime: string;
  size: number;
  createdAt: string;
};

/** Branding + contact settings surfaced on the public site. */
export type Branding = {
  email: string;
  linkedin: string;
  phone: string;
  whatsapp: string;
  booking: string;
  /** Social profile URLs (Instagram, X, …) shown in the footer. */
  socials: string[];
  /** Logo image URL (empty = built-in gradient mark). */
  logo: string;
  /** Inquiry-form configuration (editable from the dashboard). */
  budgetOptions: string[];
  timelineOptions: string[];
  phoneRequired: boolean;
};

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export type AnalyticsEventType =
  | "pageview"
  | "view"
  | "impression"
  | "click"
  | "duration";

export type AnalyticsEvent = {
  type: AnalyticsEventType;
  /** Page path for pageview/duration events. */
  path?: string;
  /** Entity kind for view/impression events (project / service). */
  entity?: "project" | "service";
  /** Entity slug (project slug, service title). */
  slug?: string;
  /** Click target id: book-call | contact | whatsapp | project-card | contact-form. */
  target?: string;
  /** Numeric value (seconds spent for duration events). */
  value?: number;
  /** Random per-session id for unique-visitor estimates. */
  sessionId?: string;
  /** document.referrer for the pageview. */
  referrer?: string;
  createdAt?: string;
};
