/**
 * POST /api/admin/expert/[paymentId]/deliver — multipart: image (JPEG), note, notifyCustomer.
 * Uploads the edited photo, swaps it in as the order's image, issues a fresh
 * 72-hour download link and (optionally) emails the customer.
 */

import crypto from "crypto";
import { getPaymentCollection } from "@/lib/models/Payment";
import { uploadExpertEditPhoto } from "@/lib/storage/cloudinary";
import { getExpertOrderOr404, requireManage } from "@/lib/admin/expert";
import { jpegDimensions } from "@/lib/admin/jpeg";
import { DOWNLOAD_HOURS, downloadUrl, sendExpertDeliveryEmail } from "@/lib/admin/orders";
import { countrySpec } from "@/lib/admin/photo-api";
import { audit } from "@/lib/admin/query";
import { AdminHttpError, adminRoute, ANY_ADMIN, fail } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;

export const POST = adminRoute<{ paymentId: string }>(ANY_ADMIN, async ({ req, admin, params }) => {
  const order = await getExpertOrderOr404(params.paymentId);
  if (order.expertReviewStatus !== "in_review") fail(400, "Claim the order before delivering it.");
  requireManage(order, admin);

  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!form || !(file instanceof Blob)) fail(400, "Choose the edited photo to upload.");
  if (file.size > MAX_BYTES) fail(400, "The file is larger than 10 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const dims = jpegDimensions(buffer);
  if (!dims) fail(400, "Upload the edited photo as a JPEG.");

  const note = String(form.get("note") || "").trim().slice(0, 1000);
  const notifyCustomer = form.get("notifyCustomer") !== "false";
  const uploadedDims = `${dims.width}x${dims.height}`;
  const sizeKb = Math.round(buffer.length / 1024);

  const warnings: string[] = [];
  if (order.image?.dimensions && order.image.dimensions !== uploadedDims) {
    warnings.push(`Edited photo is ${uploadedDims}px; the order was ${order.image.dimensions}px.`);
  }
  const spec = await countrySpec(order.metadata?.countryCode);
  if (spec?.maxFileSizeKb && sizeKb > spec.maxFileSizeKb) {
    warnings.push(`File is ${sizeKb} KB; the limit for this country is ${spec.maxFileSizeKb} KB.`);
  }

  let uploaded: { secureUrl: string; publicId: string };
  try {
    uploaded = await uploadExpertEditPhoto({ imageBuffer: buffer, resultId: order.image?.resultId || order.paymentId });
  } catch (err) {
    fail(502, `Upload failed: ${err instanceof Error ? err.message : "unknown error"}`);
  }

  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const col = await getPaymentCollection();
  await col.updateOne(
    { paymentId: order.paymentId },
    {
      $set: {
        expertReviewStatus: "completed",
        "expertEdit.editedImageUrl": uploaded.secureUrl,
        "expertEdit.cloudinaryPublicId": uploaded.publicId,
        // Keep the first AI result if the order is delivered more than once
        "expertEdit.aiImageUrl": order.expertEdit?.aiImageUrl || order.image?.imageUrl,
        "expertEdit.dimensions": uploadedDims,
        "expertEdit.sizeKb": sizeKb,
        "expertEdit.note": note,
        "expertEdit.deliveredBy": { id: admin.id, name: admin.name },
        "expertEdit.deliveredAt": now,
        "image.imageUrl": uploaded.secureUrl,
        downloadToken: token,
        downloadTokenExpiresAt: new Date(now.getTime() + DOWNLOAD_HOURS * 3600_000),
        updatedAt: now,
      },
    }
  );

  let email: { sent: boolean; error?: string } = { sent: false };
  if (notifyCustomer) {
    try {
      await sendExpertDeliveryEmail(order.paymentId);
      email = { sent: true };
    } catch (err) {
      // The photo is saved; the editor can resend from the delivery panel
      email = { sent: false, error: err instanceof AdminHttpError || err instanceof Error ? err.message : "Email failed." };
    }
  }

  await audit(admin, "expert.deliver", { type: "order", id: order.paymentId }, {
    dimensions: uploadedDims,
    sizeKb,
    emailSent: email.sent,
  });
  return { ok: true, editedImageUrl: uploaded.secureUrl, downloadUrl: downloadUrl(token), warnings, email };
});
