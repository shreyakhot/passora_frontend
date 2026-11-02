import { after, NextResponse, type NextRequest } from "next/server";
import { processPassportPhoto } from "@/lib/passport-api";
import { DEFAULT_COUNTRY } from "@/config/countries";
import { logActivity } from "@/lib/logging/activity-logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Next.js API Route Proxy for the photo processing API (`${PHOTO_API_URL}/process`)
 *
 * Endpoint: POST /api/passport-photo
 * Accepts: multipart/form-data with "image", "country_code", "document_type"
 */
export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const formData = await req.formData();
    const image = formData.get("image") || formData.get("file");

    if (!image || !(image instanceof Blob)) {
      return NextResponse.json(
        {
          status: "error",
          error: "No image file provided. Please upload a valid image.",
        },
        { status: 400 }
      );
    }

    const countryCode =
      (formData.get("country_code") as string) ||
      (formData.get("country") as string) ||
      DEFAULT_COUNTRY.country_code;
    const documentType =
      (formData.get("document_type") as string) || "passport";

    const fileName =
      image instanceof File && image.name
        ? image.name
        : `photo_${Date.now()}.jpg`;

    const mimeType =
      (image instanceof File && image.type) || image.type || "image/jpeg";

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await processPassportPhoto(buffer, fileName, {
      country_code: countryCode,
      document_type: documentType,
    }, mimeType);

    // Record the upload for the admin user-journey view (after the response is sent).
    // Only the outcome is stored: no image, file name or IP address.
    const failed = result.status === "error" || !!result.error;
    after(() =>
      logActivity(
        failed
          ? {
              event: "photo_processing_failed",
              status: "error",
              metadata: {
                countryCode: countryCode.toUpperCase(),
                documentType,
                durationMs: Date.now() - startedAt,
                error: String(result.error || result.message || "").slice(0, 300),
              },
            }
          : {
              event: "photo_processed",
              status: "success",
              metadata: {
                resultId: result.result_id,
                countryCode: countryCode.toUpperCase(),
                documentType,
                durationMs: Date.now() - startedAt,
                sizeKb: result.size_kb,
                dimensions: result.dimensions,
                backgroundCorrected: result.metrics?.background_corrected,
              },
            }
      )
    );

    if (failed) {
      return NextResponse.json(
        {
          status: "error",
          error: result.error || result.message || "Failed to process passport photo.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { status: "error", error: message },
      { status: 500 }
    );
  }
}
