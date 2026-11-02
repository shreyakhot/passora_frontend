import type { Metadata } from "next";
import { Suspense } from "react";
import JourneysView from "@/components/admin/views/JourneysView";

export const metadata: Metadata = { title: "User journeys" };

export default function AdminJourneysPage() {
  return (
    <Suspense>
      <JourneysView />
    </Suspense>
  );
}
