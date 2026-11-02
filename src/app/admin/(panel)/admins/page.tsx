import type { Metadata } from "next";
import AdminsView from "@/components/admin/views/AdminsView";

export const metadata: Metadata = { title: "Admin users" };

export default function AdminAdminsPage() {
  return <AdminsView />;
}
