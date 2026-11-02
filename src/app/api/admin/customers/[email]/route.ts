/**
 * GET /api/admin/customers/[email] — every order for one email address.
 */

import { getPaymentCollection } from "@/lib/models/Payment";
import { LIST_PROJECTION } from "@/lib/admin/orders";
import { adminRoute, fail, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = adminRoute<{ email: string }>(STAFF, async ({ params }) => {
  const email = decodeURIComponent(params.email);
  const col = await getPaymentCollection();
  const orders = await col.find({ email }, { projection: LIST_PROJECTION }).sort({ createdAt: -1 }).limit(200).toArray();
  if (!orders.length) fail(404, "No orders for this email.");
  return { email, orders };
});
