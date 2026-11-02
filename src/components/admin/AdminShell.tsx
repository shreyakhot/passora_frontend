"use client";

/**
 * Admin panel chrome: sidebar navigation (filtered by role), mobile drawer,
 * current-admin context and toast notifications.
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Route,
  ReceiptText,
  Server,
  Sparkles,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { adminFetch } from "@/lib/admin/client";
import type { AdminMe, AdminRole } from "@/lib/admin/types";
import { LOGO_PATH, SITE_NAME } from "@/lib/site";

// ─── Context ───

type Toast = { id: number; message: string; tone: "success" | "error" };

interface AdminContextValue {
  admin: AdminMe;
  can: (...roles: AdminRole[]) => boolean;
  toast: (message: string, tone?: Toast["tone"]) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminShell>");
  return ctx;
}

// ─── Navigation ───

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: AdminRole[];
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["owner", "support"] },
  { href: "/admin/journeys", label: "User journeys", icon: Route, roles: ["owner", "support"] },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText, roles: ["owner", "support"] },
  { href: "/admin/expert", label: "Expert Edit", icon: Sparkles, roles: ["owner", "support", "editor"] },
  { href: "/admin/customers", label: "Customers", icon: Users, roles: ["owner", "support"] },
  { href: "/admin/logs", label: "Logs", icon: Activity, roles: ["owner", "support"] },
  { href: "/admin/system", label: "System", icon: Server, roles: ["owner", "support"] },
  { href: "/admin/admins", label: "Admin users", icon: UserCog, roles: ["owner"] },
];

const ROLE_LABELS: Record<AdminRole, string> = {
  owner: "Owner",
  support: "Support",
  editor: "Editor",
};

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export interface AdminShellProps {
  admin: AdminMe;
  children: ReactNode;
}

export default function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [signingOut, setSigningOut] = useState(false);

  const can = useCallback((...roles: AdminRole[]) => roles.includes(admin.role), [admin.role]);

  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 7000 : 4000);
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await adminFetch("/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const items = NAV.filter((item) => item.roles.includes(admin.role));

  // Close the mobile drawer after navigating
  function closeDrawer() {
    const toggle = document.getElementById("admin-drawer") as HTMLInputElement | null;
    if (toggle) toggle.checked = false;
  }

  const nav = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 px-4 py-5">
        <Image src={LOGO_PATH} alt="" width={32} height={32} className="rounded-lg" />
        <span className="font-bold leading-tight">
          {SITE_NAME}
          <span className="block text-xs font-medium text-base-content/60">Admin</span>
        </span>
      </Link>
      <ul className="menu w-full flex-1 gap-0.5 px-2">
        {items.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={closeDrawer}
              className={isActive(pathname, href) ? "bg-primary/15 font-semibold" : ""}
              aria-current={isActive(pathname, href) ? "page" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-t border-base-300 p-3">
        <div className="px-2 pb-2">
          <p className="truncate text-sm font-semibold">{admin.name}</p>
          <p className="truncate text-xs text-base-content/60">
            {admin.email} · {ROLE_LABELS[admin.role]}
          </p>
        </div>
        <ul className="menu w-full p-0">
          <li>
            <Link href="/admin/account" onClick={closeDrawer} className={isActive(pathname, "/admin/account") ? "bg-primary/15 font-semibold" : ""}>
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Account
            </Link>
          </li>
          <li>
            <button type="button" onClick={signOut} disabled={signingOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );

  return (
    <AdminContext.Provider value={{ admin, can, toast }}>
      <div className="drawer lg:drawer-open min-h-screen bg-base-200">
        <input id="admin-drawer" type="checkbox" className="drawer-toggle" aria-label="Toggle navigation" />
        <div className="drawer-content flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-base-300 bg-base-100 px-4 py-2 lg:hidden">
            <label htmlFor="admin-drawer" className="btn btn-ghost btn-sm btn-square" aria-label="Open navigation">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </label>
            <span className="font-semibold">{SITE_NAME} Admin</span>
          </header>
          <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
        <div className="drawer-side z-30">
          <label htmlFor="admin-drawer" aria-label="Close navigation" className="drawer-overlay" />
          <aside className="h-full w-64 border-r border-base-300 bg-base-100">{nav}</aside>
        </div>
      </div>

      <div className="toast toast-end toast-bottom z-50" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`alert ${t.tone === "error" ? "alert-error" : "alert-success"} max-w-sm text-sm`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </AdminContext.Provider>
  );
}
