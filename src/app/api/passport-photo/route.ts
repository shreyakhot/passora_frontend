import { NextResponse, type NextRequest } from "next/server";
import { processPassportPhoto } from "@/lib/passport-api";
import { DEFAULT_COUNTRY } from "@/config/countries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Next.js API Route Proxy for the photo processing API (`${PHOTO_API_URL}/process`)
 *
 * Endpoint: POST /api/passport-photo
 * Accepts: multipart/form-data with "image", "country_code", "document_type"
 */
export async function POST(req: NextRequest) {
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

    if (result.status === "error" || result.error) {
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
