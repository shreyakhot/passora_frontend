/**
 * GET /api/admin/logs/[kind] — read-only log viewers.
 *   activity  user_activity_logs (support)   ?event&status&email&paymentId&from&to
 *   webhooks  webhook_events (support)       ?eventType&status&q
 *   audit     admin_audit_logs (owner)       ?action&adminEmail&target
 *   facets    distinct values for filter dropdowns
 */

import type { Document } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { contains, dateRange, escapeRegex, pageParams, paginate, param } from "@/lib/admin/query";
import { adminRoute, fail, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NEWEST = { createdAt: -1 } as const;

export const GET = adminRoute<{ kind: string }>(STAFF, async ({ req, admin, params }) => {
  const db = await getDb();
  const page = pageParams(req);
  const filter: Document = {};

  switch (params.kind) {
    case "activity": {
      for (const key of ["event", "status", "paymentId"]) if (param(req, key)) filter[key] = param(req, key);
      if (param(req, "email")) filter.email = contains(param(req, "email"));
      Object.assign(filter, dateRange(req, "createdAt"));
      return paginate(db.collection("user_activity_logs"), filter, page, NEWEST);
    }
    case "webhooks": {
      for (const key of ["eventType", "status"]) if (param(req, key)) filter[key] = param(req, key);
      const q = param(req, "q");
      if (q) filter.$or = [{ eventId: q }, { razorpayOrderId: q }, { razorpayPaymentId: q }];
      return paginate(db.collection("webhook_events"), filter, page, NEWEST);
    }
    case "audit": {
      if (admin.role !== "owner") fail(403, "You do not have permission to do this.");
      if (param(req, "action")) filter.action = { $regex: `^${escapeRegex(param(req, "action"))}` };
      if (param(req, "adminEmail")) filter.adminEmail = contains(param(req, "adminEmail"));
      if (param(req, "target")) filter["target.id"] = param(req, "target");
      return paginate(db.collection("admin_audit_logs"), filter, page, NEWEST, { _id: 0, adminId: 0 });
    }
    case "facets": {
      const [activityEvents, webhookTypes] = await Promise.all([
        db.collection("user_activity_logs").distinct("event"),
        db.collection("webhook_events").distinct("eventType"),
      ]);
      return { activityEvents: activityEvents.sort(), webhookTypes: webhookTypes.sort() };
    }
    default:
      fail(404, "Unknown log.");
  }
});
