/**
 * POST /api/admin/expert/[paymentId]/release — put a claimed order back in the queue.
 */

import { getPaymentCollection } from "@/lib/models/Payment";
import { getExpertOrderOr404, requireManage } from "@/lib/admin/expert";
import { audit } from "@/lib/admin/query";
import { adminRoute, ANY_ADMIN, fail } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = adminRoute<{ paymentId: string }>(ANY_ADMIN, async ({ admin, params }) => {
  const order = await getExpertOrderOr404(params.paymentId);
  if (order.expertReviewStatus !== "in_review") fail(400, "Only orders in review can be released.");
  requireManage(order, admin);
  const col = await getPaymentCollection();
  await col.updateOne(
    { paymentId: params.paymentId },
    {
      $set: { expertReviewStatus: "pending", updatedAt: new Date() },
      $unset: { "expertEdit.assignee": "", "expertEdit.claimedAt": "" },
    }
  );
  await audit(admin, "expert.release", { type: "order", id: params.paymentId });
  return { ok: true, status: "pending" };
});
