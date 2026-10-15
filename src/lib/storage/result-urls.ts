/**
 * Public Cloudinary URLs of a processed photo, rebuilt from its result id.
 * Used when the browser no longer has the processing response (new tab,
 * another device, cleared storage). Must match the backend's cloud account
 * and its "passport/results" upload folder.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resultImageUrl(
  resultId: string,
  kind: "photo" | "preview"
): string | undefined {
  if (!CLOUD_NAME || !UUID_RE.test(resultId)) return undefined;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/passport/results/${resultId}_${kind}.jpg`;
}
