import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/admin/server";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-12">
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
