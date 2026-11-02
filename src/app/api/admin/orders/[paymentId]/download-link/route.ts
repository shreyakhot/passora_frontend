/**
 * POST /api/admin/orders/[paymentId]/download-link — { hours } → new link; the old one stops working.
 */

import { z } from "zod";
import { newDownloadLink } from "@/lib/admin/orders";
import { audit } from "@/lib/admin/query";
import { adminRoute, fail, readJson, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ hours: z.number().int().min(1).max(24 * 30) });

export const POST = adminRoute<{ paymentId: string }>(STAFF, async ({ req, admin, params }) => {
  const body = Body.safeParse(await readJson(req));
  if (!body.success) fail(400, "Choose between 1 hour and 30 days.");
  const result = await newDownloadLink(params.paymentId, body.data.hours);
  await audit(admin, "order.download_link", { type: "order", id: params.paymentId }, { hours: body.data.hours });
  return result;
});
