/**
 * Base HTML email template wrapper.
 * Provides branded header, footer, and responsive layout.
 */

import { PRICING } from "@/lib/config/pricing";
import { LOGO_URL, SITE_DOMAIN, SITE_NAME } from "@/lib/site";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export { escapeHtml };

export function baseEmailTemplate(params: {
  preheader: string;
  bodyHtml: string;
}): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${escapeHtml(params.preheader)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #0f172a; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 20px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
    .header .brand-accent { color: #84cc16; }
    .content { padding: 32px; }
    .footer { background-color: #f1f5f9; padding: 24px 32px; text-align: center; font-size: 12px; color: #64748b; }
    .btn { display: inline-block; padding: 14px 28px; background-color: #4d7c0f; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; }
    .btn:hover { background-color: #3f650c; }
    .divider { border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .info-label { color: #64748b; }
    .info-value { color: #0f172a; font-weight: 600; }
    @media (max-width: 600px) {
      .content { padding: 24px 20px; }
      .header { padding: 20px; }
    }
  </style>
</head>
<body>
  <!-- Preheader (hidden text for email clients) -->
  <div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(params.preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:24px 0;">
    <tr>
      <td align="center">
        <div class="wrapper" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <!-- Header -->
          <div class="header" style="background-color:#0f172a;padding:24px 32px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="vertical-align:middle;padding-right:10px;">
                  <img src="${escapeHtml(LOGO_URL)}" alt="${escapeHtml(SITE_NAME)} Logo" width="34" height="34" style="display:block;border-radius:8px;border:1px solid rgba(255,255,255,0.2);" />
                </td>
                <td style="vertical-align:middle;">
                  <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                    ${escapeHtml(SITE_NAME)}
                  </h1>
                </td>
              </tr>
            </table>
          </div>

          <!-- Body Content -->
          <div class="content" style="padding:32px;">
            ${params.bodyHtml}
          </div>

          <!-- Footer -->
          <div class="footer" style="background-color:#f1f5f9;padding:24px 32px;text-align:center;font-size:12px;color:#64748b;">
            <p style="margin:0 0 8px;">
              &copy; ${year} ${escapeHtml(PRICING.businessName)}. All rights reserved.
            </p>
            <p style="margin:0 0 8px;">
              <a href="${escapeHtml(PRICING.siteUrl)}" style="color:#4d7c0f;text-decoration:none;">${escapeHtml(SITE_DOMAIN)}</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(PRICING.siteUrl)}/privacy-policy" style="color:#4d7c0f;text-decoration:none;">Privacy</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(PRICING.siteUrl)}/refund-policy" style="color:#4d7c0f;text-decoration:none;">Refunds</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(PRICING.siteUrl)}/contact-us" style="color:#4d7c0f;text-decoration:none;">Support</a>
            </p>
            <p style="margin:0;font-size:11px;color:#94a3b8;">
              ${escapeHtml(PRICING.supportEmail)}
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
