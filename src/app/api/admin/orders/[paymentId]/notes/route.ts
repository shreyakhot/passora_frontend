/**
 * POST /api/admin/orders/[paymentId]/notes — internal note (never shown to customers).
 */

import crypto from "crypto";
import { z } from "zod";
import { getPaymentCollection } from "@/lib/models/Payment";
import { getOrderOr404 } from "@/lib/admin/orders";
import { audit } from "@/lib/admin/query";
import { adminRoute, fail, readJson, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ text: z.string().trim().min(1).max(2000) });

export const POST = adminRoute<{ paymentId: string }>(STAFF, async ({ req, admin, params }) => {
  const body = Body.safeParse(await readJson(req));
  if (!body.success) fail(400, "Write a note of up to 2,000 characters.");
  await getOrderOr404(params.paymentId);
  const note = {
    id: crypto.randomBytes(6).toString("hex"),
    text: body.data.text,
    adminName: admin.name,
    createdAt: new Date(),
  };
  const col = await getPaymentCollection();
  await col.updateOne({ paymentId: params.paymentId }, { $push: { adminNotes: note } });
  await audit(admin, "order.note", { type: "order", id: params.paymentId });
  return note;
});
