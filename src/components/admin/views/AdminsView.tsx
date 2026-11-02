"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { adminFetch, AdminApiError, useAdminQuery } from "@/lib/admin/client";
import { formatDateTime, timeAgo } from "@/lib/admin/format";
import type { AdminAccount, AdminRole } from "@/lib/admin/types";
import { ErrorAlert, Loading, Modal, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";

const ROLE_HELP: Record<AdminRole, string> = {
  owner: "Everything, including refunds, admin users and the audit log",
  support: "Dashboard, orders, customers, logs and Expert Edit",
  editor: "Expert Edit queue only",
};

type Dialog = { kind: "create" } | { kind: "reset"; account: AdminAccount } | null;

export default function AdminsView() {
  const { admin, toast } = useAdmin();
  const { data, error, reload } = useAdminQuery<AdminAccount[]>("/admins");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ email: "", name: "", role: "support" as AdminRole, password: "" });

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setFormError("");
    try {
      await fn();
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : "Something went wrong.";
      if (dialog) setFormError(message);
      else toast(message, "error");
    } finally {
      setBusy(false);
    }
  }

  function update(account: AdminAccount, changes: Partial<Pick<AdminAccount, "role" | "active" | "name">>, message: string) {
    run(async () => {
      await adminFetch(`/admins/${account.id}`, { method: "PATCH", json: changes });
      toast(message);
      reload();
    });
  }

  if (error) return <ErrorAlert error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Admin users"
        description="Who can sign in to the admin panel. Disabling a user signs them out everywhere."
        actions={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setForm({ email: "", name: "", role: "support", password: "" });
              setFormError("");
              setDialog({ kind: "create" });
            }}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Add admin
          </button>
        }
      />

      <Panel bodyClassName="overflow-x-auto">
        {!data ? (
          <Loading />
        ) : (
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last sign-in</th>
                <th className="text-right">Sessions</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => {
                const self = a.id === admin.id;
                return (
                  <tr key={a.id}>
                    <td>
                      <p className="font-medium">
                        {a.name} {self && <span className="text-xs text-base-content/60">(you)</span>}
                      </p>
                      <p className="text-xs text-base-content/60">{a.email}</p>
                    </td>
                    <td>
                      <select
                        className="select select-xs w-auto"
                        aria-label={`Role for ${a.email}`}
                        value={a.role}
                        disabled={self || busy}
                        title={ROLE_HELP[a.role]}
                        onChange={(e) => update(a, { role: e.target.value as AdminRole }, `${a.name} is now ${e.target.value}.`)}
                      >
                        <option value="owner">Owner</option>
                        <option value="support">Support</option>
                        <option value="editor">Editor</option>
                      </select>
                    </td>
                    <td>
                      <StatusBadge value={a.active ? "active" : "disabled"} />
                    </td>
                    <td className="whitespace-nowrap text-base-content/60" title={formatDateTime(a.lastLoginAt)}>
                      {a.lastLoginAt ? timeAgo(a.lastLoginAt) : "Never"}
                    </td>
                    <td className="text-right tabular-nums">{a.activeSessions}</td>
                    <td className="whitespace-nowrap text-right">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          setForm((f) => ({ ...f, password: "" }));
                          setFormError("");
                          setDialog({ kind: "reset", account: a });
                        }}
                      >
                        Reset password
                      </button>
                      {a.activeSessions > 0 && !self && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          disabled={busy}
                          onClick={() =>
                            run(async () => {
                              await adminFetch(`/admins/${a.id}/revoke-sessions`, { method: "POST" });
                              toast(`${a.name} has been signed out.`);
                              reload();
                            })
                          }
                        >
                          Sign out
                        </button>
                      )}
                      {!self && (
                        <button
                          type="button"
                          className={`btn btn-ghost btn-xs ${a.active ? "text-error" : ""}`}
                          disabled={busy}
                          onClick={() => update(a, { active: !a.active }, a.active ? `${a.name} disabled.` : `${a.name} enabled.`)}
                        >
                          {a.active ? "Disable" : "Enable"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Roles" className="mt-6">
        <ul className="space-y-1 text-sm">
          {(Object.keys(ROLE_HELP) as AdminRole[]).map((r) => (
            <li key={r}>
              <strong className="capitalize">{r}</strong>: {ROLE_HELP[r]}
            </li>
          ))}
        </ul>
      </Panel>

      <Modal
        open={dialog?.kind === "create"}
        title="Add an admin"
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button type="submit" form="create-admin-form" className="btn btn-primary" disabled={busy}>
              {busy ? "Adding…" : "Add admin"}
            </button>
          </>
        }
      >
        <form
          id="create-admin-form"
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await adminFetch("/admins", { json: form });
              toast(`${form.name} can now sign in.`);
              setDialog(null);
              reload();
            });
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Name</span>
            <input className="input w-full" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input type="email" className="input w-full" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Role</span>
            <select className="select w-full" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}>
              <option value="support">Support</option>
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </select>
            <span className="mt-1 block text-xs text-base-content/60">{ROLE_HELP[form.role]}</span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Temporary password</span>
            <input
              type="text"
              className="input w-full font-mono"
              required
              minLength={10}
              autoComplete="off"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <span className="mt-1 block text-xs text-base-content/60">At least 10 characters. Share it privately; they can change it under Account.</span>
          </label>
          {formError && <p className="text-sm text-error">{formError}</p>}
        </form>
      </Modal>

      <Modal
        open={dialog?.kind === "reset"}
        title={dialog?.kind === "reset" ? `Reset password for ${dialog.account.name}` : "Reset password"}
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button type="submit" form="reset-password-form" className="btn btn-primary" disabled={busy}>
              Set password
            </button>
          </>
        }
      >
        <form
          id="reset-password-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (dialog?.kind !== "reset") return;
            const target = dialog.account;
            run(async () => {
              await adminFetch(`/admins/${target.id}/reset-password`, { json: { password: form.password } });
              toast(`Password changed. ${target.name} has been signed out.`);
              setDialog(null);
              reload();
            });
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block font-medium">New password</span>
            <input
              type="text"
              className="input w-full font-mono"
              required
              minLength={10}
              autoComplete="off"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <p className="mt-2 text-xs text-base-content/60">They will be signed out of every device.</p>
          {formError && <p className="mt-2 text-sm text-error">{formError}</p>}
        </form>
      </Modal>
    </>
  );
}
