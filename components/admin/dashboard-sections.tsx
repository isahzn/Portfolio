import type { ComponentType } from "react";
import {
  IconBuilding,
  IconChart,
  IconChat,
  IconCube,
  IconGear,
  IconImage,
  IconMail,
} from "@/components/ui/icons";
import { LeadsSection } from "@/components/admin/sections/leads-section";
import { ConversationsSection } from "@/components/admin/sections/conversations-section";
import { ProjectsManager } from "@/components/admin/projects-manager";
import { ExperiencesManager } from "@/components/admin/experiences-manager";
import { MediaLibrary } from "@/components/admin/media-library";
import { AnalyticsSection } from "@/components/admin/sections/analytics-section";
import { SettingsSection } from "@/components/admin/sections/settings-section";

/**
 * Dashboard section registry (docs/03_TECH_ARCHITECTURE.MD — scalability).
 *
 * Adding a future section (e.g. Services, Invoices, Clients) is a one-line
 * change: implement a component and add one entry here. The tab bar, shell
 * and routing derive entirely from this array — no other file changes.
 */
export type DashboardSection = {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType;
};

export const dashboardSections: DashboardSection[] = [
  {
    id: "leads",
    label: "Leads",
    description: "Track inquiries from the site and their pipeline status.",
    icon: IconMail,
    component: LeadsSection,
  },
  {
    id: "conversations",
    label: "Conversations",
    description: "Chatbot conversations captured from the site.",
    icon: IconChat,
    component: ConversationsSection,
  },
  {
    id: "projects",
    label: "Projects",
    description: "Create, edit, reorder and delete portfolio projects.",
    icon: IconCube,
    component: ProjectsManager,
  },
  {
    id: "experience",
    label: "Past Projects",
    description: "Companies and clients Floza has worked with.",
    icon: IconBuilding,
    component: ExperiencesManager,
  },
  {
    id: "media",
    label: "Media Library",
    description: "Uploaded images, reusable across the site.",
    icon: IconImage,
    component: MediaLibrary,
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Visitor engagement: views, clicks and traffic over time.",
    icon: IconChart,
    component: AnalyticsSection,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Branding, logo and contact details shown on the site.",
    icon: IconGear,
    component: SettingsSection,
  },
];
