"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useAdminQuery } from "@/lib/admin/client";
import { formatMoney, formatMs, formatNumber, planLabel, timeAgo } from "@/lib/admin/format";
import type { DashboardData, Money } from "@/lib/admin/types";
import { BarList, DailyRevenueChart, FunnelChart } from "@/components/admin/charts";
import { ErrorAlert, Loading, PageHeader, Panel, PlanBadge, StatTile, StatusBadge } from "@/components/admin/ui";

const RANGES = [7, 30, 90];

function moneyList(list: Money[]): string {
  if (!list.length) return formatMoney(0, "USD");
  return list.map((m) => formatMoney(m.amount, m.currency)).join(" + ");
}

export default function DashboardView() {
  const [days, setDays] = useState(30);
  const { data, error, loading, reload } = useAdminQuery<DashboardData>(`/dashboard?days=${days}`);
  const [currencyChoice, setCurrencyChoice] = useState<string | null>(null);

  const currencies = data ? Array.from(new Set(data.revenue.map((r) => r.currency))) : [];
  const currency = currencyChoice && currencies.includes(currencyChoice) ? currencyChoice : currencies[0] || "USD";

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Paid orders and revenue for the last ${days} days (UTC). Revenue is net of refunds.`}
        actions={
          <>
            <div className="join" role="group" aria-label="Date range">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`btn btn-sm join-item ${r === days ? "btn-active" : ""}`}
                  aria-pressed={r === days}
                  onClick={() => setDays(r)}
                >
                  {r} days
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-sm btn-ghost" onClick={reload} aria-label="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            </button>
          </>
        }
      />

      {error && <ErrorAlert error={error} onRetry={reload} />}
      {!data && !error && <Loading />}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Net revenue"
              value={moneyList(data.revenue)}
              hint={`Today: ${moneyList(data.revenueToday)}`}
            />
            <StatTile
              label="Paid orders"
              value={formatNumber(data.revenue.reduce((n, r) => n + (r.orders || 0), 0))}
              hint={`Today: ${formatNumber(data.revenueToday.reduce((n, r) => n + (r.orders || 0), 0))}`}
            />
            <StatTile
              label="Checkouts that were paid"
              value={data.orders.paidRate === null ? "—" : `${Math.round(data.orders.paidRate * 100)}%`}
              hint={`${formatNumber(data.orders.paid)} of ${formatNumber(data.orders.created)} orders started`}
            />
            <StatTile
              label="Photos uploaded"
              value={formatNumber(data.funnel.uploaded)}
              hint={
                data.funnel.uploaded || data.funnel.failed
                  ? `${formatNumber(data.funnel.failed)} failed · avg ${formatMs(data.funnel.avgProcessingMs)}`
                  : "No uploads recorded yet"
              }
              href="/admin/journeys"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Expert Edit waiting"
              value={data.queues.expertPending}
              hint={`${data.queues.expertInReview} in review`}
              href="/admin/expert"
              tone={data.queues.expertPending > 0 ? "warning" : undefined}
            />
            <StatTile
              label="Fulfilment failed"
              value={data.queues.fulfillmentFailed}
              hint="Paid but no download link"
              href="/admin/orders?status=paid&fulfillment=failed"
              tone={data.queues.fulfillmentFailed > 0 ? "error" : undefined}
            />
            <StatTile
              label="Fulfilment stuck"
              value={data.queues.fulfillmentStuck}
              hint="Processing for over 10 min"
              href="/admin/orders?status=paid&fulfillment=processing"
              tone={data.queues.fulfillmentStuck > 0 ? "error" : undefined}
            />
            <StatTile
              label="Email failed"
              value={data.queues.emailFailed}
              hint="Customer email not delivered"
              href="/admin/orders?status=paid&emailStatus=failed"
              tone={data.queues.emailFailed > 0 ? "warning" : undefined}
            />
          </div>

          <Panel
            title="Customer journey"
            actions={
              <Link href="/admin/journeys" className="link link-hover text-sm">
                See every journey
              </Link>
            }
          >
            {data.funnel.uploaded === 0 ? (
              <p className="text-sm text-base-content/60">
                No photo uploads recorded in this period. Uploads are tracked from the moment this version is deployed.
              </p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <FunnelChart
                  steps={[
                    { key: "uploaded", label: "Photo uploaded", value: data.funnel.uploaded, href: "/admin/journeys" },
                    { key: "checkout", label: "Started checkout", value: data.funnel.checkout, href: "/admin/journeys?stage=checkout" },
                    { key: "paid", label: "Paid", value: data.funnel.paid, href: "/admin/journeys?stage=paid" },
                    { key: "downloaded", label: "Downloaded photo", value: data.funnel.downloaded, href: "/admin/journeys?stage=downloaded" },
                  ]}
                />
                <div className="space-y-3 text-sm">
                  <p className="text-base-content/70">
                    Each photo uploaded in the last {days} days, and how far that person got.
                  </p>
                  <p>
                    <Link href="/admin/journeys?stage=paid" className="link">
                      {formatNumber(data.funnel.paid - data.funnel.downloaded)} paid but have not downloaded yet
                    </Link>
                  </p>
                  <p>
                    <Link href="/admin/journeys?stage=failed" className="link">
                      {formatNumber(data.funnel.failed)} uploads failed processing
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="Net revenue per day"
            actions={
              currencies.length > 1 && (
                <select
                  className="select select-xs w-auto"
                  aria-label="Currency"
                  value={currency}
                  onChange={(e) => setCurrencyChoice(e.target.value)}
                >
                  {currencies.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              )
            }
          >
            <DailyRevenueChart
              currency={currency}
              points={data.series.map((d) => ({ date: d.date, orders: d.orders, amount: d.revenue[currency] || 0 }))}
            />
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Top countries (paid orders)">
              {data.topCountries.length ? (
                <BarList
                  ariaLabel="Paid orders by country"
                  items={data.topCountries.map((c) => ({
                    key: c.countryCode,
                    label: c.countryName || c.countryCode,
                    value: c.orders,
                    display: formatNumber(c.orders),
                  }))}
                />
              ) : (
                <p className="text-sm text-base-content/60">No paid orders in this range.</p>
              )}
            </Panel>

            <Panel title="Plans">
              {data.plans.length ? (
                <BarList
                  ariaLabel="Paid orders by plan"
                  items={data.plans.map((p) => ({
                    key: `${p.planType}-${p.currency}`,
                    label: `${planLabel(p.planType)}${currencies.length > 1 ? ` (${p.currency})` : ""}`,
                    value: p.orders,
                    display: `${formatNumber(p.orders)} · ${formatMoney(p.amount, p.currency)}`,
                  }))}
                />
              ) : (
                <p className="text-sm text-base-content/60">No paid orders in this range.</p>
              )}
            </Panel>
          </div>

          <Panel
            title="Latest orders"
            actions={
              <Link href="/admin/orders" className="link link-hover text-sm">
                All orders
              </Link>
            }
            bodyClassName="overflow-x-auto"
          >
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Country</th>
                  <th className="text-right">Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.paymentId} className="hover:bg-base-200">
                    <td className="max-w-56 truncate">
                      <Link href={`/admin/orders/${o.paymentId}`} className="link link-hover">
                        {o.email}
                      </Link>
                    </td>
                    <td>
                      <PlanBadge plan={o.planType} />
                    </td>
                    <td>{o.metadata?.countryName || "—"}</td>
                    <td className="text-right tabular-nums">{formatMoney(o.amount, o.currency)}</td>
                    <td>
                      <StatusBadge value={o.status} />
                    </td>
                    <td className="whitespace-nowrap text-base-content/60">{timeAgo(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      )}
    </>
  );
}
