"use client";

import Link from "next/link";
import { Check, Minus, X } from "lucide-react";
import { useAdminQuery, useUrlFilters } from "@/lib/admin/client";
import { formatDateTime, formatMoney, formatMs, timeAgo } from "@/lib/admin/format";
import type { Journey, JourneyStage, Paged } from "@/lib/admin/types";
import { EmptyState, ErrorAlert, Loading, PageHeader, Pagination, Panel, PlanBadge, SearchInput } from "@/components/admin/ui";

type JourneysResponse = Paged<Journey> & { counts: Record<JourneyStage, number> };

const TABS: { value: "" | JourneyStage; label: string; hint: string }[] = [
  { value: "", label: "All", hint: "" },
  { value: "uploaded", label: "Uploaded only", hint: "Uploaded a photo but never started checkout" },
  { value: "checkout", label: "Checkout, not paid", hint: "Started checkout but did not pay" },
  { value: "paid", label: "Paid, not downloaded", hint: "Paid but have not downloaded the photo yet" },
  { value: "downloaded", label: "Downloaded", hint: "Paid and downloaded their photo" },
  { value: "failed", label: "Upload failed", hint: "The photo could not be processed" },
];

/** One step of the journey: done, not reached, or failed. */
function Step({ state, label, detail }: { state: "done" | "no" | "failed"; label: string; detail?: string }) {
  const icon =
    state === "done" ? (
      <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
    ) : state === "failed" ? (
      <X className="h-3.5 w-3.5 text-error" aria-hidden="true" />
    ) : (
      <Minus className="h-3.5 w-3.5 text-base-content/30" aria-hidden="true" />
    );
  return (
    <span className={`flex items-center gap-1 whitespace-nowrap text-xs ${state === "no" ? "text-base-content/40" : ""}`}>
      {icon}
      <span>
        {label}
        <span className="sr-only">: {state === "done" ? "done" : state === "failed" ? "failed" : "not reached"}</span>
      </span>
      {detail && <span className="text-base-content/60">{detail}</span>}
    </span>
  );
}

export default function JourneysView() {
  const filters = useUrlFilters();
  const stage = filters.get("stage") as "" | JourneyStage;
  const page = Number(filters.get("page")) || 1;

  const params = new URLSearchParams({ page: String(page), pageSize: "25" });
  for (const k of ["stage", "country", "q", "from", "to"]) if (filters.get(k)) params.set(k, filters.get(k));
  const { data, error, loading, reload } = useAdminQuery<JourneysResponse>(`/journeys?${params}`);

  const total = data ? Object.values(data.counts).reduce((n, c) => n + c, 0) : null;
  const activeTab = TABS.find((t) => t.value === stage) || TABS[0];

  return (
    <>
      <PageHeader
        title="User journeys"
        description="Every photo uploaded to the photo maker and how far that person got: upload → checkout → payment → download. Kept for 90 days."
      />

      <div role="tablist" className="tabs tabs-box tabs-sm mb-3 w-fit max-w-full overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value || "all"}
            type="button"
            role="tab"
            aria-selected={stage === t.value}
            className={`tab whitespace-nowrap ${stage === t.value ? "tab-active" : ""}`}
            onClick={() => filters.set({ stage: t.value })}
          >
            {t.label}
            {data && <span className="ml-1.5 text-xs opacity-70">{t.value ? data.counts[t.value] : total}</span>}
          </button>
        ))}
      </div>
      {activeTab.hint && <p className="mb-3 text-sm text-base-content/60">{activeTab.hint}.</p>}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={filters.get("q")} onChange={(q) => filters.set({ q })} placeholder="Email, payment or result ID" />
        <input
          key={filters.get("country")}
          type="text"
          className="input input-sm w-24 uppercase"
          placeholder="Country"
          aria-label="Country code"
          maxLength={3}
          defaultValue={filters.get("country")}
          onBlur={(e) =>
            e.target.value.trim().toUpperCase() !== filters.get("country") &&
            filters.set({ country: e.target.value.trim().toUpperCase() })
          }
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        />
        <label className="flex items-center gap-1 text-sm text-base-content/60">
          From
          <input type="date" className="input input-sm w-auto" value={filters.get("from")} onChange={(e) => filters.set({ from: e.target.value })} />
        </label>
        <label className="flex items-center gap-1 text-sm text-base-content/60">
          To
          <input type="date" className="input input-sm w-auto" value={filters.get("to")} onChange={(e) => filters.set({ to: e.target.value })} />
        </label>
      </div>

      {error && <ErrorAlert error={error} onRetry={reload} />}

      <Panel bodyClassName="overflow-x-auto">
        {!data && !error && <Loading />}
        {data && data.items.length === 0 && (
          <EmptyState title="No journeys found" hint="Uploads are recorded from the moment this version is deployed." />
        )}
        {data && data.items.length > 0 && (
          <table className={`table table-sm ${loading ? "opacity-60" : ""}`}>
            <thead>
              <tr>
                <th>Uploaded</th>
                <th>Country</th>
                <th>Customer</th>
                <th>Journey</th>
                <th className="text-right">Paid</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((j, i) => {
                const paid = j.stage === "paid" || j.stage === "downloaded";
                return (
                  <tr key={j.resultId || `${j.uploadedAt}-${i}`} className="align-top hover:bg-base-200">
                    <td className="whitespace-nowrap">
                      <span title={formatDateTime(j.uploadedAt)}>{timeAgo(j.uploadedAt)}</span>
                      <span className="block text-xs text-base-content/60">processed in {formatMs(j.durationMs)}</span>
                    </td>
                    <td>
                      {j.countryCode || "—"} <span className="text-xs text-base-content/60">{j.documentType}</span>
                    </td>
                    <td className="max-w-64">
                      {j.order ? (
                        <>
                          <Link href={`/admin/orders/${j.order.paymentId}`} className="link link-hover block truncate font-medium">
                            {j.order.email}
                          </Link>
                          <PlanBadge plan={j.order.planType} />
                        </>
                      ) : (
                        <span className="text-xs text-base-content/50">Anonymous (no checkout)</span>
                      )}
                    </td>
                    <td>
                      {j.stage === "failed" ? (
                        <div className="space-y-1">
                          <Step state="failed" label="Upload failed" />
                          {j.error && <p className="max-w-md text-xs text-base-content/70">{j.error}</p>}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <Step state="done" label="Uploaded" />
                          <Step
                            state={j.checkouts > 0 ? "done" : "no"}
                            label="Checkout"
                            detail={j.checkouts > 1 ? `×${j.checkouts}` : undefined}
                          />
                          <Step
                            state={paid ? "done" : j.order?.status === "failed" ? "failed" : "no"}
                            label={j.order?.status === "failed" ? "Payment failed" : "Paid"}
                            detail={paid && j.order?.paidAt ? timeAgo(j.order.paidAt) : undefined}
                          />
                          <Step
                            state={j.downloads > 0 ? "done" : "no"}
                            label="Downloaded"
                            detail={j.downloads > 0 ? `${j.downloads}× · last ${timeAgo(j.lastDownloadAt)}` : undefined}
                          />
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-right tabular-nums">
                      {paid && j.order ? formatMoney(j.order.amount, j.order.currency) : <span className="text-base-content/40">—</span>}
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
