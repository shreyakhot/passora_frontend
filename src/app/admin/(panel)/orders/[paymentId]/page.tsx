import type { Metadata } from "next";
import OrderDetailView from "@/components/admin/views/OrderDetailView";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  return <OrderDetailView paymentId={paymentId} />;
}
