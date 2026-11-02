/**
 * POST /api/admin/orders/[paymentId]/resend-email — payment confirmation, invoice and download link again.
 */

import { resendCustomerEmail } from "@/lib/admin/orders";
import { audit } from "@/lib/admin/query";
import { adminRoute, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = adminRoute<{ paymentId: string }>(STAFF, async ({ admin, params }) => {
  const result = await resendCustomerEmail(params.paymentId);
  await audit(admin, "order.resend_email", { type: "order", id: params.paymentId });
  return result;
});
