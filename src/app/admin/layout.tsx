import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: `Admin · ${SITE_NAME}`, template: `%s · Admin · ${SITE_NAME}` },
  robots: { index: false, follow: false, nocache: true },
};

/** The admin panel keeps its own DaisyUI theme (see "admin" in globals.css). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="admin" className="flex-1 bg-base-200 text-base-content">
      {children}
    </div>
  );
}
