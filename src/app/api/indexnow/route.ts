import { NextResponse, type NextRequest } from "next/server";
import {
  submitUrlsToIndexNow,
  submitAllPagesToIndexNow,
  getAllSiteUrls,
  INDEXNOW_KEY,
  INDEXNOW_HOST,
  INDEXNOW_KEY_LOCATION,
} from "@/lib/seo/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/indexnow
 * Returns the IndexNow status, key configuration, and list of site URLs ready for submission.
 */
export async function GET() {
  const allUrls = await getAllSiteUrls();

  return NextResponse.json({
    status: "ready",
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    totalUrls: allUrls.length,
    urlList: allUrls,
  });
}

/**
 * POST /api/indexnow
 * Submits custom URLs or all sitemap URLs to IndexNow.
 *
 * Body options:
 * - { "all": true } -> Submits all site URLs
 * - { "urls": ["https://photo-govt.com/passport-size-photo-maker"] } -> Submits specific URLs
 */
export async function POST(req: NextRequest) {
  try {
    let body: { urls?: string[]; all?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty if called with default POST
      body = { all: true };
    }

    if (body.all || !body.urls || body.urls.length === 0) {
      const summary = await submitAllPagesToIndexNow();
      return NextResponse.json({
        success: summary.results.some((r) => r.success),
        mode: "all_pages",
        totalUrls: summary.totalUrls,
        results: summary.results,
      });
    }

    const result = await submitUrlsToIndexNow(body.urls);
    return NextResponse.json({
      success: result.success,
      mode: "custom_urls",
      totalUrls: body.urls.length,
      result,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
