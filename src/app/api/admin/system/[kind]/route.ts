/**
 * GET /api/admin/system/status    — service health, configuration and pricing
 * GET /api/admin/system/countries — countries supported by the photo API
 */

import { getDb } from "@/lib/db/mongodb";
import { getPlanPricing, PRICING } from "@/lib/config/pricing";
import { COUNTRIES } from "@/config/countries";
import { listCountries, photoApiHealth } from "@/lib/admin/photo-api";
import { adminRoute, fail, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function mongoPing(): Promise<number | null> {
  try {
    const db = await getDb();
    const started = Date.now();
    await db.command({ ping: 1 });
    return Date.now() - started;
  } catch {
    return null;
  }
}

export const GET = adminRoute<{ kind: string }>(STAFF, async ({ params }) => {
  if (params.kind === "countries") {
    const fromApi = await listCountries();
    if (fromApi) return { source: "photo-api", items: fromApi };
    // Photo API unreachable: fall back to the site's own country list
    return {
      source: "site",
      items: COUNTRIES.map((c) => ({
        countryCode: c.country_code,
        countryName: c.country_name,
        documentType: c.document_type,
        dimensions: c.dimensions,
      })),
    };
  }

  if (params.kind !== "status") fail(404, "Not found.");

  const resendKey = process.env.RESEND_API_KEY || "";
  const [photoApi, mongoMs, uploads24h] = await Promise.all([
    photoApiHealth(),
    mongoPing(),
    (async () => {
      const db = await getDb();
      const since = new Date(Date.now() - 86400_000);
      const rows = await db
        .collection("user_activity_logs")
        .aggregate<{ _id: string; n: number; avgMs: number | null; maxMs: number | null }>([
          { $match: { event: { $in: ["photo_processed", "photo_processing_failed"] }, createdAt: { $gte: since } } },
          {
            $group: {
              _id: "$event",
              n: { $sum: 1 },
              avgMs: { $avg: "$metadata.durationMs" },
              maxMs: { $max: "$metadata.durationMs" },
            },
          },
        ])
        .toArray();
      const errors = await db
        .collection("user_activity_logs")
        .aggregate<{ _id: string | null; count: number }>([
          { $match: { event: "photo_processing_failed", createdAt: { $gte: since } } },
          { $group: { _id: "$metadata.error", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ])
        .toArray();
      const ok = rows.find((r) => r._id === "photo_processed");
      const failed = rows.find((r) => r._id === "photo_processing_failed");
      return {
        processed: ok?.n || 0,
        failed: failed?.n || 0,
        avgMs: ok?.avgMs ? Math.round(ok.avgMs) : null,
        maxMs: ok?.maxMs ?? null,
        topErrors: errors.map((e) => ({ error: e._id, count: e.count })),
      };
    })().catch(() => null),
  ]);

  return {
    photoApi,
    mongo: { ok: mongoMs !== null, pingMs: mongoMs, database: process.env.MONGODB_DB_NAME || "photo_govt" },
    integrations: {
      resend: !!resendKey && !resendKey.startsWith("re_demo") && !resendKey.startsWith("re_123"),
      razorpay: !!(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      razorpayWebhook: !!process.env.RAZORPAY_WEBHOOK_SECRET,
      cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
    },
    shop: {
      siteUrl: PRICING.siteUrl,
      currency: PRICING.currency,
      standard: getPlanPricing("standard").amountFormatted,
      expertEdit: getPlanPricing("expert_edit").amountFormatted,
    },
    uploads24h,
  };
});
