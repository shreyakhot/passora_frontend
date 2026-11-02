"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { useAdminQuery, useUrlFilters } from "@/lib/admin/client";
import { formatDateTime, formatMoney } from "@/lib/admin/format";
import type { OrderListItem, Paged } from "@/lib/admin/types";
import {
  EmptyState,
  ErrorAlert,
  Loading,
  PageHeader,
  Pagination,
  Panel,
  PlanBadge,
  SearchInput,
  SelectFilter,
  StatusBadge,
} from "@/components/admin/ui";

const FILTER_KEYS = ["q", "status", "fulfillment", "plan", "country", "emailStatus", "from", "to", "sort"];

export default function OrdersView() {
  const filters = useUrlFilters();
  const page = Number(filters.get("page")) || 1;

  const params = new URLSearchParams();
  for (const k of FILTER_KEYS) if (filters.get(k)) params.set(k, filters.get(k));
  const filterQuery = params.toString();
  params.set("page", String(page));
  params.set("pageSize", "25");

  const { data, error, loading, reload } = useAdminQuery<Paged<OrderListItem>>(`/orders?${params}`);
  const hasFilters = FILTER_KEYS.some((k) => filters.get(k));

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every checkout, paid or not. Search by email, payment ID, Razorpay ID, invoice number or result ID."
        actions={
          <a
            className="btn btn-sm"
            href={`/api/admin/orders/export.csv${filterQuery ? `?${filterQuery}` : ""}`}
            download
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </a>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={filters.get("q")} onChange={(q) => filters.set({ q })} placeholder="Search orders" />
        <SelectFilter
          label="Payment"
          value={filters.get("status")}
          onChange={(status) => filters.set({ status })}
          options={["pending", "paid", "failed", "refunded", "cancelled"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))}
        />
        <SelectFilter
          label="Fulfilment"
          value={filters.get("fulfillment")}
          onChange={(fulfillment) => filters.set({ fulfillment })}
          options={["pending", "processing", "completed", "failed"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))}
        />
        <SelectFilter
          label="Plan"
          value={filters.get("plan")}
          onChange={(plan) => filters.set({ plan })}
          options={[
            { value: "standard", label: "Standard" },
            { value: "expert_edit", label: "Expert Edit" },
          ]}
        />
        <SelectFilter
          label="Email"
          value={filters.get("emailStatus")}
          onChange={(emailStatus) => filters.set({ emailStatus })}
          options={["pending", "sent", "failed"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))}
        />
        <input
          key={filters.get("country")}
          type="text"
          className="input input-sm w-24 uppercase"
          placeholder="Country"
          aria-label="Country code"
          maxLength={3}
          defaultValue={filters.get("country")}
          onBlur={(e) => e.target.value.trim().toUpperCase() !== filters.get("country") && filters.set({ country: e.target.value.trim().toUpperCase() })}
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
        <select
          className="select select-sm w-auto"
          aria-label="Sort"
          value={filters.get("sort") || "newest"}
          onChange={(e) => filters.set({ sort: e.target.value === "newest" ? "" : e.target.value })}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="amount_desc">Highest amount</option>
          <option value="amount_asc">Lowest amount</option>
        </select>
        {hasFilters && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => filters.set(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])))}
          >
            Clear filters
          </button>
        )}
      </div>

      {error && <ErrorAlert error={error} onRetry={reload} />}

      <Panel bodyClassName="overflow-x-auto">
        {!data && !error && <Loading />}
        {data && data.items.length === 0 && (
          <EmptyState title="No orders found" hint={hasFilters ? "Try removing a filter." : undefined} />
        )}
        {data && data.items.length > 0 && (
          <table className={`table table-sm ${loading ? "opacity-60" : ""}`}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Country</th>
                <th className="text-right">Amount</th>
                <th>Payment</th>
                <th>Fulfilment</th>
                <th>Email</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((o) => (
                <tr key={o.paymentId} className="hover:bg-base-200">
                  <td className="max-w-64">
                    <Link href={`/admin/orders/${o.paymentId}`} className="link link-hover block truncate font-medium">
                      {o.email}
                    </Link>
                    <span className="block truncate font-mono text-[11px] text-base-content/50">{o.paymentId}</span>
                  </td>
                  <td>
                    <PlanBadge plan={o.planType} />
                  </td>
                  <td className="whitespace-nowrap">{o.metadata?.countryName || o.metadata?.countryCode || "—"}</td>
                  <td className="whitespace-nowrap text-right tabular-nums">
                    {formatMoney(o.amount, o.currency)}
                    {!!o.refundedAmount && (
                      <span className="block text-[11px] text-base-content/60">
                        −{formatMoney(o.refundedAmount, o.currency)} refunded
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge value={o.status} />
                  </td>
                  <td>{o.status === "paid" || o.status === "refunded" ? <StatusBadge value={o.fulfillmentStatus} /> : <span className="text-base-content/40">—</span>}</td>
                  <td>{o.status === "paid" ? <StatusBadge value={o.emailDelivery?.status} /> : <span className="text-base-content/40">—</span>}</td>
                  <td className="whitespace-nowrap text-base-content/60">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
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
