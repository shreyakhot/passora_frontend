import type { Metadata } from "next";
import { CustomerDetailView } from "@/components/admin/views/CustomersView";

export const metadata: Metadata = { title: "Customer" };

export default async function AdminCustomerPage({ params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  return <CustomerDetailView email={decodeURIComponent(email)} />;
}
