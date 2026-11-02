"use client";

import Link from "next/link";
import { useAdmin } from "@/components/admin/AdminShell";
import { useAdminQuery, useUrlFilters } from "@/lib/admin/client";
import { eventLabel, formatDateTime, humanize } from "@/lib/admin/format";
import type { ActivityLog, AuditLog, Paged, WebhookEvent } from "@/lib/admin/types";
import {
  EmptyState,
  ErrorAlert,
  Loading,
  Mono,
  PageHeader,
  Pagination,
  Panel,
  SearchInput,
  SelectFilter,
  StatusBadge,
} from "@/components/admin/ui";

type Tab = "activity" | "webhooks" | "audit";

const TABS: { value: Tab; label: string; ownerOnly?: boolean }[] = [
  { value: "activity", label: "Customer activity" },
  { value: "webhooks", label: "Razorpay webhooks" },
  { value: "audit", label: "Admin actions", ownerOnly: true },
];

function Details({ value }: { value?: Record<string, unknown> | null }) {
  if (!value || Object.keys(value).length === 0) return <span className="text-base-content/40">—</span>;
  return (
    <details className="max-w-md">
      <summary className="cursor-pointer text-xs text-base-content/60">Details</summary>
      <pre className="mt-1 max-h-48 overflow-auto rounded bg-base-200 p-2 text-[11px] leading-snug">{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
}

function OrderLink({ id }: { id?: string | null }) {
  if (!id) return <span className="text-base-content/40">—</span>;
  return (
    <Link href={`/admin/orders/${id}`} className="link link-hover font-mono text-xs">
      {id.slice(0, 8)}…
    </Link>
  );
}

export default function LogsView() {
  const { can } = useAdmin();
  const filters = useUrlFilters();
  const tab = (filters.get("tab") || "activity") as Tab;
  const page = Number(filters.get("page")) || 1;
  const { data: facets } = useAdminQuery<{ activityEvents: string[]; webhookTypes: string[] }>("/logs/facets");

  const params = new URLSearchParams({ page: String(page), pageSize: "50" });
  const keys: Record<Tab, string[]> = {
    activity: ["event", "status", "email", "paymentId"],
    webhooks: ["eventType", "status", "q"],
    audit: ["action", "adminEmail", "target"],
  };
  for (const k of keys[tab]) if (filters.get(k)) params.set(k, filters.get(k));

  const { data, error, loading, reload } = useAdminQuery<Paged<unknown>>(`/logs/${tab}?${params}`);

  const switchTab = (next: Tab) => {
    const reset: Record<string, null | string> = { tab: next === "activity" ? "" : next };
    for (const list of Object.values(keys)) for (const k of list) reset[k] = null;
    filters.set(reset);
  };

  return (
    <>
      <PageHeader title="Logs" description="Raw event logs. Customer activity is kept for 90 days. For the upload → payment → download view, see User journeys." />

      <div role="tablist" className="tabs tabs-box tabs-sm mb-4 w-fit">
        {TABS.filter((t) => !t.ownerOnly || can("owner")).map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            className={`tab ${tab === t.value ? "tab-active" : ""}`}
            onClick={() => switchTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tab === "activity" && (
          <>
            <SelectFilter
              label="Event"
              value={filters.get("event")}
              onChange={(event) => filters.set({ event })}
              options={(facets?.activityEvents || []).map((e) => ({ value: e, label: eventLabel(e) }))}
            />
            <SearchInput value={filters.get("email")} onChange={(email) => filters.set({ email })} placeholder="Filter by email" />
            <SearchInput value={filters.get("paymentId")} onChange={(paymentId) => filters.set({ paymentId })} placeholder="Payment ID" />
          </>
        )}
        {tab === "webhooks" && (
          <>
            <SelectFilter
              label="Type"
              value={filters.get("eventType")}
              onChange={(eventType) => filters.set({ eventType })}
              options={(facets?.webhookTypes || []).map((e) => ({ value: e, label: e }))}
            />
            <SelectFilter
              label="Status"
              value={filters.get("status")}
              onChange={(status) => filters.set({ status })}
              options={["processing", "processed", "failed"].map((v) => ({ value: v, label: humanize(v) }))}
            />
            <SearchInput value={filters.get("q")} onChange={(q) => filters.set({ q })} placeholder="Event or Razorpay ID" />
          </>
        )}
        {tab === "audit" && (
          <>
            <SearchInput value={filters.get("action")} onChange={(action) => filters.set({ action })} placeholder="Action, e.g. order.refund" />
            <SearchInput value={filters.get("adminEmail")} onChange={(adminEmail) => filters.set({ adminEmail })} placeholder="Admin email" />
          </>
        )}
      </div>

      {error && <ErrorAlert error={error} onRetry={reload} />}

      <Panel bodyClassName="overflow-x-auto">
        {!data && !error && <Loading />}
        {data && data.items.length === 0 && <EmptyState title="No log entries" />}
        {data && data.items.length > 0 && (
          <table className={`table table-sm align-top ${loading ? "opacity-60" : ""}`}>
            {tab === "activity" && (
              <>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Email</th>
                    <th>Order</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.items as ActivityLog[]).map((l, i) => (
                    <tr key={i}>
                      <td className="whitespace-nowrap text-base-content/60">{formatDateTime(l.createdAt)}</td>
                      <td className="whitespace-nowrap font-medium">{eventLabel(l.event)}</td>
                      <td>
                        <StatusBadge value={l.status} />
                      </td>
                      <td className="max-w-56 truncate">{l.email || "—"}</td>
                      <td>
                        <OrderLink id={l.paymentId} />
                      </td>
                      <td>
                        <Details value={l.metadata} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
            {tab === "webhooks" && (
              <>
                <thead>
                  <tr>
                    <th>Received</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Razorpay order</th>
                    <th>Event ID</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.items as WebhookEvent[]).map((w) => (
                    <tr key={w.eventId}>
                      <td className="whitespace-nowrap text-base-content/60">{formatDateTime(w.createdAt)}</td>
                      <td className="whitespace-nowrap font-medium">{w.eventType}</td>
                      <td>
                        <StatusBadge value={w.status} />
                      </td>
                      <td>
                        <Mono>{w.razorpayOrderId || "—"}</Mono>
                      </td>
                      <td>
                        <Mono>{w.eventId}</Mono>
                      </td>
                      <td>
                        <Details value={w.metadata} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
            {tab === "audit" && (
              <>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.items as AuditLog[]).map((a, i) => (
                    <tr key={i}>
                      <td className="whitespace-nowrap text-base-content/60">{formatDateTime(a.createdAt)}</td>
                      <td className="max-w-56 truncate">{a.adminName || a.adminEmail || "System"}</td>
                      <td className="whitespace-nowrap font-mono text-xs">{a.action}</td>
                      <td>
                        {a.target.type === "order" ? <OrderLink id={a.target.id} /> : <Mono>{a.target.id || a.target.type}</Mono>}
                      </td>
                      <td>
                        <Details value={a.details} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        )}
        {data && (
          <div className="px-3 pb-3">
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => filters.set({ page: p })} />
          </div>
        )}
      </Panel>
    </>
  );
}
