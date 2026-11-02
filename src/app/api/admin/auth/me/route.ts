/**
 * GET /api/admin/auth/me — the signed-in admin.
 */

import { adminRoute, ANY_ADMIN } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = adminRoute(ANY_ADMIN, async ({ admin }) => ({
  id: admin.id,
  email: admin.email,
  name: admin.name,
  role: admin.role,
}));
