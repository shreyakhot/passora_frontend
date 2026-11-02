import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardView from "@/components/admin/views/DashboardView";
import { getAdminSession } from "@/lib/admin/server";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  // Editors only work the Expert Edit queue
  const admin = await getAdminSession();
  if (admin?.role === "editor") redirect("/admin/expert");
  return <DashboardView />;
}
