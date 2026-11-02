import type { Metadata } from "next";
import { Suspense } from "react";
import OrdersView from "@/components/admin/views/OrdersView";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersView />
    </Suspense>
  );
}
