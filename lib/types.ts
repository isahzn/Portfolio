/**
 * Shared data types (docs/05_DATA_MODEL.MD).
 *
 * Projects now live in the database (editable from the admin dashboard);
 * Demo and Service types describe static data/*.json content.
 */

export type {
  Project,
  ProjectInput,
  ProjectLinks,
} from "@/lib/database/types";

export type Demo = {
  id: string;
  title: string;
  category: string;
  description: string;
  route: string;
};

export type Service = {
  title: string;
  description: string;
  features: string[];
};
