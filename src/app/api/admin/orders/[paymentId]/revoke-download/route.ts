/**
 * POST /api/admin/orders/[paymentId]/revoke-download
 */

import { getPaymentCollection } from "@/lib/models/Payment";
import { getOrderOr404 } from "@/lib/admin/orders";
import { audit } from "@/lib/admin/query";
import { adminRoute, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = adminRoute<{ paymentId: string }>(STAFF, async ({ admin, params }) => {
  await getOrderOr404(params.paymentId);
  const col = await getPaymentCollection();
  await col.updateOne(
    { paymentId: params.paymentId },
    { $unset: { downloadToken: "", downloadTokenExpiresAt: "" }, $set: { updatedAt: new Date() } }
  );
  await audit(admin, "order.revoke_download", { type: "order", id: params.paymentId });
  return { ok: true };
});
