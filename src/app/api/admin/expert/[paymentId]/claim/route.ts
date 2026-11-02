/**
 * POST /api/admin/expert/[paymentId]/claim — assign a waiting order to yourself.
 */

import { getPaymentCollection } from "@/lib/models/Payment";
import { EXPERT_BASE, getExpertOrderOr404 } from "@/lib/admin/expert";
import { audit } from "@/lib/admin/query";
import { adminRoute, ANY_ADMIN, fail } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = adminRoute<{ paymentId: string }>(ANY_ADMIN, async ({ admin, params }) => {
  const col = await getPaymentCollection();
  const now = new Date();
  // Atomic: only one editor can win the claim
  const claimed = await col.findOneAndUpdate(
    {
      paymentId: params.paymentId,
      ...EXPERT_BASE,
      $or: [{ expertReviewStatus: "pending" }, { expertReviewStatus: { $exists: false } }],
    },
    {
      $set: {
        expertReviewStatus: "in_review",
        "expertEdit.assignee": { id: admin.id, name: admin.name, email: admin.email },
        "expertEdit.claimedAt": now,
        updatedAt: now,
      },
    }
  );
  if (!claimed) {
    await getExpertOrderOr404(params.paymentId);
    fail(409, "Someone else has already claimed this order.");
  }
  await audit(admin, "expert.claim", { type: "order", id: params.paymentId });
  return { ok: true, status: "in_review" };
});
