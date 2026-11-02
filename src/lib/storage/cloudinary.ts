/**
 * Cloudinary Storage Utility
 * Handles secure server-side uploads of biometric assets, original photos, and generated invoice PDFs.
 */

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Upload an invoice PDF buffer to Cloudinary.
 * Returns the secure public URL or null if upload fails.
 */
export async function uploadInvoicePdfToCloudinary(params: {
  pdfBuffer: Buffer;
  invoiceNumber: string;
}): Promise<{ secureUrl: string; publicId: string } | null> {
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("[cloudinary] Missing Cloudinary credentials. Skipping invoice PDF cloud upload.");
    return null;
  }

  try {
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "passport/invoices",
          public_id: params.invoiceNumber,
          resource_type: "raw",
          format: "pdf",
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload returned empty response"));
          } else {
            resolve(result);
          }
        }
      );
      stream.end(params.pdfBuffer);
    });

    return {
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  } catch (err) {
    console.error("[cloudinary] Failed to upload invoice PDF:", err);
    return null;
  }
}

/**
 * Upload original user-uploaded photo to Cloudinary.
 * Used for Expert Edit review queue.
 */
export async function uploadOriginalPhotoToCloudinary(params: {
  imageSource: string | Buffer;
  resultId: string;
}): Promise<{ secureUrl: string; publicId: string } | null> {
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("[cloudinary] Missing Cloudinary credentials. Skipping original photo upload.");
    return null;
  }

  try {
    const publicId = `${params.resultId}_original`;

    if (
      typeof params.imageSource === "string" &&
      (params.imageSource.startsWith("http://") ||
        params.imageSource.startsWith("https://") ||
        params.imageSource.startsWith("data:"))
    ) {
      const uploadResult = await cloudinary.uploader.upload(params.imageSource, {
        folder: "passport/originals",
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });

      return {
        secureUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    if (Buffer.isBuffer(params.imageSource)) {
      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "passport/originals",
            public_id: publicId,
            resource_type: "image",
            overwrite: true,
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary original image upload failed"));
            } else {
              resolve(result);
            }
          }
        );
        stream.end(params.imageSource as Buffer);
      });

      return {
        secureUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    return null;
  } catch (err) {
    console.error("[cloudinary] Failed to upload original photo:", err);
    return null;
  }
}

/**
 * Upload an editor's finished Expert Edit photo (admin panel).
 * Throws on failure so the admin sees the error.
 */
export async function uploadExpertEditPhoto(params: {
  imageBuffer: Buffer;
  resultId: string;
}): Promise<{ secureUrl: string; publicId: string }> {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured.");
  }
  const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "passport/expert",
        public_id: `${params.resultId}_expert`,
        resource_type: "image",
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) reject(error || new Error("Cloudinary upload returned empty response"));
        else resolve(result);
      }
    );
    stream.end(params.imageBuffer);
  });
  return { secureUrl: uploadResult.secure_url, publicId: uploadResult.public_id };
}
