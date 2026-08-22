import { getConversations } from "@/lib/database";
import { isAdminRequest } from "@/lib/auth";

/** GET /api/admin/conversations — authenticated list of chatbot conversations. */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const conversations = await getConversations();
    return Response.json({ conversations });
  } catch (error) {
    console.error("[admin] failed to load conversations", error);
    return Response.json({ error: "Failed to load conversations." }, { status: 500 });
  }
}
