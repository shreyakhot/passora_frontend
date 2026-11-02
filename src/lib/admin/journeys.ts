/**
 * Admin panel — user journeys: photo upload → checkout → payment → download.
 *
 * One journey per upload event in user_activity_logs (photo_processed or
 * photo_processing_failed). A processed photo's resultId links it to its
 * order (payments.image.resultId), and the order's paymentId links it to its
 * image_downloaded events. Activity logs expire after 90 days, so journeys do too.
 */

import type { Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { escapeRegex } from "@/lib/admin/query";

export type JourneyStage = "failed" | "uploaded" | "checkout" | "paid" | "downloaded";
export const JOURNEY_STAGES: JourneyStage[] = ["failed", "uploaded", "checkout", "paid", "downloaded"];

const UPLOAD_EVENTS = ["photo_processed", "photo_processing_failed"];

/** Pipeline stages that turn upload events into journeys with a `stage` field. */
function journeyStages(match: Document): Document[] {
  return [
    { $match: { event: { $in: UPLOAD_EVENTS }, ...match } },
    {
      $lookup: {
        from: "payments",
        let: { rid: "$metadata.resultId" },
        pipeline: [
          { $match: { $expr: { $and: [{ $ne: ["$$rid", null] }, { $eq: ["$image.resultId", "$$rid"] }] } } },
          {
            $project: {
              _id: 0,
              paymentId: 1,
              email: 1,
              status: 1,
              amount: 1,
              currency: 1,
              planType: 1,
              createdAt: 1,
              paidAt: 1,
              paidRank: { $cond: [{ $in: ["$status", ["paid", "refunded"]] }, 0, 1] },
            },
          },
          // Prefer the paid order when a customer started checkout more than once
          { $sort: { paidRank: 1, createdAt: -1 } },
        ],
        as: "orders",
      },
    },
    { $addFields: { order: { $first: "$orders" }, checkouts: { $size: "$orders" } } },
    {
      $lookup: {
        from: "user_activity_logs",
        let: { pid: "$order.paymentId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $ne: ["$$pid", null] }, { $eq: ["$paymentId", "$$pid"] }, { $eq: ["$event", "image_downloaded"] }],
              },
            },
          },
          { $group: { _id: null, n: { $sum: 1 }, last: { $max: "$createdAt" } } },
        ],
        as: "downloadStats",
      },
    },
    {
      $addFields: {
        downloads: { $ifNull: [{ $first: "$downloadStats.n" }, 0] },
        lastDownloadAt: { $first: "$downloadStats.last" },
      },
    },
    {
      $addFields: {
        stage: {
          $switch: {
            branches: [
              { case: { $eq: ["$event", "photo_processing_failed"] }, then: "failed" },
              { case: { $gt: ["$downloads", 0] }, then: "downloaded" },
              { case: { $in: ["$order.status", ["paid", "refunded"]] }, then: "paid" },
              { case: { $gt: ["$checkouts", 0] }, then: "checkout" },
            ],
            default: "uploaded",
          },
        },
      },
    },
  ];
}

const ITEM_PROJECTION = {
  _id: 0,
  uploadedAt: "$createdAt",
  stage: 1,
  resultId: "$metadata.resultId",
  countryCode: "$metadata.countryCode",
  documentType: "$metadata.documentType",
  durationMs: "$metadata.durationMs",
  error: "$metadata.error",
  order: { paymentId: 1, email: 1, status: 1, amount: 1, currency: 1, planType: 1, createdAt: 1, paidAt: 1 },
  checkouts: 1,
  downloads: 1,
  lastDownloadAt: 1,
};

export interface JourneyQuery {
  createdAt?: Record<string, Date>;
  stage?: JourneyStage;
  country?: string;
  q?: string;
  skip: number;
  limit: number;
}

export async function listJourneys(query: JourneyQuery) {
  const db = await getDb();
  const match: Document = {};
  if (query.createdAt) match.createdAt = query.createdAt;
  if (query.country) match["metadata.countryCode"] = query.country.toUpperCase();

  const after: Document = {};
  if (query.stage) after.stage = query.stage;
  if (query.q) {
    const q = query.q.trim();
    after.$or = [
      { "order.email": { $regex: escapeRegex(q), $options: "i" } },
      { "metadata.resultId": q },
      { "order.paymentId": q },
    ];
  }

  const [facet] = await db
    .collection("user_activity_logs")
    .aggregate<{ items: unknown[]; total: { n: number }[]; byStage: { _id: JourneyStage; n: number }[] }>(
      [
        ...journeyStages(match),
        {
          $facet: {
            // Stage counts ignore the stage filter so the tabs always show totals
            byStage: [...(query.q ? [{ $match: { $or: after.$or } }] : []), { $group: { _id: "$stage", n: { $sum: 1 } } }],
            items: [{ $match: after }, { $sort: { createdAt: -1 } }, { $skip: query.skip }, { $limit: query.limit }, { $project: ITEM_PROJECTION }],
            total: [{ $match: after }, { $count: "n" }],
          },
        },
      ],
      { allowDiskUse: true }
    )
    .toArray();

  const counts = Object.fromEntries(JOURNEY_STAGES.map((s) => [s, 0])) as Record<JourneyStage, number>;
  for (const row of facet?.byStage || []) counts[row._id] = row.n;
  return { items: facet?.items || [], total: facet?.total[0]?.n || 0, counts };
}

/**
 * Funnel for uploads in the range: how many photos reached each step.
 * Steps are cumulative (a downloaded photo also counts as paid and checkout).
 */
export async function journeyFunnel(since: Date) {
  const db = await getDb();
  const rows = await db
    .collection("user_activity_logs")
    .aggregate<{ _id: JourneyStage; n: number; avgMs: number | null }>([
      ...journeyStages({ createdAt: { $gte: since } }),
      { $group: { _id: "$stage", n: { $sum: 1 }, avgMs: { $avg: "$metadata.durationMs" } } },
    ])
    .toArray();

  const n = Object.fromEntries(JOURNEY_STAGES.map((s) => [s, 0])) as Record<JourneyStage, number>;
  let processedMs = 0;
  let processedCount = 0;
  for (const row of rows) {
    n[row._id] = row.n;
    if (row._id !== "failed" && row.avgMs !== null) {
      processedMs += row.avgMs * row.n;
      processedCount += row.n;
    }
  }
  const downloaded = n.downloaded;
  const paid = n.paid + downloaded;
  const checkout = n.checkout + paid;
  const uploaded = n.uploaded + checkout;
  return {
    failed: n.failed,
    uploaded,
    checkout,
    paid,
    downloaded,
    avgProcessingMs: processedCount ? Math.round(processedMs / processedCount) : null,
  };
}
