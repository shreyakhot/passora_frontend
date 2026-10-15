/**
 * POST /api/webhooks/razorpay
 * Razorpay webhook endpoint for independent payment confirmation.
 *
 * IMPORTANT: Configure this URL in Razorpay Dashboard → Settings → Webhooks:
 *   https://photo-govt.com/api/webhooks/razorpay
 *   Events: payment.captured, payment.failed
 */

import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { markPaymentPaid, markPaymentFailed } from "@/lib/payments/payment-service";
import { fulfillPayment } from "@/lib/payments/fulfillment-service";
import { getWebhookEventCollection } from "@/lib/models/WebhookEvent";
import { logActivity } from "@/lib/logging/activity-logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature." },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error("[webhook] Invalid Razorpay webhook signature.");
      return NextResponse.json(
        { error: "Invalid signature." },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventId: string = event.event_id || event.id || "";
    const eventType: string = event.event || "";

    const paymentEntity = event.payload?.payment?.entity;
    const rzOrderId: string = paymentEntity?.order_id || "";
    const rzPaymentId: string = paymentEntity?.id || "";

    // Atomic Deduplication — unique index on eventId prevents concurrent duplicate processing
    const webhookCol = await getWebhookEventCollection();
    if (eventId) {
      try {
        await webhookCol.insertOne({
          eventId,
          eventType,
          razorpayPaymentId: rzPaymentId,
          razorpayOrderId: rzOrderId,
          status: "processing",
          createdAt: new Date(),
        });
      } catch (insertErr: unknown) {
        // MongoDB duplicate key error code is 11000
        if (
          typeof insertErr === "object" &&
          insertErr !== null &&
          "code" in insertErr &&
          (insertErr as { code: number }).code === 11000
        ) {
          return NextResponse.json({ status: "already_processed" });
        }
        throw insertErr;
      }
    }

    await logActivity({
      event: "payment_webhook_received",
      status: eventType,
      metadata: {
        eventId,
        razorpayOrderId: rzOrderId,
        razorpayPaymentId: rzPaymentId,
      },
    });

    if (eventType === "payment.captured") {
      const { payment } = await markPaymentPaid({
        razorpayOrderId: rzOrderId,
        razorpayPaymentId: rzPaymentId,
      });

      if (eventId) {
        await webhookCol.updateOne(
          { eventId },
          { $set: { status: "processed", processedAt: new Date() } }
        );
      }

      // Trigger fulfillment (idempotent) if payment exists
      if (payment) {
        fulfillPayment(payment.paymentId).catch((err) => {
          console.error("[webhook] Fulfillment error:", err);
        });
      }

      return NextResponse.json({ status: "captured" });
    }

    if (eventType === "payment.failed") {
      await markPaymentFailed({
        razorpayOrderId: rzOrderId,
        razorpayPaymentId: rzPaymentId,
        reason: paymentEntity?.error_description || "Payment failed",
      });

      await webhookCol.insertOne({
        eventId,
        eventType,
        razorpayPaymentId: rzPaymentId,
        razorpayOrderId: rzOrderId,
        status: "processed",
        createdAt: new Date(),
      });

      return NextResponse.json({ status: "failed_recorded" });
    }

    // Unhandled event type — acknowledge receipt
    if (eventId) {
      await webhookCol.insertOne({
        eventId,
        eventType,
        razorpayPaymentId: rzPaymentId,
        razorpayOrderId: rzOrderId,
        status: "processed",
        metadata: { note: "Unhandled event type" },
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ status: "acknowledged" });
  } catch (err: unknown) {
    console.error("[webhook] Error processing Razorpay webhook:", err);
    // Return 200 to prevent Razorpay from retrying on parse errors
    // Return 500 only for genuine server errors that merit a retry
    return NextResponse.json(
      { error: "Internal processing error." },
      { status: 500 }
    );
  }
}
