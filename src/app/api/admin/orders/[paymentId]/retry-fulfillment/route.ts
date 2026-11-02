/**
 * POST /api/admin/orders/[paymentId]/retry-fulfillment — runs unfinished fulfilment steps.
 */

import { retryFulfillment } from "@/lib/admin/orders";
import { audit } from "@/lib/admin/query";
import { adminRoute, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = adminRoute<{ paymentId: string }>(STAFF, async ({ admin, params }) => {
  const result = await retryFulfillment(params.paymentId);
  await audit(admin, "order.retry_fulfillment", { type: "order", id: params.paymentId });
  return result;
});
