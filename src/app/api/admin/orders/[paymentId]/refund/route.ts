/**
 * POST /api/admin/orders/[paymentId]/refund — owner only. { amount?, reason, revokeDownload }
 */

import { z } from "zod";
import { refundOrder } from "@/lib/admin/orders";
import { audit } from "@/lib/admin/query";
import { adminRoute, fail, OWNER, readJson } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  // Smallest currency unit; null or omitted refunds everything that remains
  amount: z.number().int().min(1).nullable().optional(),
  reason: z.string().trim().min(3).max(500),
  revokeDownload: z.boolean().default(true),
});

export const POST = adminRoute<{ paymentId: string }>(OWNER, async ({ req, admin, params }) => {
  const body = Body.safeParse(await readJson(req));
  if (!body.success) fail(400, "Give a reason of at least 3 characters and a valid amount.");
  const result = await refundOrder(params.paymentId, admin, body.data);
  await audit(admin, "order.refund", { type: "order", id: params.paymentId }, {
    amount: result.refund.amount,
    currency: result.refund.currency,
    refundId: result.refund.refundId,
    reason: body.data.reason,
  });
  return result;
});
