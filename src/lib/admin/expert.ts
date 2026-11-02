/**
 * Admin panel — Expert Edit queue.
 * Flow: pending → claim (in_review, assigned) → upload edited JPEG → completed.
 * Delivery replaces image.imageUrl with the edited photo (the AI result is kept
 * in expertEdit.aiImageUrl), so earlier download links also return the edit.
 */

import type { Filter } from "mongodb";
import { getPaymentCollection, type PaymentDocument } from "@/lib/models/Payment";
import { fail, type AdminContext } from "@/lib/admin/server";

export const EXPERT_BASE: Filter<PaymentDocument> = { status: "paid", planType: "expert_edit" };

export const QUEUE_PROJECTION = {
  _id: 0,
  paymentId: 1,
  email: 1,
  expertReviewStatus: 1,
  "expertEdit.assignee": 1,
  "expertEdit.claimedAt": 1,
  "expertEdit.deliveredAt": 1,
  "metadata.countryCode": 1,
  "metadata.countryName": 1,
  "image.previewUrl": 1,
  "image.dimensions": 1,
  paidAt: 1,
  createdAt: 1,
};

export async function getExpertOrderOr404(paymentId: string): Promise<PaymentDocument> {
  const col = await getPaymentCollection();
  const order = await col.findOne({ paymentId, ...EXPERT_BASE });
  if (!order) fail(404, "Expert Edit order not found.");
  return order;
}

/** Owners and support can act on any order; editors only on their own claims. */
export function requireManage(order: PaymentDocument, admin: AdminContext) {
  if (admin.role === "owner" || admin.role === "support") return;
  if (String(order.expertEdit?.assignee?.id) !== admin.id) fail(403, "This order is claimed by someone else.");
}
