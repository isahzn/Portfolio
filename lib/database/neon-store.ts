import "server-only";
import { neon } from "@neondatabase/serverless";
import { defaultProjects } from "@/lib/content";
import type {
  AnalyticsEvent,
  ChatMessage,
  Conversation,
  Experience,
  ExperienceInput,
  Lead,
  LeadInput,
  LeadStatus,
  MediaAsset,
  Project,
  ProjectInput,
} from "./types";
import {
  ANALYTICS_INDEX_SCHEMA,
  ANALYTICS_SCHEMA,
  CONVERSATION_INDEX_SCHEMA,
  CONVERSATION_SCHEMA,
  EXPERIENCES_SCHEMA,
  LEAD_PHONE_SCHEMA,
  LEAD_SCHEMA,
  MEDIA_SCHEMA,
  PROJECTS_SCHEMA,
  SETTINGS_SCHEMA,
} from "./schema";

const connectionString = process.env.DATABASE_URL;

// neon() validates the connection string and throws on malformed input — a
// bad or partially-pasted DATABASE_URL must never crash the app. If it fails,
// we degrade to the in-memory store and log a clear warning.
let sql: ReturnType<typeof neon> | null = null;
if (connectionString) {
  try {
    sql = neon(connectionString);
  } catch (error) {
    console.warn(
      "[database] DATABASE_URL is set but not a valid Postgres connection string — using the in-memory fallback store.",
      error instanceof Error ? error.message : error,
    );
  }
}

/** Whether the Neon client initialised successfully (used by index.ts). */
export const neonAvailable = sql !== null;

let schemaPromise: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!sql) return Promise.reject(new Error("DATABASE_URL is not configured."));
  // One statement per query (Postgres rejects multiple commands in one prepared
  // statement) AND applied sequentially: running CREATE TABLE concurrently has
  // been observed to race (e.g. an index statement landing before its table),
  // which poisons schema initialisation. Sequential + idempotent = safe.
  schemaPromise ??= (async () => {
    const statements = [
      LEAD_SCHEMA,
      LEAD_PHONE_SCHEMA,
      CONVERSATION_SCHEMA,
      CONVERSATION_INDEX_SCHEMA,
      SETTINGS_SCHEMA,
      PROJECTS_SCHEMA,
      EXPERIENCES_SCHEMA,
      MEDIA_SCHEMA,
      ANALYTICS_SCHEMA,
      ANALYTICS_INDEX_SCHEMA,
    ];
    for (const statement of statements) {
      await sql!.query(statement);
    }
  })().catch((error) => {
    // Reset so a later request can retry (a transient error must not poison the app).
    schemaPromise = null;
    throw error;
  });
  return schemaPromise;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function bool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function parseJsonArray(value: unknown): string[] {
  try {
    const parsed = JSON.parse(str(value));
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseJsonObject<T>(value: unknown): T {
  try {
    return JSON.parse(str(value)) as T;
  } catch {
    return {} as T;
  }
}

function rowToLead(row: Record<string, unknown>): Lead {
  return {
    id: str(row.id),
    name: str(row.name),
    email: str(row.email),
    company: str(row.company),
    phone: row.phone ? str(row.phone) : undefined,
    service: row.service ? str(row.service) : undefined,
    budget: row.budget ? str(row.budget) : undefined,
    timeline: row.timeline ? str(row.timeline) : undefined,
    message: str(row.message),
    status: (str(row.status) || "new") as LeadStatus,
    createdAt: str(row.created_at),
  };
}

function rowToConversation(row: Record<string, unknown>): Conversation {
  let messages: ChatMessage[] = [];
  try {
    const parsed = JSON.parse(str(row.messages));
    if (Array.isArray(parsed)) messages = parsed as ChatMessage[];
  } catch {
    messages = [];
  }
  return {
    id: str(row.id),
    visitorId: str(row.visitor_id),
    messages,
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
    category: str(row.category),
    shortDescription: str(row.short_description),
    image: str(row.image),
    gallery: parseJsonArray(row.gallery),
    featured: bool(row.featured),
    orderIndex: Number(row.order_index) || 0,
    problem: row.problem ? str(row.problem) : undefined,
    solution: row.solution ? str(row.solution) : undefined,
    workflow: parseJsonArray(row.workflow),
    results: parseJsonArray(row.results),
    technologies: parseJsonArray(row.technologies),
    links: parseJsonObject<Project["links"]>(row.links),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

function rowToExperience(row: Record<string, unknown>): Experience {
  return {
    id: str(row.id),
    company: str(row.company),
    projectTitle: str(row.project_title),
    description: str(row.description),
    technologies: parseJsonArray(row.technologies),
    completionDate: str(row.completion_date),
    logo: str(row.logo),
    orderIndex: Number(row.order_index) || 0,
    createdAt: str(row.created_at),
  };
}

function rowToMedia(row: Record<string, unknown>): MediaAsset {
  return {
    id: str(row.id),
    url: str(row.url),
    filename: str(row.filename),
    mime: str(row.mime),
    size: Number(row.size) || 0,
    createdAt: str(row.created_at),
  };
}

function rowToAnalyticsEvent(row: Record<string, unknown>): AnalyticsEvent {
  return {
    type: (str(row.event_type) || "pageview") as AnalyticsEvent["type"],
    path: str(row.path) || undefined,
    entity: (str(row.entity) || undefined) as AnalyticsEvent["entity"],
    slug: str(row.slug) || undefined,
    target: str(row.target) || undefined,
    value: Number(row.value) || 0,
    sessionId: str(row.session_id) || undefined,
    referrer: str(row.referrer) || undefined,
    createdAt: str(row.created_at),
  };
}

type Row = Record<string, unknown>;

/* ------------------------------------------------------------------ */
/* Leads & conversations (unchanged behaviour)                         */
/* ------------------------------------------------------------------ */

export async function createLead(input: LeadInput): Promise<Lead> {
  await ensureSchema();
  const lead: Lead = {
    ...input,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  await sql!.query(
    `INSERT INTO leads (id, name, email, phone, company, service, budget, timeline, message, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      lead.id,
      lead.name,
      lead.email,
      lead.phone ?? null,
      lead.company,
      lead.service ?? null,
      lead.budget ?? null,
      lead.timeline ?? null,
      lead.message,
      lead.status,
      lead.createdAt,
    ],
  );
  return lead;
}

export async function getLeads(): Promise<Lead[]> {
  await ensureSchema();
  const rows = (await sql!.query("SELECT * FROM leads ORDER BY created_at DESC")) as Row[];
  return rows.map(rowToLead);
}

export async function updateLead(
  id: string,
  patch: Partial<Pick<Lead, "status" | "name" | "email" | "company" | "message">>,
): Promise<Lead | null> {
  await ensureSchema();
  const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return getLeadById(id);

  const sets = entries.map(([key], index) => `${key} = $${index + 2}`).join(", ");
  const rows = (await sql!.query(
    `UPDATE leads SET ${sets} WHERE id = $1 RETURNING *`,
    [id, ...entries.map(([, value]) => value)],
  )) as Row[];
  return rows[0] ? rowToLead(rows[0]) : null;
}

export async function deleteLead(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = (await sql!.query("DELETE FROM leads WHERE id = $1 RETURNING id", [id])) as Row[];
  return rows.length > 0;
}

async function getLeadById(id: string): Promise<Lead | null> {
  const rows = (await sql!.query("SELECT * FROM leads WHERE id = $1", [id])) as Row[];
  return rows[0] ? rowToLead(rows[0]) : null;
}

export async function saveConversation(visitorId: string, messages: ChatMessage[]): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  const trimmed = messages.slice(-30);
  const existing = (await sql!.query("SELECT id FROM conversations WHERE visitor_id = $1", [
    visitorId,
  ])) as Row[];

  if (existing.length > 0) {
    await sql!.query("UPDATE conversations SET messages = $1, updated_at = $2 WHERE visitor_id = $3", [
      JSON.stringify(trimmed),
      now,
      visitorId,
    ]);
  } else {
    await sql!.query(
      `INSERT INTO conversations (id, visitor_id, messages, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID(), visitorId, JSON.stringify(trimmed), now, now],
    );
  }
}

export async function getConversation(visitorId: string): Promise<Conversation | null> {
  await ensureSchema();
  const rows = (await sql!.query("SELECT * FROM conversations WHERE visitor_id = $1", [
    visitorId,
  ])) as Row[];
  return rows[0] ? rowToConversation(rows[0]) : null;
}

export async function getConversations(): Promise<Conversation[]> {
  await ensureSchema();
  const rows = (await sql!.query(
    "SELECT * FROM conversations ORDER BY updated_at DESC",
  )) as Row[];
  return rows.map(rowToConversation);
}

/** Read a site setting (e.g. whatsapp number). Returns "" when unset. */
export async function getSetting(key: string): Promise<string> {
  await ensureSchema();
  const rows = (await sql!.query("SELECT value FROM settings WHERE key = $1", [
    key,
  ])) as Row[];
  return rows[0] ? str(rows[0].value) : "";
}

/** Upsert a site setting (e.g. whatsapp number). */
export async function setSetting(key: string, value: string): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await sql!.query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
    [key, value, now],
  );
}

/* ------------------------------------------------------------------ */
/* Projects (CMS)                                                      */
/* ------------------------------------------------------------------ */

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const candidate = base || "project";
  let slug = candidate;
  let suffix = 2;
  for (;;) {
    const rows = (await sql!.query(
      "SELECT id FROM projects WHERE slug = $1 AND id <> $2",
      [slug, excludeId ?? ""],
    )) as Row[];
    if (rows.length === 0) return slug;
    slug = `${candidate}-${suffix}`;
    suffix += 1;
  }
}

// Single-flight gate so concurrent first requests seed exactly once (mirrors
// schemaPromise — parallel seeds could race the slug unique constraint).
let seededPromise: Promise<void> | null = null;

/** Seed projects from data/projects.json the first time the table is empty. */
export async function seedProjectsIfEmpty(): Promise<void> {
  await ensureSchema();
  seededPromise ??= (async () => {
    const count = (await sql!.query("SELECT COUNT(*) AS count FROM projects")) as Row[];
    if (Number(count[0]?.count) > 0) return;

    const now = new Date().toISOString();
    const seeds = defaultProjects();
    for (const [index, input] of seeds.entries()) {
      const slug = await uniqueSlug(input.slug);
      await sql!.query(
        `INSERT INTO projects (id, slug, title, category, short_description, image, gallery, featured, order_index, problem, solution, workflow, results, technologies, links, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (slug) DO NOTHING`,
        [
          crypto.randomUUID(),
          slug,
          input.title,
          input.category,
          input.shortDescription,
          input.image,
          JSON.stringify(input.gallery),
          input.featured,
          index,
          input.problem ?? null,
          input.solution ?? null,
          JSON.stringify(input.workflow ?? []),
          JSON.stringify(input.results ?? []),
          JSON.stringify(input.technologies ?? []),
          JSON.stringify(input.links ?? {}),
          now,
          now,
        ],
      );
    }
  })().catch((error) => {
    // Reset so a later request can retry (a transient error must not poison the app).
    seededPromise = null;
    throw error;
  });
  return seededPromise;
}

export async function listProjects(): Promise<Project[]> {
  await ensureSchema();
  await seedProjectsIfEmpty();
  const rows = (await sql!.query(
    "SELECT * FROM projects ORDER BY order_index ASC, created_at DESC",
  )) as Row[];
  return rows.map(rowToProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  await ensureSchema();
  await seedProjectsIfEmpty();
  const rows = (await sql!.query("SELECT * FROM projects WHERE slug = $1", [slug])) as Row[];
  return rows[0] ? rowToProject(rows[0]) : null;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const rows = (await sql!.query("SELECT * FROM projects WHERE id = $1", [id])) as Row[];
  return rows[0] ? rowToProject(rows[0]) : null;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  await ensureSchema();
  const now = new Date().toISOString();
  const slug = await uniqueSlug(input.slug);
  const max = (await sql!.query(
    "SELECT COALESCE(MAX(order_index), -1) AS max_index FROM projects",
  )) as Row[];
  const id = crypto.randomUUID();
  await sql!.query(
    `INSERT INTO projects (id, slug, title, category, short_description, image, gallery, featured, order_index, problem, solution, workflow, results, technologies, links, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
    [
      id,
      slug,
      input.title,
      input.category,
      input.shortDescription,
      input.image,
      JSON.stringify(input.gallery ?? []),
      input.featured,
      Number(max[0]?.max_index ?? -1) + 1,
      input.problem ?? null,
      input.solution ?? null,
      JSON.stringify(input.workflow ?? []),
      JSON.stringify(input.results ?? []),
      JSON.stringify(input.technologies ?? []),
      JSON.stringify(input.links ?? {}),
      now,
      now,
    ],
  );
  const created = await getProjectById(id);
  return created!;
}

/** Full update (PUT): all editable fields are replaced. */
export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<Project | null> {
  await ensureSchema();
  const slug = await uniqueSlug(input.slug, id);
  const now = new Date().toISOString();
  const rows = (await sql!.query(
    `UPDATE projects SET
       slug = $1, title = $2, category = $3, short_description = $4, image = $5,
       gallery = $6, featured = $7, problem = $8, solution = $9, workflow = $10,
       results = $11, technologies = $12, links = $13, updated_at = $14
     WHERE id = $15 RETURNING *`,
    [
      slug,
      input.title,
      input.category,
      input.shortDescription,
      input.image,
      JSON.stringify(input.gallery ?? []),
      input.featured,
      input.problem ?? null,
      input.solution ?? null,
      JSON.stringify(input.workflow ?? []),
      JSON.stringify(input.results ?? []),
      JSON.stringify(input.technologies ?? []),
      JSON.stringify(input.links ?? {}),
      now,
      id,
    ],
  )) as Row[];
  return rows[0] ? rowToProject(rows[0]) : null;
}

/** Partial update (PATCH) — quick actions like toggling featured or reordering. */
export async function patchProject(
  id: string,
  patch: Partial<Pick<Project, "featured" | "orderIndex">>,
): Promise<Project | null> {
  await ensureSchema();
  const entries: Array<[string, unknown]> = [];
  if (patch.featured !== undefined) entries.push(["featured", patch.featured]);
  if (patch.orderIndex !== undefined) entries.push(["order_index", patch.orderIndex]);
  if (entries.length === 0) return getProjectById(id);

  const sets = entries.map(([key], index) => `${key} = $${index + 2}`).join(", ");
  const rows = (await sql!.query(
    `UPDATE projects SET ${sets}, updated_at = $${entries.length + 2} WHERE id = $1 RETURNING *`,
    [id, ...entries.map(([, value]) => value), new Date().toISOString()],
  )) as Row[];
  return rows[0] ? rowToProject(rows[0]) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = (await sql!.query("DELETE FROM projects WHERE id = $1 RETURNING id", [
    id,
  ])) as Row[];
  return rows.length > 0;
}

/** Apply an admin-defined display order to every project. */
export async function reorderProjects(orderedIds: string[]): Promise<void> {
  await ensureSchema();
  for (const [index, id] of orderedIds.entries()) {
    await sql!.query("UPDATE projects SET order_index = $1, updated_at = $2 WHERE id = $3", [
      index,
      new Date().toISOString(),
      id,
    ]);
  }
}

/* ------------------------------------------------------------------ */
/* Experiences (CMS)                                                   */
/* ------------------------------------------------------------------ */

function toExperienceRow(input: ExperienceInput) {
  return {
    company: input.company,
    projectTitle: input.projectTitle,
    description: input.description,
    technologies: JSON.stringify(input.technologies ?? []),
    completionDate: input.completionDate,
    logo: input.logo,
  };
}

export async function listExperiences(): Promise<Experience[]> {
  await ensureSchema();
  const rows = (await sql!.query(
    "SELECT * FROM experiences ORDER BY order_index ASC, created_at DESC",
  )) as Row[];
  return rows.map(rowToExperience);
}

export async function createExperience(input: ExperienceInput): Promise<Experience> {
  await ensureSchema();
  const now = new Date().toISOString();
  const max = (await sql!.query(
    "SELECT COALESCE(MAX(order_index), -1) AS max_index FROM experiences",
  )) as Row[];
  const row = toExperienceRow(input);
  const id = crypto.randomUUID();
  await sql!.query(
    `INSERT INTO experiences (id, company, project_title, description, technologies, completion_date, logo, order_index, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      row.company,
      row.projectTitle,
      row.description,
      row.technologies,
      row.completionDate,
      row.logo,
      Number(max[0]?.max_index ?? -1) + 1,
      now,
    ],
  );
  const rows = (await sql!.query("SELECT * FROM experiences WHERE id = $1", [id])) as Row[];
  return rowToExperience(rows[0]);
}

export async function updateExperience(
  id: string,
  input: ExperienceInput,
): Promise<Experience | null> {
  await ensureSchema();
  const row = toExperienceRow(input);
  const rows = (await sql!.query(
    `UPDATE experiences SET
       company = $1, project_title = $2, description = $3, technologies = $4,
       completion_date = $5, logo = $6
     WHERE id = $7 RETURNING *`,
    [
      row.company,
      row.projectTitle,
      row.description,
      row.technologies,
      row.completionDate,
      row.logo,
      id,
    ],
  )) as Row[];
  return rows[0] ? rowToExperience(rows[0]) : null;
}

export async function deleteExperience(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = (await sql!.query("DELETE FROM experiences WHERE id = $1 RETURNING id", [
    id,
  ])) as Row[];
  return rows.length > 0;
}

export async function reorderExperiences(orderedIds: string[]): Promise<void> {
  await ensureSchema();
  for (const [index, id] of orderedIds.entries()) {
    await sql!.query("UPDATE experiences SET order_index = $1 WHERE id = $2", [index, id]);
  }
}

/* ------------------------------------------------------------------ */
/* Media (uploaded images)                                             */
/* ------------------------------------------------------------------ */

export async function listMedia(): Promise<MediaAsset[]> {
  await ensureSchema();
  // Never ship the raw data with list responses.
  const rows = (await sql!.query(
    "SELECT id, url, filename, mime, size, created_at FROM media ORDER BY created_at DESC",
  )) as Row[];
  return rows.map(rowToMedia);
}

export async function getMediaById(id: string): Promise<MediaAsset | null> {
  const rows = (await sql!.query(
    "SELECT id, url, filename, mime, size, created_at FROM media WHERE id = $1",
    [id],
  )) as Row[];
  return rows[0] ? rowToMedia(rows[0]) : null;
}

/** Raw image blob (base64) for the public /api/media/<id> proxy. */
export async function getMediaBlob(id: string): Promise<{ mime: string; data: string } | null> {
  await ensureSchema();
  const rows = (await sql!.query("SELECT mime, data FROM media WHERE id = $1", [
    id,
  ])) as Row[];
  if (!rows[0]) return null;
  return { mime: str(rows[0].mime) || "application/octet-stream", data: str(rows[0].data) };
}

export async function createMedia(asset: {
  id: string;
  url: string;
  filename: string;
  mime: string;
  size: number;
  data: string;
}): Promise<MediaAsset> {
  await ensureSchema();
  await sql!.query(
    "INSERT INTO media (id, url, filename, mime, size, data, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      asset.id,
      asset.url,
      asset.filename,
      asset.mime,
      asset.size,
      asset.data,
      new Date().toISOString(),
    ],
  );
  const created = await getMediaById(asset.id);
  return created!;
}

export async function deleteMedia(id: string): Promise<boolean> {
  await ensureSchema();
  const rows = (await sql!.query("DELETE FROM media WHERE id = $1 RETURNING id", [
    id,
  ])) as Row[];
  return rows.length > 0;
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

const EVENT_TYPES = new Set(["pageview", "view", "impression", "click", "duration"]);

export async function recordAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  if (!sql || !EVENT_TYPES.has(event.type)) return;
  await ensureSchema();
  await sql!.query(
    `INSERT INTO analytics_events (id, event_type, path, entity, slug, target, value, session_id, referrer, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      crypto.randomUUID(),
      event.type,
      event.path ?? "",
      event.entity ?? "",
      event.slug ?? "",
      event.target ?? "",
      event.value ?? 0,
      event.sessionId ?? "",
      event.referrer ?? "",
      event.createdAt ?? new Date().toISOString(),
    ],
  );
}

/** Raw analytics events since an ISO timestamp (aggregation happens in JS). */
export async function getAnalyticsEvents(since: string): Promise<AnalyticsEvent[]> {
  await ensureSchema();
  const rows = (await sql!.query(
    "SELECT * FROM analytics_events WHERE created_at >= $1 ORDER BY created_at ASC",
    [since],
  )) as Row[];
  return rows.map(rowToAnalyticsEvent);
}
