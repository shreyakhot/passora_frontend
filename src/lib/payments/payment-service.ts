/**
 * Payment Service — business logic for creating, verifying, and managing payments
 */

import crypto from "crypto";
import {
  getPaymentCollection,
  type PaymentDocument,
  type PaymentStatus,
} from "@/lib/models/Payment";
import { PRICING, getPlanPricing, type PlanType } from "@/lib/config/pricing";
import { DEFAULT_COUNTRY } from "@/config/countries";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { uploadOriginalPhotoToCloudinary } from "@/lib/storage/cloudinary";
import { logActivity } from "@/lib/logging/activity-logger";

/**
 * Create a new pending payment and Razorpay order.
 */
export async function createPaymentOrder(params: {
  email: string;
  resultId: string;
  imageUrl: string;
  previewUrl: string;
  originalPreview?: string;
  planType?: PlanType;
  dimensions?: string;
  format?: string;
  sizeKb?: number;
  countryCode?: string;
  countryName?: string;
  userAgent?: string;
  ipHash?: string;
}): Promise<{
  paymentId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}> {
  const paymentId = crypto.randomUUID();
  const col = await getPaymentCollection();
  const plan = params.planType || "standard";
  const planPricing = getPlanPricing(plan);

  // Check for duplicate pending orders for the same image, email, & plan
  const existing = await col.findOne({
    "image.resultId": params.resultId,
    email: params.email,
    currency: PRICING.currency,
    amount: planPricing.amountInSubunits,
    planType: plan,
    status: "pending",
    createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // within 30 min
  });

  if (existing) {
    // Reuse existing pending order
    return {
      paymentId: existing.paymentId,
      razorpayOrderId: existing.razorpayOrderId,
      amount: existing.amount,
      currency: existing.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    };
  }

  // Create Razorpay order — amount comes from server config, NOT from client
  const rzOrder = await createRazorpayOrder({
    amount: planPricing.amountInSubunits,
    currency: PRICING.currency,
    receipt: paymentId,
    notes: {
      paymentId,
      email: params.email,
      resultId: params.resultId,
      planType: plan,
      productType: plan === "expert_edit" ? "expert_edit_passport_photo" : PRICING.productType,
      country: params.countryName || DEFAULT_COUNTRY.country_name,
    },
  });

  // If originalPreview provided (data URI / URL), upload to Cloudinary in background or save
  let originalImageUrl: string | undefined = undefined;
  if (params.originalPreview) {
    try {
      if (params.originalPreview.startsWith("http")) {
        originalImageUrl = params.originalPreview;
      } else {
        const uploadRes = await uploadOriginalPhotoToCloudinary({
          imageSource: params.originalPreview,
          resultId: params.resultId,
        });
        if (uploadRes) {
          originalImageUrl = uploadRes.secureUrl;
        }
      }
    } catch (uploadErr) {
      console.warn("[payment-service] Original photo upload warning:", uploadErr);
    }
  }

  const payment: PaymentDocument = {
    paymentId,
    email: params.email,
    razorpayOrderId: rzOrder.id,
    amount: planPricing.amountInSubunits,
    currency: PRICING.currency,
    status: "pending",
    fulfillmentStatus: "pending",
    productType: plan === "expert_edit" ? "expert_edit_passport_photo" : PRICING.productType,
    planType: plan,
    expertReviewStatus: plan === "expert_edit" ? "pending" : undefined,
    image: {
      resultId: params.resultId,
      imageUrl: params.imageUrl,
      previewUrl: params.previewUrl,
      originalImageUrl,
      format: params.format,
      dimensions: params.dimensions,
      sizeKb: params.sizeKb,
    },
    invoice: {},
    emailDelivery: {
      status: "pending",
      attempts: 0,
    },
    metadata: {
      userAgent: params.userAgent,
      ipHash: params.ipHash,
      countryCode: params.countryCode,
      countryName: params.countryName,
      isExpertEdit: plan === "expert_edit",
      originalPreviewUrl: originalImageUrl || (params.originalPreview ? params.originalPreview.slice(0, 500) : undefined),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await col.insertOne(payment);

  await logActivity({
    event: "razorpay_order_created",
    status: "success",
    paymentId,
    email: params.email,
    metadata: {
      razorpayOrderId: rzOrder.id,
      resultId: params.resultId,
      planType: plan,
      amount: planPricing.amountInSubunits,
    },
  });

  return {
    paymentId,
    razorpayOrderId: rzOrder.id,
    amount: planPricing.amountInSubunits,
    currency: PRICING.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  };
}

/**
 * Mark a payment as paid (idempotent).
 * Returns true if this call actually transitioned the status.
 */
export async function markPaymentPaid(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}): Promise<{ transitioned: boolean; payment: PaymentDocument | null }> {
  const col = await getPaymentCollection();

  // Idempotent: only transition from pending/authorized → paid
  const result = await col.findOneAndUpdate(
    {
      razorpayOrderId: params.razorpayOrderId,
      status: { $in: ["pending", "authorized"] as PaymentStatus[] },
    },
    {
      $set: {
        razorpayPaymentId: params.razorpayPaymentId,
        status: "paid" as PaymentStatus,
        paidAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  if (result) {
    return { transitioned: true, payment: result };
  }

  // Maybe already paid — fetch to check
  const existing = await col.findOne({
    razorpayOrderId: params.razorpayOrderId,
  });

  return { transitioned: false, payment: existing };
}

/**
 * Mark payment as failed.
 */
export async function markPaymentFailed(params: {
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  reason?: string;
}): Promise<void> {
  const col = await getPaymentCollection();
  await col.updateOne(
    {
      razorpayOrderId: params.razorpayOrderId,
      status: { $in: ["pending", "authorized"] as PaymentStatus[] },
    },
    {
      $set: {
        razorpayPaymentId: params.razorpayPaymentId,
        status: "failed" as PaymentStatus,
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Find a payment by internal paymentId.
 */
export async function getPaymentById(
  paymentId: string
): Promise<PaymentDocument | null> {
  const col = await getPaymentCollection();
  return col.findOne({ paymentId });
}

/**
 * Find a payment by Razorpay order ID.
 */
export async function getPaymentByOrderId(
  razorpayOrderId: string
): Promise<PaymentDocument | null> {
  const col = await getPaymentCollection();
  return col.findOne({ razorpayOrderId });
}

/**
 * Find payment by result ID that is already paid.
 */
export async function getPaidPaymentByResultId(
  resultId: string
): Promise<PaymentDocument | null> {
  const col = await getPaymentCollection();
  return col.findOne({
    "image.resultId": resultId,
    status: "paid",
  });
}
