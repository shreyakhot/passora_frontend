"use client";

import Link from "next/link";
import { useAdminQuery, useUrlFilters } from "@/lib/admin/client";
import { formatDate, formatDateTime, formatMoney, timeAgo } from "@/lib/admin/format";
import type { Customer, OrderListItem, Paged } from "@/lib/admin/types";
import {
  EmptyState,
  ErrorAlert,
  Loading,
  PageHeader,
  Pagination,
  Panel,
  PlanBadge,
  SearchInput,
  StatusBadge,
} from "@/components/admin/ui";

export function CustomersView() {
  const filters = useUrlFilters();
  const page = Number(filters.get("page")) || 1;
  const sort = filters.get("sort") || "recent";
  const params = new URLSearchParams({ page: String(page), pageSize: "25", sort });
  if (filters.get("q")) params.set("q", filters.get("q"));

  const { data, error, loading, reload } = useAdminQuery<Paged<Customer>>(`/customers?${params}`);

  return (
    <>
      <PageHeader title="Customers" description="Orders grouped by email address. Spend is net of refunds." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={filters.get("q")} onChange={(q) => filters.set({ q })} placeholder="Search email" />
        <select
          className="select select-sm w-auto"
          aria-label="Sort"
          value={sort}
          onChange={(e) => filters.set({ sort: e.target.value === "recent" ? "" : e.target.value })}
        >
          <option value="recent">Most recent order</option>
          <option value="orders">Most paid orders</option>
        </select>
      </div>

      {error && <ErrorAlert error={error} onRetry={reload} />}

      <Panel bodyClassName="overflow-x-auto">
        {!data && !error && <Loading />}
        {data && data.items.length === 0 && <EmptyState title="No customers found" />}
        {data && data.items.length > 0 && (
          <table className={`table table-sm ${loading ? "opacity-60" : ""}`}>
            <thead>
              <tr>
                <th>Email</th>
                <th className="text-right">Paid / orders</th>
                <th className="text-right">Spent</th>
                <th>Countries</th>
                <th>Last order</th>
                <th>First order</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((c) => (
                <tr key={c.email} className="hover:bg-base-200">
                  <td className="max-w-72">
                    <Link href={`/admin/customers/${encodeURIComponent(c.email)}`} className="link link-hover block truncate font-medium">
                      {c.email}
                    </Link>
                    {c.expertOrders > 0 && <span className="text-xs text-base-content/60">{c.expertOrders} Expert Edit</span>}
                  </td>
                  <td className="text-right tabular-nums">
                    {c.paidOrders} / {c.orders}
                  </td>
                  <td className="whitespace-nowrap text-right tabular-nums">
                    {c.spent.length ? c.spent.map((s) => formatMoney(s.amount, s.currency)).join(" + ") : "—"}
                  </td>
                  <td>{c.countries.join(", ") || "—"}</td>
                  <td className="whitespace-nowrap text-base-content/60" title={formatDateTime(c.lastOrderAt)}>
                    {timeAgo(c.lastOrderAt)}
                  </td>
                  <td className="whitespace-nowrap text-base-content/60">{formatDate(c.firstOrderAt)}</td>
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

export function CustomerDetailView({ email }: { email: string }) {
  const { data, error, reload } = useAdminQuery<{ email: string; orders: OrderListItem[] }>(
    `/customers/${encodeURIComponent(email)}`
  );

  if (error) return <ErrorAlert error={error} onRetry={reload} />;
  if (!data) return <Loading />;

  const paid = data.orders.filter((o) => o.status === "paid" || o.status === "refunded");
  const spent = new Map<string, number>();
  for (const o of paid) spent.set(o.currency, (spent.get(o.currency) || 0) + o.amount - (o.refundedAmount || 0));

  return (
    <>
      <PageHeader
        title={data.email}
        description={`${data.orders.length} orders · ${paid.length} paid · ${
          [...spent].map(([cur, amt]) => formatMoney(amt, cur)).join(" + ") || "nothing spent"
        }`}
        back={{ href: "/admin/customers", label: "Customers" }}
        actions={
          <a href={`mailto:${data.email}`} className="btn btn-sm">
            Email customer
          </a>
        }
      />
      <Panel bodyClassName="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Order</th>
              <th>Plan</th>
              <th>Country</th>
              <th className="text-right">Amount</th>
              <th>Payment</th>
              <th>Fulfilment</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map((o) => (
              <tr key={o.paymentId} className="hover:bg-base-200">
                <td>
                  <Link href={`/admin/orders/${o.paymentId}`} className="link link-hover font-mono text-xs">
                    {o.paymentId.slice(0, 8)}…
                  </Link>
                </td>
                <td>
                  <PlanBadge plan={o.planType} />
                </td>
                <td>{o.metadata?.countryName || o.metadata?.countryCode || "—"}</td>
                <td className="text-right tabular-nums">{formatMoney(o.amount, o.currency)}</td>
                <td>
                  <StatusBadge value={o.status} />
                </td>
                <td>{o.status === "paid" ? <StatusBadge value={o.fulfillmentStatus} /> : <span className="text-base-content/40">—</span>}</td>
                <td className="whitespace-nowrap text-base-content/60">{formatDateTime(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
