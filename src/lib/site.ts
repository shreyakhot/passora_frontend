/**
 * Site-wide brand and URL settings. Every page, email and invoice reads the
 * brand from here, so a rename only needs NEXT_PUBLIC_SITE_NAME / _URL.
 */

function normaliseSiteUrl(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return fallback;
  }
}

/** Canonical origin with no trailing slash, e.g. "https://photo-govt.com". */
export const SITE_URL = normaliseSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
  "https://photo-govt.com"
);

/** Host name shown in copy, e.g. "photo-govt.com". */
export const SITE_DOMAIN = new URL(SITE_URL).host;

/** Brand name shown in titles, headers, emails and invoices. */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Photo-Govt";

/**
 * Public support address (contact page, footer, policies, emails, invoices, reply-to).
 * Set in code, not by environment variable, so a change goes live with a normal deploy.
 */
export const SUPPORT_EMAIL = "photogovt@gmail.com";

/** Logo / favicon / default social image, served from /public. */
export const LOGO_PATH = "/logo-mark.jpg";
export const LOGO_URL = `${SITE_URL}${LOGO_PATH}`;

/** Independence disclaimer used in footers, notices and legal pages. */
export const SITE_DISCLAIMER = `${SITE_NAME} is an independent photo service and is not affiliated with, endorsed by or operated by any government, passport office, embassy or consulate.`;
