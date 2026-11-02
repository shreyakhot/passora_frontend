"use client";

/**
 * Admin dashboard charts — plain HTML/CSS, single series, no chart library.
 * Marks use the primary hue; all text uses text tokens. Each chart has a
 * per-mark tooltip and a table view.
 */

import { useState } from "react";
import Link from "next/link";
import { formatMoney, formatMoneyCompact } from "@/lib/admin/format";

// Round the axis max up to a clean number (1, 2, 2.5, 5 × 10^n)
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (step * exp >= value) return step * exp;
  }
  return 10 * exp;
}

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export interface DailyPoint {
  date: string;
  orders: number;
  /** smallest currency unit */
  amount: number;
}

export interface DailyRevenueChartProps {
  points: DailyPoint[];
  currency: string;
}

/** Column chart of daily net revenue, with orders in the tooltip. */
export function DailyRevenueChart({ points, currency }: DailyRevenueChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const max = niceMax(Math.max(0, ...points.map((p) => p.amount)));
  const ticks = [max, max / 2, 0];
  const hovered = active !== null ? points[active] : null;

  return (
    <figure>
      <div className="relative flex gap-2">
        {/* Y axis */}
        <div className="flex h-48 flex-col justify-between text-right text-[11px] tabular-nums text-base-content/60" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="leading-none">
              {formatMoneyCompact(t, currency)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Gridlines */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48" aria-hidden="true">
            <div className="absolute inset-x-0 top-0 border-t border-base-300" />
            <div className="absolute inset-x-0 top-1/2 border-t border-base-300" />
            <div className="absolute inset-x-0 bottom-0 border-t border-base-content/30" />
          </div>

          {/* Columns */}
          <div
            className="relative flex h-48 items-end gap-0.5"
            role="img"
            aria-label={`Daily net revenue in ${currency} for the last ${points.length} days`}
            onMouseLeave={() => setActive(null)}
          >
            {points.map((p, i) => (
              <button
                type="button"
                key={p.date}
                className="group flex h-full flex-1 items-end justify-center focus:outline-none"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${shortDate(p.date)}: ${formatMoney(p.amount, currency)}, ${p.orders} orders`}
              >
                <span
                  className={`block w-full max-w-6 rounded-t-[4px] transition-opacity ${
                    p.amount > 0 ? "bg-primary" : "bg-transparent"
                  } ${active !== null && active !== i ? "opacity-50" : ""} group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary`}
                  style={{ height: `${(p.amount / max) * 100}%`, minHeight: p.amount > 0 ? 2 : 0 }}
                />
              </button>
            ))}
          </div>

          {/* Tooltip */}
          {hovered && active !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-xs shadow-md"
              style={{ left: `${((active + 0.5) / points.length) * 100}%` }}
              role="status"
            >
              <p className="font-semibold">{shortDate(hovered.date)}</p>
              <p className="tabular-nums">{formatMoney(hovered.amount, currency)} net</p>
              <p className="tabular-nums text-base-content/60">
                {hovered.orders} paid order{hovered.orders === 1 ? "" : "s"}
              </p>
            </div>
          )}

          {/* X axis: first, middle, last */}
          <div className="mt-1 flex justify-between text-[11px] text-base-content/60" aria-hidden="true">
            <span>{points[0] && shortDate(points[0].date)}</span>
            <span>{points[Math.floor(points.length / 2)] && shortDate(points[Math.floor(points.length / 2)].date)}</span>
            <span>{points.at(-1) && shortDate(points.at(-1)!.date)}</span>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 flex justify-end">
        <button type="button" className="btn btn-ghost btn-xs" onClick={() => setShowTable((v) => !v)} aria-expanded={showTable}>
          {showTable ? "Hide table" : "Show as table"}
        </button>
      </figcaption>
      {showTable && (
        <div className="max-h-64 overflow-auto">
          <table className="table table-xs">
            <thead>
              <tr>
                <th>Date</th>
                <th className="text-right">Paid orders</th>
                <th className="text-right">Net revenue</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.date}>
                  <td>{shortDate(p.date)}</td>
                  <td className="text-right tabular-nums">{p.orders}</td>
                  <td className="text-right tabular-nums">{formatMoney(p.amount, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  display: string;
}

/** Horizontal bars with the label above and the value at the tip. */
export function BarList({ items, ariaLabel }: { items: BarListItem[]; ariaLabel: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-3" aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={item.key} title={`${item.label}: ${item.display}`}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate">{item.label}</span>
            <span className="tabular-nums text-base-content/60">{item.display}</span>
          </div>
          <div className="h-2 rounded-full bg-base-200" aria-hidden="true">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export interface FunnelStep {
  key: string;
  label: string;
  value: number;
  href?: string;
}

/**
 * Journey funnel: each step's bar is its share of the first step; the
 * drop-off from the previous step is written out, never shown by color alone.
 */
export function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const first = steps[0]?.value || 0;
  return (
    <ol className="space-y-4" aria-label="Customer journey funnel">
      {steps.map((step, i) => {
        const share = first ? step.value / first : 0;
        const prev = i > 0 ? steps[i - 1].value : null;
        const kept = prev ? step.value / prev : null;
        const label = (
          <span className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
            <span className="font-medium">
              {i + 1}. {step.label}
            </span>
            <span className="tabular-nums">
              <strong>{step.value.toLocaleString("en-US")}</strong>
              <span className="text-base-content/60"> · {first ? `${Math.round(share * 100)}%` : "—"} of uploads</span>
            </span>
          </span>
        );
        return (
          <li key={step.key}>
            {step.href ? (
              <Link href={step.href} className="block hover:underline">
                {label}
              </Link>
            ) : (
              label
            )}
            <div className="mt-1.5 h-3 rounded-full bg-base-200" aria-hidden="true">
              <div className="h-3 rounded-full bg-primary" style={{ width: `${Math.max(share * 100, step.value ? 1 : 0)}%` }} />
            </div>
            {kept !== null && prev !== null && prev > 0 && (
              <p className="mt-1 text-xs text-base-content/60">
                {Math.round(kept * 100)}% of the previous step · {(prev - step.value).toLocaleString("en-US")} dropped off
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
