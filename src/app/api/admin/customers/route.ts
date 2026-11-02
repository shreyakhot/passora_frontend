/**
 * GET /api/admin/customers — orders grouped by email; spend per currency, net of refunds.
 */

import { getPaymentCollection } from "@/lib/models/Payment";
import { contains, pageParams, param } from "@/lib/admin/query";
import { adminRoute, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NET = { $subtract: ["$amount", { $ifNull: ["$refundedAmount", 0] }] };
const IS_PAID = { $in: ["$status", ["paid", "refunded"]] };

export const GET = adminRoute(STAFF, async ({ req }) => {
  const page = pageParams(req);
  const q = param(req, "q");
  const sort = param(req, "sort") === "orders" ? { paidOrders: -1, lastOrderAt: -1 } : { lastOrderAt: -1 };

  const col = await getPaymentCollection();
  const [facet] = await col
    .aggregate<{ items: unknown[]; total: { n: number }[] }>(
      [
        { $match: q ? { email: contains(q) } : {} },
        // One row per (email, currency) so spend is summed per currency
        {
          $group: {
            _id: { email: "$email", currency: "$currency" },
            orders: { $sum: 1 },
            paidOrders: { $sum: { $cond: [IS_PAID, 1, 0] } },
            spent: { $sum: { $cond: [IS_PAID, NET, 0] } },
            expertOrders: { $sum: { $cond: [{ $eq: ["$planType", "expert_edit"] }, 1, 0] } },
            firstOrderAt: { $min: "$createdAt" },
            lastOrderAt: { $max: "$createdAt" },
            countries: { $addToSet: "$metadata.countryCode" },
          },
        },
        {
          $group: {
            _id: "$_id.email",
            orders: { $sum: "$orders" },
            paidOrders: { $sum: "$paidOrders" },
            expertOrders: { $sum: "$expertOrders" },
            spent: { $push: { currency: "$_id.currency", amount: "$spent" } },
            firstOrderAt: { $min: "$firstOrderAt" },
            lastOrderAt: { $max: "$lastOrderAt" },
            countries: { $push: "$countries" },
          },
        },
        {
          $project: {
            _id: 0,
            email: "$_id",
            orders: 1,
            paidOrders: 1,
            expertOrders: 1,
            firstOrderAt: 1,
            lastOrderAt: 1,
            spent: { $filter: { input: "$spent", cond: { $gt: ["$$this.amount", 0] } } },
            countries: {
              $setDifference: [
                { $reduce: { input: "$countries", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } },
                [null],
              ],
            },
          },
        },
        { $sort: sort },
        { $facet: { items: [{ $skip: page.skip }, { $limit: page.pageSize }], total: [{ $count: "n" }] } },
      ],
      { allowDiskUse: true }
    )
    .toArray();

  return { items: facet?.items || [], total: facet?.total[0]?.n || 0, page: page.page, pageSize: page.pageSize };
});
