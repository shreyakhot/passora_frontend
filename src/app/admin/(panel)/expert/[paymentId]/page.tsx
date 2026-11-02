import type { Metadata } from "next";
import ExpertDetailView from "@/components/admin/views/ExpertDetailView";

export const metadata: Metadata = { title: "Expert Edit order" };

export default async function AdminExpertOrderPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  return <ExpertDetailView paymentId={paymentId} />;
}
