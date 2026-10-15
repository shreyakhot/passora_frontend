/**
 * Template for Expert Edit / Manual Review order notification sent to the editing team.
 */

import { baseEmailTemplate, escapeHtml } from "./base";
import { DEFAULT_COUNTRY } from "@/config/countries";
import { SITE_NAME } from "@/lib/site";

export interface ExpertEditNotificationParams {
  email: string;
  paymentId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  countryName?: string;
  countryCode?: string;
  dimensions?: string;
  originalImageUrl?: string;
  processedImageUrl?: string;
  previewUrl?: string;
  paidAt?: Date;
}

export function expertEditNotificationEmail(
  params: ExpertEditNotificationParams
): { subject: string; html: string } {
  const currencySymbols: Record<string, string> = {
    GBP: "£",
    INR: "₹",
    USD: "$",
    EUR: "€",
    CAD: "CA$",
    AUD: "A$",
  };
  const symbol = currencySymbols[params.currency?.toUpperCase()] || "";
  const amountFormatted = symbol
    ? `${symbol}${(params.amount / 100).toFixed(2)}`
    : `${(params.amount / 100).toFixed(2)} ${params.currency}`;

  const country = params.countryName || DEFAULT_COUNTRY.country_name;
  const code = params.countryCode || DEFAULT_COUNTRY.country_code;
  const dimensions = params.dimensions || "600x750 px";
  const originalUrl = params.originalImageUrl || params.previewUrl || "";
  const processedUrl = params.processedImageUrl || params.previewUrl || "";

  const subject = `[EXPERT EDIT REQUIRED] New Order for ${country} (${code}) — ${params.paymentId}`;

  const bodyHtml = `
    <!-- Top Alert Banner -->
    <div style="background-color:#fef3c7;border:1px solid #f59e0b;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:16px;font-weight:800;color:#92400e;margin-bottom:4px;">
        ⚠️ Expert Manual Edit &amp; Review Required (${escapeHtml(amountFormatted)} Order)
      </div>
      <div style="font-size:13px;color:#78350f;line-height:1.5;">
        A customer has paid for human expert manual photo touchup and government compliance review for <strong>${escapeHtml(country)}</strong>.
      </div>
    </div>

    <!-- Order Metadata Box -->
    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px;">
      <div style="font-size:14px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">
        Order &amp; Customer Details
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:1.8;">
        <tr>
          <td style="color:#64748b;width:38%;">Customer Email:</td>
          <td style="color:#0f172a;font-weight:700;"><a href="mailto:${escapeHtml(params.email)}" style="color:#2563eb;">${escapeHtml(params.email)}</a></td>
        </tr>
        <tr>
          <td style="color:#64748b;">Selected Country:</td>
          <td style="color:#0f172a;font-weight:700;">${escapeHtml(country)} (${escapeHtml(code)})</td>
        </tr>
        <tr>
          <td style="color:#64748b;">Target Dimensions:</td>
          <td style="color:#0f172a;font-weight:600;font-family:monospace;">${escapeHtml(dimensions)}</td>
        </tr>
        <tr>
          <td style="color:#64748b;">Amount Paid:</td>
          <td style="color:#16a34a;font-weight:800;">${escapeHtml(amountFormatted)}</td>
        </tr>
        <tr>
          <td style="color:#64748b;">Payment ID:</td>
          <td style="color:#0f172a;font-family:monospace;font-size:12px;">${escapeHtml(params.paymentId)}</td>
        </tr>
        <tr>
          <td style="color:#64748b;">Razorpay Payment Ref:</td>
          <td style="color:#0f172a;font-family:monospace;font-size:12px;">${escapeHtml(params.razorpayPaymentId)}</td>
        </tr>
      </table>
    </div>

    <!-- Images Section -->
    <div style="margin-bottom:28px;">
      <div style="font-size:15px;font-weight:800;color:#0f172a;margin-bottom:14px;">
        Photo Assets for Manual Review:
      </div>

      <div style="display:table;width:100%;">
        ${
          originalUrl
            ? `
        <div style="display:table-cell;width:48%;vertical-align:top;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:8px;text-transform:uppercase;">
            Original Uploaded Photo
          </div>
          <div style="max-height:260px;overflow:hidden;border-radius:6px;background:#fff;border:1px solid #e2e8f0;margin-bottom:10px;">
            <img src="${escapeHtml(originalUrl)}" alt="Original Upload" style="max-width:100%;max-height:250px;object-fit:contain;display:block;margin:0 auto;"/>
          </div>
          <a href="${escapeHtml(originalUrl)}" target="_blank" style="display:inline-block;padding:8px 14px;background:#0f172a;color:#ffffff !important;font-size:12px;font-weight:700;text-decoration:none;border-radius:6px;">
            Download Original &rarr;
          </a>
        </div>
        <div style="display:table-cell;width:4%;"></div>
        `
            : ""
        }

        ${
          processedUrl
            ? `
        <div style="display:table-cell;width:48%;vertical-align:top;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:12px;font-weight:700;color:#166534;margin-bottom:8px;text-transform:uppercase;">
            AI Processed Preview
          </div>
          <div style="max-height:260px;overflow:hidden;border-radius:6px;background:#fff;border:1px solid #e2e8f0;margin-bottom:10px;">
            <img src="${escapeHtml(processedUrl)}" alt="AI Processed Result" style="max-width:100%;max-height:250px;object-fit:contain;display:block;margin:0 auto;"/>
          </div>
          <a href="${escapeHtml(processedUrl)}" target="_blank" style="display:inline-block;padding:8px 14px;background:#15803d;color:#ffffff !important;font-size:12px;font-weight:700;text-decoration:none;border-radius:6px;">
            View AI Result &rarr;
          </a>
        </div>
        `
            : ""
        }
      </div>
    </div>

    <!-- Action Instructions for Editor -->
    <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px;margin-bottom:24px;">
      <div style="font-size:14px;font-weight:800;color:#166534;margin-bottom:10px;">
        ✅ Standard Expert Editing Workflow:
      </div>
      <ol style="margin:0;padding-left:20px;font-size:13px;color:#166534;line-height:1.7;">
        <li>Inspect the original photo against official <strong>${escapeHtml(country)}</strong> biometric rules (eye level, head ratio, lighting, shoulders).</li>
        <li>Correct any residual background artifacts, shadows, glare, hair strands, or edge fringing.</li>
        <li>Ensure color balance, contrast, and sharp biometric focus.</li>
        <li>Export the verified master (${escapeHtml(dimensions)}) and generate the 6×4″ printable template.</li>
        <li>Dispatch the finalized files directly to <a href="mailto:${escapeHtml(params.email)}" style="color:#15803d;font-weight:700;">${escapeHtml(params.email)}</a>.</li>
      </ol>
    </div>

    <div style="font-size:11px;color:#94a3b8;text-align:center;">
      ${escapeHtml(SITE_NAME)} Expert Order Dispatch Service &bull; Internal Notification
    </div>
  `;

  return {
    subject,
    html: baseEmailTemplate({
      preheader: `[ACTION REQUIRED] New Expert Edit for ${country} - Customer: ${params.email}`,
      bodyHtml,
    }),
  };
}
