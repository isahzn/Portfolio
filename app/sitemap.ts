import type { MetadataRoute } from "next";
import demos from "@/data/demos.json";
import type { Demo } from "@/lib/types";
import { listProjects } from "@/lib/database";
import { SITE_URL } from "@/lib/seo";

const demoList = demos as Demo[];

const staticRoutes = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/experience", changeFrequency: "monthly", priority: 0.6 },
  { path: "/demos", changeFrequency: "weekly", priority: 0.9 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.8 },
] as const;

/**
 * XML sitemap (docs/11_DEPLOYMENT_ROADMAP.MD — Phase 7). Static pages plus
 * every project case study (from the database — new projects added in the
 * admin dashboard appear automatically) and demo.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await listProjects().catch(() => []);

  const projectRoutes = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const demoRoutes = demoList.map((demo) => ({
    url: `${SITE_URL}${demo.route}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...projectRoutes,
    ...demoRoutes,
  ];
}
