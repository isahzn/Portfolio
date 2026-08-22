import "server-only";
import {
  createLead as neonCreateLead,
  createExperience as neonCreateExperience,
  createMedia as neonCreateMedia,
  createProject as neonCreateProject,
  deleteExperience as neonDeleteExperience,
  deleteLead as neonDeleteLead,
  deleteMedia as neonDeleteMedia,
  deleteProject as neonDeleteProject,
  getAnalyticsEvents as neonGetAnalyticsEvents,
  getConversation as neonGetConversation,
  getConversations as neonGetConversations,
  getLeads as neonGetLeads,
  getMediaBlob as neonGetMediaBlob,
  getMediaById as neonGetMediaById,
  getProjectById as neonGetProjectById,
  getProjectBySlug as neonGetProjectBySlug,
  getSetting as neonGetSetting,
  listExperiences as neonListExperiences,
  listMedia as neonListMedia,
  listProjects as neonListProjects,
  neonAvailable,
  patchProject as neonPatchProject,
  recordAnalyticsEvent as neonRecordAnalyticsEvent,
  reorderExperiences as neonReorderExperiences,
  reorderProjects as neonReorderProjects,
  saveConversation as neonSaveConversation,
  seedProjectsIfEmpty as neonSeedProjectsIfEmpty,
  setSetting as neonSetSetting,
  updateExperience as neonUpdateExperience,
  updateLead as neonUpdateLead,
  updateProject as neonUpdateProject,
} from "./neon-store";
import {
  createLead as memoryCreateLead,
  createExperience as memoryCreateExperience,
  createMedia as memoryCreateMedia,
  createProject as memoryCreateProject,
  deleteExperience as memoryDeleteExperience,
  deleteLead as memoryDeleteLead,
  deleteMedia as memoryDeleteMedia,
  deleteProject as memoryDeleteProject,
  getAnalyticsEvents as memoryGetAnalyticsEvents,
  getConversation as memoryGetConversation,
  getConversations as memoryGetConversations,
  getLeads as memoryGetLeads,
  getMediaBlob as memoryGetMediaBlob,
  getMediaById as memoryGetMediaById,
  getProjectById as memoryGetProjectById,
  getProjectBySlug as memoryGetProjectBySlug,
  getSetting as memoryGetSetting,
  listExperiences as memoryListExperiences,
  listMedia as memoryListMedia,
  listProjects as memoryListProjects,
  patchProject as memoryPatchProject,
  recordAnalyticsEvent as memoryRecordAnalyticsEvent,
  reorderExperiences as memoryReorderExperiences,
  reorderProjects as memoryReorderProjects,
  saveConversation as memorySaveConversation,
  seedProjectsIfEmpty as memorySeedProjectsIfEmpty,
  setSetting as memorySetSetting,
  updateExperience as memoryUpdateExperience,
  updateLead as memoryUpdateLead,
  updateProject as memoryUpdateProject,
} from "./memory-store";

export * from "./types";

/**
 * Storage layer (docs/05_DATA_MODEL.MD, docs/03_TECH_ARCHITECTURE.MD).
 *
 * Neon (serverless Postgres) is used when DATABASE_URL is configured;
 * otherwise an in-memory store keeps local development working.
 * Swapping providers later only changes this file.
 */
const useNeon = neonAvailable;

if (!useNeon) {
  console.warn(
    "[database] DATABASE_URL is missing or invalid — using the in-memory fallback store (data resets on restart).",
  );
}

export const createLead = useNeon ? neonCreateLead : memoryCreateLead;
export const getLeads = useNeon ? neonGetLeads : memoryGetLeads;
export const updateLead = useNeon ? neonUpdateLead : memoryUpdateLead;
export const deleteLead = useNeon ? neonDeleteLead : memoryDeleteLead;
export const saveConversation = useNeon ? neonSaveConversation : memorySaveConversation;
export const getConversation = useNeon ? neonGetConversation : memoryGetConversation;
export const getConversations = useNeon ? neonGetConversations : memoryGetConversations;
export const getSetting = useNeon ? neonGetSetting : memoryGetSetting;
export const setSetting = useNeon ? neonSetSetting : memorySetSetting;

export const seedProjectsIfEmpty = useNeon ? neonSeedProjectsIfEmpty : memorySeedProjectsIfEmpty;
export const listProjects = useNeon ? neonListProjects : memoryListProjects;
export const getProjectBySlug = useNeon ? neonGetProjectBySlug : memoryGetProjectBySlug;
export const getProjectById = useNeon ? neonGetProjectById : memoryGetProjectById;
export const createProject = useNeon ? neonCreateProject : memoryCreateProject;
export const updateProject = useNeon ? neonUpdateProject : memoryUpdateProject;
export const patchProject = useNeon ? neonPatchProject : memoryPatchProject;
export const deleteProject = useNeon ? neonDeleteProject : memoryDeleteProject;
export const reorderProjects = useNeon ? neonReorderProjects : memoryReorderProjects;

export const listExperiences = useNeon ? neonListExperiences : memoryListExperiences;
export const createExperience = useNeon ? neonCreateExperience : memoryCreateExperience;
export const updateExperience = useNeon ? neonUpdateExperience : memoryUpdateExperience;
export const deleteExperience = useNeon ? neonDeleteExperience : memoryDeleteExperience;
export const reorderExperiences = useNeon ? neonReorderExperiences : memoryReorderExperiences;

export const listMedia = useNeon ? neonListMedia : memoryListMedia;
export const getMediaById = useNeon ? neonGetMediaById : memoryGetMediaById;
export const getMediaBlob = useNeon ? neonGetMediaBlob : memoryGetMediaBlob;
export const createMedia = useNeon ? neonCreateMedia : memoryCreateMedia;
export const deleteMedia = useNeon ? neonDeleteMedia : memoryDeleteMedia;

export const recordAnalyticsEvent = useNeon
  ? neonRecordAnalyticsEvent
  : memoryRecordAnalyticsEvent;
export const getAnalyticsEvents = useNeon ? neonGetAnalyticsEvents : memoryGetAnalyticsEvents;
