/**
 * Database schema (docs/05_DATA_MODEL.MD). Applied idempotently
 * (CREATE TABLE IF NOT EXISTS) before first use.
 */

export const LEAD_SCHEMA = `
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT NOT NULL,
  service TEXT,
  budget TEXT,
  timeline TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);
`;

// Migration for databases created before the phone column existed
// (CREATE TABLE IF NOT EXISTS never touches an existing table).
export const LEAD_PHONE_SCHEMA = `
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT;
`;

export const CONVERSATION_SCHEMA = `
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  messages TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

export const SETTINGS_SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);
`;

/** CMS: portfolio projects, editable from the admin dashboard. */
export const PROJECTS_SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  gallery TEXT NOT NULL DEFAULT '[]',
  featured BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  problem TEXT,
  solution TEXT,
  workflow TEXT NOT NULL DEFAULT '[]',
  results TEXT NOT NULL DEFAULT '[]',
  technologies TEXT NOT NULL DEFAULT '[]',
  links TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

/** CMS: previous experience entries (companies/clients worked with). */
export const EXPERIENCES_SCHEMA = `
CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  project_title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  technologies TEXT NOT NULL DEFAULT '[]',
  completion_date TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
`;

/** Media Library: uploaded images reused across the site.
 * The `data` column holds the image (base64) so storage is portable —
 * swapping to S3/VPS storage later only changes lib/storage.ts. */
export const MEDIA_SCHEMA = `
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL DEFAULT '',
  filename TEXT NOT NULL DEFAULT '',
  mime TEXT NOT NULL DEFAULT '',
  size INTEGER NOT NULL DEFAULT 0,
  data TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
`;

/** Anonymous engagement analytics (pageviews, views, clicks, durations). */
export const ANALYTICS_SCHEMA = `
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '',
  entity TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL DEFAULT '',
  target TEXT NOT NULL DEFAULT '',
  value REAL NOT NULL DEFAULT 0,
  session_id TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
`;

// Kept separate: Postgres rejects multiple statements in one prepared query.
export const CONVERSATION_INDEX_SCHEMA = `
CREATE INDEX IF NOT EXISTS idx_conversations_visitor ON conversations (visitor_id);
`;

export const ANALYTICS_INDEX_SCHEMA = `
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events (created_at);
`;
