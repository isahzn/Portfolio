import { deleteLead, updateLead } from "@/lib/database";
import type { LeadStatus } from "@/lib/database";
import { isAdminRequest } from "@/lib/auth";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed"];

/** PATCH /api/admin/leads/[id] — authenticated lead status update. */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const status = body.status;
  if (typeof status !== "string" || !STATUSES.includes(status as LeadStatus)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    const lead = await updateLead(id, { status: status as LeadStatus });
    if (!lead) {
      return Response.json({ error: "Lead not found." }, { status: 404 });
    }
    return Response.json({ lead });
  } catch (error) {
    console.error("[admin] failed to update lead", error);
    return Response.json({ error: "Failed to update lead." }, { status: 500 });
  }
}

/** DELETE /api/admin/leads/[id] — authenticated lead deletion (spam/cleanup). */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const deleted = await deleteLead(id);
    if (!deleted) {
      return Response.json({ error: "Lead not found." }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] failed to delete lead", error);
    return Response.json({ error: "Failed to delete lead." }, { status: 500 });
  }
}
