/**
 * Admin panel — server-side query helpers: pagination, filters, audit log.
 */

import type { Collection, Document, Filter, Sort } from "mongodb";
import type { NextRequest } from "next/server";
import { adminCollections } from "@/lib/admin/db";
import type { AdminContext } from "@/lib/admin/server";

export interface PageParams {
  page: number;
  pageSize: number;
  skip: number;
}

export function pageParams(req: NextRequest, maxSize = 100): PageParams {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Math.floor(Number(sp.get("page")) || 1));
  const pageSize = Math.min(maxSize, Math.max(1, Math.floor(Number(sp.get("pageSize")) || 25)));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export async function paginate<T extends Document>(
  col: Collection<T>,
  filter: Filter<T>,
  page: PageParams,
  sort: Sort,
  projection: Document = { _id: 0 }
) {
  const [items, total] = await Promise.all([
    col.find(filter, { projection }).sort(sort).skip(page.skip).limit(page.pageSize).toArray(),
    col.countDocuments(filter),
  ]);
  return { items, total, page: page.page, pageSize: page.pageSize };
}

export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive "contains" match, safe against regex injection. */
export function contains(text: string) {
  return { $regex: escapeRegex(text.trim()), $options: "i" };
}

/** Inclusive UTC day range from ?from=YYYY-MM-DD&to=YYYY-MM-DD. */
export function dateRange(req: NextRequest, field: string): Record<string, unknown> {
  const sp = req.nextUrl.searchParams;
  const from = sp.get("from");
  const to = sp.get("to");
  const cond: Record<string, Date> = {};
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) cond.$gte = new Date(`${from}T00:00:00Z`);
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) cond.$lt = new Date(new Date(`${to}T00:00:00Z`).getTime() + 86400_000);
  return Object.keys(cond).length ? { [field]: cond } : {};
}

export function param(req: NextRequest, name: string): string {
  return (req.nextUrl.searchParams.get(name) || "").trim();
}

/** Record an admin action in admin_audit_logs. */
export async function audit(
  admin: AdminContext | null,
  action: string,
  target: { type: string; id?: string | null },
  details?: Record<string, unknown>
) {
  const { auditLogs } = await adminCollections();
  await auditLogs.insertOne({
    adminId: admin?._id,
    adminEmail: admin?.email,
    adminName: admin?.name,
    action,
    target,
    details,
    createdAt: new Date(),
  });
}
