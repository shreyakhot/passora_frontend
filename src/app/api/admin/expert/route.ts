/**
 * GET /api/admin/expert — Expert Edit queue. ?status=open|pending|in_review|completed&mine=true&q=
 */

import type { Filter } from "mongodb";
import { getPaymentCollection, type PaymentDocument } from "@/lib/models/Payment";
import { EXPERT_BASE, QUEUE_PROJECTION } from "@/lib/admin/expert";
import { contains, pageParams, paginate, param } from "@/lib/admin/query";
import { adminRoute, ANY_ADMIN } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = adminRoute(ANY_ADMIN, async ({ req, admin }) => {
  const col = await getPaymentCollection();
  const status = param(req, "status") || "open";
  const filter: Filter<PaymentDocument> = { ...EXPERT_BASE };
  if (status === "open") filter.expertReviewStatus = { $in: ["pending", "in_review"] };
  else if (["pending", "in_review", "completed"].includes(status)) {
    filter.expertReviewStatus = status as PaymentDocument["expertReviewStatus"];
  }
  if (param(req, "mine") === "true") filter["expertEdit.assignee.id"] = admin.id;
  const q = param(req, "q");
  if (q) filter.$or = [{ email: contains(q) }, { paymentId: q }];

  // The queue is worked oldest first; delivered orders show newest first
  const result = await paginate(col, filter, pageParams(req), { paidAt: status === "completed" ? -1 : 1 }, QUEUE_PROJECTION);

  const [pending, in_review, completed] = await Promise.all(
    (["pending", "in_review", "completed"] as const).map((s) =>
      col.countDocuments({ ...EXPERT_BASE, expertReviewStatus: s })
    )
  );
  return { ...result, counts: { pending, in_review, completed } };
});
