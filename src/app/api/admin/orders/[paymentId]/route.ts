/**
 * GET /api/admin/orders/[paymentId] — order, journey timeline and related orders.
 */

import { getDb } from "@/lib/db/mongodb";
import { getPaymentCollection } from "@/lib/models/Payment";
import { downloadUrl, getOrderOr404 } from "@/lib/admin/orders";
import { adminRoute, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = adminRoute<{ paymentId: string }>(STAFF, async ({ params }) => {
  const order = await getOrderOr404(params.paymentId);
  const db = await getDb();
  const resultId = order.image?.resultId;

  const [activity, webhooks, relatedOrders] = await Promise.all([
    // Events for this order plus the photo upload that started it
    db
      .collection("user_activity_logs")
      .find(
        { $or: [{ paymentId: order.paymentId }, ...(resultId ? [{ "metadata.resultId": resultId }] : [])] },
        { projection: { _id: 0 } }
      )
      .sort({ createdAt: 1 })
      .limit(300)
      .toArray(),
    db
      .collection("webhook_events")
      .find({ razorpayOrderId: order.razorpayOrderId }, { projection: { _id: 0 } })
      .sort({ createdAt: 1 })
      .limit(50)
      .toArray(),
    (await getPaymentCollection())
      .find(
        { email: order.email, paymentId: { $ne: order.paymentId } },
        { projection: { _id: 0, paymentId: 1, status: 1, amount: 1, currency: 1, createdAt: 1 } }
      )
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray(),
  ]);

  // Send the full link instead of the raw download token
  const { downloadToken, ...rest } = order;
  return {
    order: { ...rest, _id: undefined, downloadUrl: downloadUrl(downloadToken) },
    activity,
    webhooks,
    relatedOrders,
  };
});
