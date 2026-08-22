import { listProjects } from "@/lib/database";

// Projects are edited from the admin dashboard; reading them live on every
// request means edits appear without a redeploy. The list is small.
export const dynamic = "force-dynamic";

/**
 * GET /api/site/projects — public project list (used by the homepage
 * preview and any client-side grid). Admin-managed content.
 */
export async function GET() {
  try {
    const projects = await listProjects();
    return Response.json({ projects });
  } catch (error) {
    console.error("[site] failed to load projects", error);
    return Response.json({ projects: [] });
  }
}
