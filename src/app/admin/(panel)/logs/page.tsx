import type { Metadata } from "next";
import { Suspense } from "react";
import LogsView from "@/components/admin/views/LogsView";

export const metadata: Metadata = { title: "Logs" };

export default function AdminLogsPage() {
  return (
    <Suspense>
      <LogsView />
    </Suspense>
  );
}
