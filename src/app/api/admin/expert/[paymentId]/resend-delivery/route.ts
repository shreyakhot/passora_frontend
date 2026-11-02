/**
 * POST /api/admin/expert/[paymentId]/resend-delivery — email the finished photo again.
 */

import { getExpertOrderOr404, requireManage } from "@/lib/admin/expert";
import { sendExpertDeliveryEmail } from "@/lib/admin/orders";
import { audit } from "@/lib/admin/query";
import { adminRoute, ANY_ADMIN, fail } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = adminRoute<{ paymentId: string }>(ANY_ADMIN, async ({ admin, params }) => {
  const order = await getExpertOrderOr404(params.paymentId);
  if (order.expertReviewStatus !== "completed") fail(400, "This order has not been delivered yet.");
  requireManage(order, admin);
  const result = await sendExpertDeliveryEmail(order.paymentId);
  await audit(admin, "expert.resend_delivery", { type: "order", id: order.paymentId });
  return result;
});
