/**
 * GET /api/admin/expert/[paymentId] — photos, requirements and edit status for one order.
 */

import { getExpertOrderOr404 } from "@/lib/admin/expert";
import { countrySpec } from "@/lib/admin/photo-api";
import { adminRoute, ANY_ADMIN } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = adminRoute<{ paymentId: string }>(ANY_ADMIN, async ({ params }) => {
  const order = await getExpertOrderOr404(params.paymentId);
  const meta = order.metadata || {};
  const image = order.image || ({} as NonNullable<typeof order.image>);
  const expert = order.expertEdit || {};
  return {
    paymentId: order.paymentId,
    email: order.email,
    status: order.expertReviewStatus || "pending",
    paidAt: order.paidAt,
    country: { code: meta.countryCode, name: meta.countryName },
    spec: await countrySpec(meta.countryCode),
    images: {
      original: image.originalImageUrl || meta.originalPreviewUrl,
      ai: expert.aiImageUrl || image.imageUrl,
      preview: image.previewUrl,
      edited: expert.editedImageUrl,
    },
    dimensions: image.dimensions,
    expertEdit: expert,
  };
});
