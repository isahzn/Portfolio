import "server-only";
import { defaultProjects } from "@/lib/content";
import type {
  AnalyticsEvent,
  ChatMessage,
  Conversation,
  Experience,
  ExperienceInput,
  Lead,
  LeadInput,
  MediaAsset,
  Project,
  ProjectInput,
} from "./types";

/**
 * In-memory fallback store — used when DATABASE_URL is not configured
 * (local development). Data resets when the server restarts; production
 * should always set DATABASE_URL (Vercel or the future VPS).
 * Mirrors the Neon store's interface exactly (see lib/database/index.ts).
 */
const leads = new Map<string, Lead>();
const conversations = new Map<string, Conversation>();
const settings = new Map<string, string>();
const projects = new Map<string, Project>();
const experiences = new Map<string, Experience>();
const media = new Map<string, MediaAsset>();
const analyticsEvents: AnalyticsEvent[] = [];

/* ------------------------- leads & conversations ------------------------- */

export async function createLead(input: LeadInput): Promise<Lead> {
  const lead: Lead = {
    ...input,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  leads.set(lead.id, lead);
  return lead;
}

export async function getLeads(): Promise<Lead[]> {
  return [...leads.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateLead(
  id: string,
  patch: Partial<Pick<Lead, "status" | "name" | "email" | "company" | "message">>,
): Promise<Lead | null> {
  const lead = leads.get(id);
  if (!lead) return null;
  const updated = { ...lead, ...patch };
  leads.set(id, updated);
  return updated;
}

export async function deleteLead(id: string): Promise<boolean> {
  return leads.delete(id);
}

export async function saveConversation(visitorId: string, messages: ChatMessage[]): Promise<void> {
  const now = new Date().toISOString();
  const existing = conversations.get(visitorId);
  if (existing) {
    conversations.set(visitorId, { ...existing, messages: messages.slice(-30), updatedAt: now });
  } else {
    conversations.set(visitorId, {
      id: crypto.randomUUID(),
      visitorId,
      messages: messages.slice(-30),
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function getConversation(visitorId: string): Promise<Conversation | null> {
  return conversations.get(visitorId) ?? null;
}

export async function getConversations(): Promise<Conversation[]> {
  return [...conversations.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getSetting(key: string): Promise<string> {
  return settings.get(key) ?? "";
}

export async function setSetting(key: string, value: string): Promise<void> {
  settings.set(key, value);
}

/* ------------------------------ projects -------------------------------- */

function orderedProjects(): Project[] {
  return [...projects.values()].sort(
    (a, b) => a.orderIndex - b.orderIndex || b.createdAt.localeCompare(a.createdAt),
  );
}

function nextProjectOrder(): number {
  return [...projects.values()].reduce((max, p) => Math.max(max, p.orderIndex), -1) + 1;
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const candidate = base || "project";
  let slug = candidate;
  let suffix = 2;
  while ([...projects.values()].some((p) => p.slug === slug && p.id !== excludeId)) {
    slug = `${candidate}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

let seeded = false;

/** Single-flight seed so concurrent first reads don't duplicate entries. */
export async function seedProjectsIfEmpty(): Promise<void> {
  if (seeded || projects.size > 0) return;
  seeded = true;
  const now = new Date().toISOString();
  for (const [index, input] of defaultProjects().entries()) {
    const id = crypto.randomUUID();
    projects.set(id, {
      ...input,
      id,
      slug: await uniqueSlug(input.slug),
      orderIndex: index,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function listProjects(): Promise<Project[]> {
  await seedProjectsIfEmpty();
  return orderedProjects();
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  await seedProjectsIfEmpty();
  return [...projects.values()].find((p) => p.slug === slug) ?? null;
}

export async function getProjectById(id: string): Promise<Project | null> {
  return projects.get(id) ?? null;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const now = new Date().toISOString();
  const project: Project = {
    ...input,
    id: crypto.randomUUID(),
    slug: await uniqueSlug(input.slug),
    orderIndex: nextProjectOrder(),
    createdAt: now,
    updatedAt: now,
  };
  projects.set(project.id, project);
  return project;
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<Project | null> {
  const existing = projects.get(id);
  if (!existing) return null;
  const updated: Project = {
    ...existing,
    ...input,
    slug: await uniqueSlug(input.slug, id),
    updatedAt: new Date().toISOString(),
  };
  projects.set(id, updated);
  return updated;
}

export async function patchProject(
  id: string,
  patch: Partial<Pick<Project, "featured" | "orderIndex">>,
): Promise<Project | null> {
  const existing = projects.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  projects.set(id, updated);
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  return projects.delete(id);
}

export async function reorderProjects(orderedIds: string[]): Promise<void> {
  orderedIds.forEach((id, index) => {
    const project = projects.get(id);
    if (project) projects.set(id, { ...project, orderIndex: index });
  });
}

/* ----------------------------- experiences ------------------------------ */

function orderedExperiences(): Experience[] {
  return [...experiences.values()].sort(
    (a, b) => a.orderIndex - b.orderIndex || b.createdAt.localeCompare(a.createdAt),
  );
}

export async function listExperiences(): Promise<Experience[]> {
  return orderedExperiences();
}

export async function createExperience(input: ExperienceInput): Promise<Experience> {
  const experience: Experience = {
    ...input,
    id: crypto.randomUUID(),
    orderIndex:
      [...experiences.values()].reduce((max, e) => Math.max(max, e.orderIndex), -1) + 1,
    createdAt: new Date().toISOString(),
  };
  experiences.set(experience.id, experience);
  return experience;
}

export async function updateExperience(
  id: string,
  input: ExperienceInput,
): Promise<Experience | null> {
  const existing = experiences.get(id);
  if (!existing) return null;
  const updated: Experience = { ...existing, ...input };
  experiences.set(id, updated);
  return updated;
}

export async function deleteExperience(id: string): Promise<boolean> {
  return experiences.delete(id);
}

export async function reorderExperiences(orderedIds: string[]): Promise<void> {
  orderedIds.forEach((id, index) => {
    const experience = experiences.get(id);
    if (experience) experiences.set(id, { ...experience, orderIndex: index });
  });
}

/* -------------------------------- media --------------------------------- */

// Blobs are kept separately so list responses stay small.
const mediaBlobs = new Map<string, { mime: string; data: string }>();

export async function listMedia(): Promise<MediaAsset[]> {
  return [...media.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getMediaById(id: string): Promise<MediaAsset | null> {
  return media.get(id) ?? null;
}

export async function getMediaBlob(id: string): Promise<{ mime: string; data: string } | null> {
  return mediaBlobs.get(id) ?? null;
}

export async function createMedia(asset: {
  id: string;
  url: string;
  filename: string;
  mime: string;
  size: number;
  data: string;
}): Promise<MediaAsset> {
  const created: MediaAsset = {
    id: asset.id,
    url: asset.url,
    filename: asset.filename,
    mime: asset.mime,
    size: asset.size,
    createdAt: new Date().toISOString(),
  };
  media.set(created.id, created);
  mediaBlobs.set(created.id, { mime: asset.mime, data: asset.data });
  return created;
}

export async function deleteMedia(id: string): Promise<boolean> {
  mediaBlobs.delete(id);
  return media.delete(id);
}

/* ------------------------------ analytics ------------------------------- */

export async function recordAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  analyticsEvents.push({
    ...event,
    createdAt: event.createdAt ?? new Date().toISOString(),
  });
  // Cap in-memory history (production uses the Neon store).
  if (analyticsEvents.length > 100_000) analyticsEvents.splice(0, 10_000);
}

export async function getAnalyticsEvents(since: string): Promise<AnalyticsEvent[]> {
  return analyticsEvents.filter((event) => (event.createdAt ?? "") >= since);
}
