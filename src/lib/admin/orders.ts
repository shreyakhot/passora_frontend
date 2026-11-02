/**
 * Admin panel — order queries and support actions on the `payments` collection.
 * Actions reuse the shop's own pipelines (fulfilment, email, Razorpay).
 */

import crypto from "crypto";
import type { Filter } from "mongodb";
import type { NextRequest } from "next/server";
import { PRICING } from "@/lib/config/pricing";
import { sendExpertEditDeliveredEmailAction } from "@/lib/email";
import { logActivity } from "@/lib/logging/activity-logger";
import { getPaymentCollection, type PaymentDocument, type PaymentRefund } from "@/lib/models/Payment";
import { fulfillPayment } from "@/lib/payments/fulfillment-service";
import { getRazorpayInstance } from "@/lib/payments/razorpay";
import { contains, dateRange, param } from "@/lib/admin/query";
import { fail, type AdminContext } from "@/lib/admin/server";

export const DOWNLOAD_HOURS = 72;
const STUCK_AFTER_MS = 10 * 60_000;

export const LIST_PROJECTION = {
  _id: 0,
  paymentId: 1,
  email: 1,
  amount: 1,
  currency: 1,
  status: 1,
  fulfillmentStatus: 1,
  planType: 1,
  expertReviewStatus: 1,
  refundedAmount: 1,
  razorpayOrderId: 1,
  razorpayPaymentId: 1,
  "invoice.invoiceNumber": 1,
  "emailDelivery.status": 1,
  "metadata.countryCode": 1,
  "metadata.countryName": 1,
  "image.previewUrl": 1,
  createdAt: 1,
  paidAt: 1,
};

export function downloadUrl(token?: string): string | null {
  return token ? `${PRICING.siteUrl}/api/download/${token}` : null;
}

/** Filters from the Orders page query string. */
export function orderFilter(req: NextRequest): Filter<PaymentDocument> {
  const filter: Filter<PaymentDocument> = {};
  const q = param(req, "q");
  if (q) {
    filter.$or = [
      { email: contains(q) },
      { paymentId: q },
      { razorpayOrderId: q },
      { razorpayPaymentId: q },
      { "invoice.invoiceNumber": contains(q) },
      { "image.resultId": q },
    ];
  }
  const status = param(req, "status");
  if (status) filter.status = status as PaymentDocument["status"];
  const fulfillment = param(req, "fulfillment");
  if (fulfillment) filter.fulfillmentStatus = fulfillment as PaymentDocument["fulfillmentStatus"];
  const plan = param(req, "plan");
  if (plan === "standard") filter.planType = { $ne: "expert_edit" };
  else if (plan === "expert_edit") filter.planType = "expert_edit";
  const country = param(req, "country");
  if (country) filter["metadata.countryCode"] = country.toUpperCase();
  const emailStatus = param(req, "emailStatus");
  if (emailStatus) filter["emailDelivery.status"] = emailStatus as "pending" | "sent" | "failed";
  Object.assign(filter, dateRange(req, "createdAt"));
  return filter;
}

export async function getOrderOr404(paymentId: string): Promise<PaymentDocument> {
  const col = await getPaymentCollection();
  const order = await col.findOne({ paymentId });
  if (!order) fail(404, "Order not found.");
  return order;
}

function requirePaid(order: PaymentDocument) {
  if (order.status !== "paid") fail(400, "This action needs a paid order.");
}

// ─── Actions ───

/** Re-open the email step and run the normal fulfilment pipeline (no team alert). */
export async function resendCustomerEmail(paymentId: string) {
  const order = await getOrderOr404(paymentId);
  requirePaid(order);
  if (order.fulfillmentStatus === "processing") {
    fail(409, "Fulfilment is running right now. Try again in a few minutes.");
  }
  const col = await getPaymentCollection();
  await col.updateOne(
    { paymentId, fulfillmentStatus: { $ne: "processing" } },
    {
      $set: {
        "emailDelivery.status": "pending",
        fulfillmentStatus: order.fulfillmentStatus === "completed" ? "pending" : order.fulfillmentStatus,
        updatedAt: new Date(),
      },
    }
  );
  await fulfillPayment(paymentId, { notifyTeam: false });
  const latest = await col.findOne({ paymentId });
  if (latest?.emailDelivery?.status !== "sent") {
    fail(502, latest?.emailDelivery?.lastError || "The email could not be sent.");
  }
  return { ok: true, emailStatus: latest.emailDelivery.status };
}

/** Finish the fulfilment steps that have not run (invoice, link, email). */
export async function retryFulfillment(paymentId: string) {
  const order = await getOrderOr404(paymentId);
  requirePaid(order);
  if (order.fulfillmentStatus === "completed") {
    fail(400, "Fulfilment is already complete. Use resend email instead.");
  }
  const col = await getPaymentCollection();
  if (order.fulfillmentStatus === "processing") {
    if (Date.now() - new Date(order.updatedAt).getTime() < STUCK_AFTER_MS) {
      fail(409, "Fulfilment is running right now. Try again in a few minutes.");
    }
    // Release the stuck lock so the pipeline can claim it again
    await col.updateOne(
      { paymentId, fulfillmentStatus: "processing" },
      { $set: { fulfillmentStatus: "failed", updatedAt: new Date() } }
    );
  }
  const result = await fulfillPayment(paymentId);
  if (result.fulfillmentStatus !== "completed") {
    fail(502, `Fulfilment ended as "${result.fulfillmentStatus}". Check the order timeline.`);
  }
  const latest = await col.findOne({ paymentId });
  return { ok: true, fulfillmentStatus: result.fulfillmentStatus, emailStatus: latest?.emailDelivery?.status };
}

export async function newDownloadLink(paymentId: string, hours: number) {
  const order = await getOrderOr404(paymentId);
  requirePaid(order);
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + hours * 3600_000);
  const col = await getPaymentCollection();
  await col.updateOne(
    { paymentId },
    { $set: { downloadToken: token, downloadTokenExpiresAt: expiresAt, updatedAt: new Date() } }
  );
  return { downloadUrl: downloadUrl(token), expiresAt };
}

/**
 * Refund through Razorpay. A per-order lock (refundLockAt) stops a double
 * click from sending two refunds; checks run on the order as read under the lock.
 */
export async function refundOrder(
  paymentId: string,
  admin: AdminContext,
  params: { amount?: number | null; reason: string; revokeDownload: boolean }
) {
  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    fail(503, "Razorpay is not configured.");
  }
  await getOrderOr404(paymentId);
  const col = await getPaymentCollection();
  const order = await col.findOneAndUpdate(
    {
      paymentId,
      $or: [{ refundLockAt: { $exists: false } }, { refundLockAt: { $lt: new Date(Date.now() - 120_000) } }],
    } as Filter<PaymentDocument>,
    { $set: { refundLockAt: new Date() } as Record<string, unknown> }
  );
  if (!order) fail(409, "A refund for this order is already in progress.");

  try {
    if (order.status !== "paid" && order.status !== "refunded") fail(400, "Only paid orders can be refunded.");
    if (!order.razorpayPaymentId) fail(400, "This order has no Razorpay payment ID.");
    const refundable = order.amount - (order.refundedAmount || 0);
    if (refundable <= 0) fail(400, "This order is already fully refunded.");
    const amount = params.amount || refundable;
    if (amount > refundable) {
      fail(400, `At most ${(refundable / 100).toFixed(2)} ${order.currency} can still be refunded.`);
    }

    let refund: { id: string; status?: string };
    try {
      refund = (await getRazorpayInstance().payments.refund(order.razorpayPaymentId, {
        amount,
        speed: "normal",
        receipt: `${paymentId.slice(0, 20)}-${crypto.randomBytes(4).toString("hex")}`,
        notes: { paymentId, reason: params.reason.slice(0, 200), admin: admin.email },
      })) as { id: string; status?: string };
    } catch (err) {
      const rzError = (err as { error?: { description?: string } })?.error?.description;
      fail(502, `Razorpay refused the refund: ${rzError || (err instanceof Error ? err.message : "unknown error")}`);
    }

    const totalRefunded = (order.refundedAmount || 0) + amount;
    const fully = totalRefunded >= order.amount;
    const record: PaymentRefund & { adminId: unknown } = {
      refundId: refund.id,
      amount,
      currency: order.currency,
      status: refund.status,
      reason: params.reason,
      adminId: admin._id,
      adminName: admin.name,
      createdAt: new Date(),
    };
    await col.updateOne(
      { paymentId },
      {
        $push: { refunds: record },
        $set: { refundedAmount: totalRefunded, updatedAt: new Date(), ...(fully ? { status: "refunded" as const } : {}) },
        ...(fully && params.revokeDownload ? { $unset: { downloadToken: "", downloadTokenExpiresAt: "" } } : {}),
      }
    );
    return { refund: record, status: fully ? "refunded" : order.status, refundedAmount: totalRefunded };
  } finally {
    await col.updateOne({ paymentId }, { $unset: { refundLockAt: "" } as Record<string, ""> });
  }
}

/** Email the customer their finished Expert Edit photo. */
export async function sendExpertDeliveryEmail(paymentId: string) {
  const order = await getOrderOr404(paymentId);
  if (!order.downloadToken || !order.image?.imageUrl) fail(400, "The edited photo or download link is missing.");
  const resendId = await sendExpertEditDeliveredEmailAction({
    email: order.email,
    paymentId,
    downloadUrl: downloadUrl(order.downloadToken)!,
    photoUrl: order.image.imageUrl,
    countryName: order.metadata?.countryName,
    dimensions: order.expertEdit?.dimensions || order.image?.dimensions,
    editorNote: order.expertEdit?.note,
    expiresInHours: DOWNLOAD_HOURS,
  });
  const col = await getPaymentCollection();
  await col.updateOne({ paymentId }, { $set: { "expertEdit.emailedAt": new Date(), "expertEdit.resendEmailId": resendId } });
  await logActivity({ event: "expert_edit_delivered", status: "success", paymentId, email: order.email, metadata: { resendId } });
  return { ok: true, resendId };
}
