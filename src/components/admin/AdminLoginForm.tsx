"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { adminFetch, AdminApiError } from "@/lib/admin/client";
import type { AdminMe } from "@/lib/admin/types";
import { LOGO_PATH, SITE_NAME } from "@/lib/site";

/** Only same-site admin paths are allowed as the post-login destination */
function safeNext(next: string | null, role: AdminMe["role"]): string {
  if (next && next.startsWith("/admin") && !next.startsWith("//")) return next;
  return role === "editor" ? "/admin/expert" : "/admin";
}

export default function AdminLoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { admin } = await adminFetch<{ admin: AdminMe }>("/auth/login", {
        json: { email, password },
      });
      window.location.assign(safeNext(params.get("next"), admin.role));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not sign in. Try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm rounded-box border border-base-300 bg-base-100 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Image src={LOGO_PATH} alt="" width={40} height={40} className="rounded-lg" />
        <div>
          <h1 className="text-xl! leading-tight! font-bold">Admin sign in</h1>
          <p className="text-sm text-base-content/60">{SITE_NAME}</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-error alert-soft mb-4 text-sm">
          {error}
        </div>
      )}

      <label className="mb-1 block text-sm font-medium" htmlFor="admin-email">
        Email
      </label>
      <input
        id="admin-email"
        type="email"
        autoComplete="username"
        required
        className="input mb-4 w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="mb-1 block text-sm font-medium" htmlFor="admin-password">
        Password
      </label>
      <input
        id="admin-password"
        type="password"
        autoComplete="current-password"
        required
        className="input mb-6 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Sign in
      </button>
    </form>
  );
}
