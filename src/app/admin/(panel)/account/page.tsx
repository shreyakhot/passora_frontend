import type { Metadata } from "next";
import AccountView from "@/components/admin/views/AccountView";

export const metadata: Metadata = { title: "Account" };

export default function AdminAccountPage() {
  return <AccountView />;
}
