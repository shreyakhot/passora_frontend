/**
 * Sent to the customer when an editor delivers their Expert Edit photo
 * from the admin panel.
 */

import { baseEmailTemplate, escapeHtml } from "./base";
import { PRICING } from "@/lib/config/pricing";

export interface ExpertEditDeliveredParams {
  email: string;
  paymentId: string;
  downloadUrl: string;
  photoUrl?: string;
  countryName?: string;
  dimensions?: string;
  editorNote?: string;
  expiresInHours: number;
}

export function expertEditDeliveredEmail(params: ExpertEditDeliveredParams): {
  subject: string;
  html: string;
} {
  const subject = `Your expert-edited passport photo is ready — ${escapeHtml(PRICING.businessName)}`;

  const bodyHtml = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background-color:#f0fdf4;line-height:56px;font-size:28px;">
        ⭐
      </div>
    </div>

    <h2 style="color:#0f172a;font-size:22px;font-weight:800;text-align:center;margin:0 0 8px;letter-spacing:-0.5px;">
      Your expert-edited photo is ready
    </h2>
    <p style="color:#64748b;font-size:14px;text-align:center;margin:0 0 28px;">
      Our editor has reviewed and finished your ${escapeHtml(params.countryName || "")} photo. Download the final file below.
    </p>

    ${
      params.photoUrl
        ? `
    <div style="text-align:center;margin-bottom:24px;">
      <img src="${escapeHtml(params.photoUrl)}" alt="Your expert-edited passport photo" width="175" style="width:175px;max-width:100%;height:auto;border:1px solid #e2e8f0;border-radius:8px;display:inline-block;"/>
    </div>
    `
        : ""
    }

    ${
      params.editorNote
        ? `
    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Note from your editor</div>
      <div style="font-size:14px;color:#0f172a;line-height:1.6;white-space:pre-wrap;">${escapeHtml(params.editorNote)}</div>
    </div>
    `
        : ""
    }

    ${
      params.dimensions
        ? `
    <p style="text-align:center;font-size:13px;color:#64748b;margin:0 0 20px;">
      Size: <strong style="color:#0f172a;">${escapeHtml(params.dimensions)} px</strong>
    </p>
    `
        : ""
    }

    <div style="text-align:center;margin-bottom:16px;">
      <a href="${escapeHtml(params.downloadUrl)}" style="display:inline-block;padding:14px 32px;background-color:#4d7c0f;color:#ffffff !important;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
        ⬇️ Download Your Final Photo
      </a>
    </div>

    <p style="text-align:center;font-size:12px;color:#94a3b8;margin-bottom:24px;">
      This download link expires in ${params.expiresInHours} hours. Earlier download links now give you this edited version too.
    </p>

    <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0;"/>

    <div style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;font-size:13px;color:#92400e;">
      Photo rules can differ between online and paper applications. Please check the current requirements with your issuing authority before you apply.
      Questions? Reply to this email or visit
      <a href="${escapeHtml(PRICING.siteUrl)}/contact-us" style="color:#4d7c0f;text-decoration:underline;">our support page</a>.
    </div>
  `;

  return {
    subject,
    html: baseEmailTemplate({
      preheader: "Your expert-edited passport photo is ready to download.",
      bodyHtml,
    }),
  };
}
