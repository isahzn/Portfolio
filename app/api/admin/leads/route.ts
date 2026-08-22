import { getLeads } from "@/lib/database";
import { isAdminRequest } from "@/lib/auth";

/** GET /api/admin/leads — authenticated list of leads for the dashboard. */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const leads = await getLeads();
    return Response.json({ leads });
  } catch (error) {
    console.error("[admin] failed to load leads", error);
    return Response.json({ error: "Failed to load leads." }, { status: 500 });
  }
}
