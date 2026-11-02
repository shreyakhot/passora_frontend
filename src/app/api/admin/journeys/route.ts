/**
 * GET /api/admin/journeys — one row per uploaded photo and how far it got.
 * ?stage=failed|uploaded|checkout|paid|downloaded&country=&q=&from=&to=&page=&pageSize=
 */

import { JOURNEY_STAGES, listJourneys, type JourneyStage } from "@/lib/admin/journeys";
import { dateRange, pageParams, param } from "@/lib/admin/query";
import { adminRoute, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = adminRoute(STAFF, async ({ req }) => {
  const page = pageParams(req);
  const stage = param(req, "stage") as JourneyStage;
  const range = dateRange(req, "createdAt") as { createdAt?: Record<string, Date> };
  const result = await listJourneys({
    createdAt: range.createdAt,
    stage: JOURNEY_STAGES.includes(stage) ? stage : undefined,
    country: param(req, "country") || undefined,
    q: param(req, "q") || undefined,
    skip: page.skip,
    limit: page.pageSize,
  });
  return { ...result, page: page.page, pageSize: page.pageSize };
});
