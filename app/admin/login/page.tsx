import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { adminConfigured, isAdminSession } from "@/lib/auth";

export const metadata = { title: "Admin Login" };

export default async function AdminLoginPage() {
  if (adminConfigured && (await isAdminSession())) {
    redirect("/admin");
  }
  return (
    <div className="mx-auto mt-10 w-full max-w-md sm:mt-20">
      <LoginForm configured={adminConfigured} />
    </div>
  );
}
