import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomersView } from "@/components/admin/views/CustomersView";

export const metadata: Metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  return (
    <Suspense>
      <CustomersView />
    </Suspense>
  );
}
