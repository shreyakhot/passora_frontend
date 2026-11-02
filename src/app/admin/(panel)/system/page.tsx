import type { Metadata } from "next";
import SystemView from "@/components/admin/views/SystemView";

export const metadata: Metadata = { title: "System" };

export default function AdminSystemPage() {
  return <SystemView />;
}
