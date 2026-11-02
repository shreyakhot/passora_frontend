import type { Metadata } from "next";
import { Suspense } from "react";
import ExpertQueueView from "@/components/admin/views/ExpertQueueView";

export const metadata: Metadata = { title: "Expert Edit" };

export default function AdminExpertQueuePage() {
  return (
    <Suspense>
      <ExpertQueueView />
    </Suspense>
  );
}
