/**
 * GET /api/admin/orders — paginated, filterable order list.
 */

import type { Sort } from "mongodb";
import { getPaymentCollection } from "@/lib/models/Payment";
import { LIST_PROJECTION, orderFilter } from "@/lib/admin/orders";
import { pageParams, paginate, param } from "@/lib/admin/query";
import { adminRoute, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SORTS: Record<string, Sort> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  amount_desc: { amount: -1, createdAt: -1 },
  amount_asc: { amount: 1, createdAt: -1 },
};

export const GET = adminRoute(STAFF, async ({ req }) => {
  const col = await getPaymentCollection();
  return paginate(col, orderFilter(req), pageParams(req), SORTS[param(req, "sort")] || SORTS.newest, LIST_PROJECTION);
});
