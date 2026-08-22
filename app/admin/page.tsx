import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { adminConfigured, isAdminSession } from "@/lib/auth";

export const metadata = { title: "Dashboard" };

export default async function AdminPage() {
  if (!adminConfigured || !(await isAdminSession())) {
    redirect("/admin/login");
  }
  return <AdminDashboard />;
}
