"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { adminFetch, AdminApiError } from "@/lib/admin/client";
import { KeyValues, PageHeader, Panel } from "@/components/admin/ui";

export default function AccountView() {
  const { admin, toast } = useAdmin();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next !== repeat) {
      setError("The new passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await adminFetch("/auth/change-password", { json: { currentPassword: current, newPassword: next } });
      setCurrent("");
      setNext("");
      setRepeat("");
      toast("Password changed. Other devices have been signed out.");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not change the password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Account" />
      <div className="grid max-w-3xl gap-6 md:grid-cols-2">
        <Panel title="Your details">
          <KeyValues
            rows={[
              ["Name", admin.name],
              ["Email", admin.email],
              ["Role", <span key="r" className="capitalize">{admin.role}</span>],
            ]}
          />
          <p className="mt-4 text-xs text-base-content/60">An owner can change your name or role under Admin users.</p>
        </Panel>

        <Panel title="Change password">
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Current password</span>
              <input type="password" autoComplete="current-password" className="input w-full" required value={current} onChange={(e) => setCurrent(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">New password</span>
              <input type="password" autoComplete="new-password" minLength={10} className="input w-full" required value={next} onChange={(e) => setNext(e.target.value)} />
              <span className="mt-1 block text-xs text-base-content/60">At least 10 characters.</span>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Repeat new password</span>
              <input type="password" autoComplete="new-password" className="input w-full" required value={repeat} onChange={(e) => setRepeat(e.target.value)} />
            </label>
            {error && <p className="text-sm text-error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? "Saving…" : "Change password"}
            </button>
          </form>
        </Panel>
      </div>
    </>
  );
}
