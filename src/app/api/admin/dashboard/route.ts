/**
 * GET /api/admin/dashboard?days=30 — revenue (net of refunds, per currency),
 * order counts, daily series, top countries, plans, work queues and the
 * upload → checkout → paid → downloaded funnel. Days are UTC.
 */

import type { Document } from "mongodb";
import { getPaymentCollection } from "@/lib/models/Payment";
import { journeyFunnel } from "@/lib/admin/journeys";
import { LIST_PROJECTION } from "@/lib/admin/orders";
import { adminRoute, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAID = { $in: ["paid", "refunded"] };
const NET = { $subtract: ["$amount", { $ifNull: ["$refundedAmount", 0] }] };
const DAY = 86400_000;

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function revenueByCurrency(match: Document): Document[] {
  return [
    { $match: match },
    { $group: { _id: "$currency", amount: { $sum: NET }, orders: { $sum: 1 } } },
    { $project: { _id: 0, currency: "$_id", amount: 1, orders: 1 } },
    { $sort: { amount: -1 } },
  ];
}

export const GET = adminRoute(STAFF, async ({ req }) => {
  const days = Math.min(365, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 30));
  const now = new Date();
  const today = startOfUtcDay(now);
  const since = new Date(today.getTime() - (days - 1) * DAY);
  const paidInRange = { status: PAID, paidAt: { $gte: since } };
  const col = await getPaymentCollection();
  const agg = <T extends Document>(pipeline: Document[]) => col.aggregate<T>(pipeline).toArray();

  const [revenue, revenueToday, statusRows, series, topCountries, plans, queues, funnel, recentOrders] = await Promise.all([
    agg(revenueByCurrency(paidInRange)),
    agg(revenueByCurrency({ status: PAID, paidAt: { $gte: today } })),
    agg<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    agg<{ _id: { date: string; currency: string }; orders: number; amount: number }>([
      { $match: paidInRange },
      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } }, currency: "$currency" },
          orders: { $sum: 1 },
          amount: { $sum: NET },
        },
      },
    ]),
    agg([
      { $match: paidInRange },
      {
        $group: {
          _id: { $ifNull: ["$metadata.countryCode", "??"] },
          countryName: { $first: "$metadata.countryName" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { orders: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, countryCode: "$_id", countryName: 1, orders: 1 } },
    ]),
    agg([
      { $match: paidInRange },
      {
        $group: {
          _id: { plan: { $ifNull: ["$planType", "standard"] }, currency: "$currency" },
          orders: { $sum: 1 },
          amount: { $sum: NET },
        },
      },
      { $project: { _id: 0, planType: "$_id.plan", currency: "$_id.currency", orders: 1, amount: 1 } },
    ]),
    Promise.all([
      col.countDocuments({ status: "paid", planType: "expert_edit", expertReviewStatus: "pending" }),
      col.countDocuments({ status: "paid", planType: "expert_edit", expertReviewStatus: "in_review" }),
      col.countDocuments({ status: "paid", fulfillmentStatus: "failed" }),
      col.countDocuments({ status: "paid", fulfillmentStatus: "processing", updatedAt: { $lt: new Date(now.getTime() - 10 * 60_000) } }),
      col.countDocuments({ status: "paid", "emailDelivery.status": "failed" }),
    ]).then(([expertPending, expertInReview, fulfillmentFailed, fulfillmentStuck, emailFailed]) => ({
      expertPending,
      expertInReview,
      fulfillmentFailed,
      fulfillmentStuck,
      emailFailed,
    })),
    journeyFunnel(since),
    col.find({}, { projection: LIST_PROJECTION }).sort({ createdAt: -1 }).limit(8).toArray(),
  ]);

  const byStatus = Object.fromEntries(statusRows.map((r) => [r._id, r.count]));
  const created = statusRows.reduce((n, r) => n + r.count, 0);
  const paid = (byStatus.paid || 0) + (byStatus.refunded || 0);

  // Every day in range, so the chart has no gaps
  const byDay = new Map<string, { date: string; orders: number; revenue: Record<string, number> }>();
  for (let i = 0; i < days; i++) {
    const date = new Date(since.getTime() + i * DAY).toISOString().slice(0, 10);
    byDay.set(date, { date, orders: 0, revenue: {} });
  }
  for (const row of series) {
    const day = byDay.get(row._id.date);
    if (day) {
      day.orders += row.orders;
      day.revenue[row._id.currency] = row.amount;
    }
  }

  return {
    range: { days, from: since, to: now },
    revenue,
    revenueToday,
    orders: { created, paid, byStatus, paidRate: created ? paid / created : null },
    series: [...byDay.values()],
    topCountries,
    plans,
    queues,
    funnel,
    recentOrders,
  };
});
