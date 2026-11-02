"use client";

import Link from "next/link";
import { useAdmin } from "@/components/admin/AdminShell";
import { useAdminQuery, useUrlFilters } from "@/lib/admin/client";
import { formatDateTime, timeAgo } from "@/lib/admin/format";
import type { ExpertQueueItem, Paged } from "@/lib/admin/types";
import { EmptyState, ErrorAlert, Loading, PageHeader, Pagination, Panel, SearchInput, StatusBadge } from "@/components/admin/ui";

type QueueResponse = Paged<ExpertQueueItem> & { counts: Record<"pending" | "in_review" | "completed", number> };

const TABS = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Waiting" },
  { value: "in_review", label: "In review" },
  { value: "completed", label: "Delivered" },
];

export default function ExpertQueueView() {
  const { admin } = useAdmin();
  const filters = useUrlFilters();
  const status = filters.get("status") || "open";
  const mine = filters.get("mine") === "1";
  const page = Number(filters.get("page")) || 1;

  const params = new URLSearchParams({ status, page: String(page), pageSize: "25" });
  if (mine) params.set("mine", "true");
  if (filters.get("q")) params.set("q", filters.get("q"));

  const { data, error, loading, reload } = useAdminQuery<QueueResponse>(`/expert?${params}`);

  const countFor = (tab: string) => {
    if (!data) return null;
    if (tab === "open") return data.counts.pending + data.counts.in_review;
    return data.counts[tab as keyof QueueResponse["counts"]];
  };

  return (
    <>
      <PageHeader
        title="Expert Edit"
        description="Paid Expert Edit orders, oldest first. Claim an order, edit the photo, then deliver it to the customer."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="tablist" className="tabs tabs-box tabs-sm">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={status === t.value}
              className={`tab ${status === t.value ? "tab-active" : ""}`}
              onClick={() => filters.set({ status: t.value === "open" ? "" : t.value })}
            >
              {t.label}
              {countFor(t.value) !== null && <span className="ml-1.5 text-xs opacity-70">{countFor(t.value)}</span>}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={mine}
            onChange={(e) => filters.set({ mine: e.target.checked ? "1" : "" })}
          />
          Only mine
        </label>
        <SearchInput value={filters.get("q")} onChange={(q) => filters.set({ q })} placeholder="Search email or payment ID" />
      </div>

      {error && <ErrorAlert error={error} onRetry={reload} />}

      <Panel bodyClassName="overflow-x-auto">
        {!data && !error && <Loading />}
        {data && data.items.length === 0 && <EmptyState title="Nothing here" hint={status === "open" ? "The queue is clear." : undefined} />}
        {data && data.items.length > 0 && (
          <table className={`table table-sm ${loading ? "opacity-60" : ""}`}>
            <thead>
              <tr>
                <th className="w-16">Photo</th>
                <th>Customer</th>
                <th>Country</th>
                <th>Status</th>
                <th>Editor</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((o) => {
                const assignee = o.expertEdit?.assignee;
                return (
                  <tr key={o.paymentId} className="hover:bg-base-200">
                    <td>
                      {o.image?.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail, admin only
                        <img src={o.image.previewUrl} alt="" className="h-14 w-11 rounded border border-base-300 object-cover" loading="lazy" />
                      ) : (
                        <span className="block h-14 w-11 rounded bg-base-200" />
                      )}
                    </td>
                    <td className="max-w-64">
                      <Link href={`/admin/expert/${o.paymentId}`} className="link link-hover block truncate font-medium">
                        {o.email}
                      </Link>
                      <span className="text-xs text-base-content/60">{o.image?.dimensions ? `${o.image.dimensions} px` : ""}</span>
                    </td>
                    <td>{o.metadata?.countryName || o.metadata?.countryCode || "—"}</td>
                    <td>
                      <StatusBadge value={o.expertReviewStatus || "pending"} label={o.expertReviewStatus === "completed" ? "Delivered" : undefined} />
                    </td>
                    <td>{assignee ? (assignee.id === admin.id ? "You" : assignee.name) : <span className="text-base-content/40">—</span>}</td>
                    <td className="whitespace-nowrap text-base-content/60" title={formatDateTime(o.paidAt)}>
                      {timeAgo(o.paidAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
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
