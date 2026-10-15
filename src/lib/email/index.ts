/**
 * Unified Email Module
 * All email delivery goes through this module.
 */

import { getResendClient, FROM_EMAIL, REPLY_TO_EMAIL, BCC_EMAILS } from "./resend";
import { paymentSuccessEmail } from "./templates/payment-success";
import {
  expertEditNotificationEmail,
  type ExpertEditNotificationParams,
} from "./templates/expert-edit-notification";
import { PRICING, type PlanType } from "@/lib/config/pricing";
import { SITE_NAME } from "@/lib/site";

export interface SendPaymentSuccessEmailParams {
  email: string;
  paymentId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  downloadUrl: string;
  invoiceUrl: string;
  invoicePdfUrl?: string;
  photoUrl?: string;
  pdfBuffer?: Buffer;
  countryName?: string;
  dimensions?: string;
  planType?: PlanType;
  bcc?: string[];
}

/**
 * Send payment confirmation + image delivery email with PDF invoice attachment & BCC.
 * Returns the Resend email ID on success, or throws on failure.
 */
export async function sendPaymentSuccessEmailAction(
  params: SendPaymentSuccessEmailParams
): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_demo") || apiKey.startsWith("re_123")) {
    console.info(
      `[email] Dev mode: Skipping live email dispatch for ${params.email} (RESEND_API_KEY is not configured or in demo mode).`
    );
    return `dev_mock_${Date.now()}`;
  }

  const resend = getResendClient();
  const { subject, html } = paymentSuccessEmail(params);

  const attachments = params.pdfBuffer
    ? [
        {
          filename: `Invoice-${params.invoiceNumber}.pdf`,
          content: params.pdfBuffer,
        },
      ]
    : undefined;

  const targetBcc = params.bcc && params.bcc.length > 0 ? params.bcc : BCC_EMAILS;

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.email,
    replyTo: REPLY_TO_EMAIL,
    bcc: targetBcc,
    subject,
    html,
    attachments,
    tags: [
      { name: "type", value: "payment_success" },
      { name: "payment_id", value: params.paymentId },
      { name: "plan_type", value: params.planType || "standard" },
    ],
  });

  if (result.error) {
    const errorMsg = result.error.message || JSON.stringify(result.error);
    console.error(`[email] Resend API Error for payment ${params.paymentId}:`, errorMsg);
    throw new Error(`Resend error: ${errorMsg}`);
  }

  return result.data?.id || "unknown";
}

/**
 * Send Expert Edit alert with original customer photo and country details to editing specialists.
 */
export async function sendExpertEditTeamNotificationAction(
  params: ExpertEditNotificationParams
): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_demo") || apiKey.startsWith("re_123")) {
    console.info(
      `[email] Dev mode: Skipping live expert edit team notification for payment ${params.paymentId}.`
    );
    return `dev_mock_expert_${Date.now()}`;
  }

  const resend = getResendClient();
  const { subject, html } = expertEditNotificationEmail(params);

  // Send to BCC team / primary contact mailbox
  const teamRecipients = [
    "usvisaphotoai@gmail.com",
    REPLY_TO_EMAIL,
    ...BCC_EMAILS,
  ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: teamRecipients,
    replyTo: `${params.email}`,
    subject,
    html,
    tags: [
      { name: "type", value: "expert_edit_request" },
      { name: "payment_id", value: params.paymentId },
    ],
  });

  if (result.error) {
    const errorMsg = result.error.message || JSON.stringify(result.error);
    console.error(`[email] Failed to send expert edit team alert for ${params.paymentId}:`, errorMsg);
    throw new Error(`Resend expert alert error: ${errorMsg}`);
  }

  return result.data?.id || "unknown";
}

export interface SendContactNotificationParams {
  name: string;
  email: string;
  subject: string;
  message: string;
  resultId?: string;
}

/**
 * Send notification email when a customer submits the contact form.
 */
export async function sendContactNotificationEmailAction(
  params: SendContactNotificationParams
): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_demo") || apiKey.startsWith("re_123")) {
    console.info(
      `[email] Dev mode: Skipping contact form notification for ${params.email}.`
    );
    return `dev_mock_${Date.now()}`;
  }

  const resend = getResendClient();
  const adminSubject = `[${SITE_NAME} Inquiry] ${params.subject} — from ${params.name}`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:24px;color:#0F172A;max-width:600px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:12px;">
      <div style="font-size:20px;font-weight:800;color:#0F172A;margin-bottom:16px;">New Customer Inquiry</div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;margin-bottom:20px;font-size:14px;line-height:1.6;">
        <div><strong>Customer Name:</strong> ${params.name}</div>
        <div><strong>Customer Email:</strong> <a href="mailto:${params.email}">${params.email}</a></div>
        <div><strong>Subject:</strong> ${params.subject}</div>
        ${params.resultId ? `<div><strong>Session / Result ID:</strong> <code>${params.resultId}</code></div>` : ""}
      </div>
      <div style="font-size:13px;font-weight:700;color:#64748B;text-transform:uppercase;margin-bottom:8px;">Message:</div>
      <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;padding:16px;font-size:14px;line-height:1.6;white-space:pre-wrap;color:#334155;">${params.message}</div>
      <div style="margin-top:24px;font-size:12px;color:#94A3B8;text-align:center;">Sent via ${SITE_NAME} Customer Contact Gateway</div>
    </div>
  `;

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: REPLY_TO_EMAIL,
    replyTo: `${params.name} <${params.email}>`,
    bcc: BCC_EMAILS,
    subject: adminSubject,
    html,
  });

  if (result.error) {
    console.error("[email] Failed to send contact notification:", result.error);
    throw new Error(`Resend error: ${result.error.message || JSON.stringify(result.error)}`);
  }

  return result.data?.id || "unknown";
}

/**
 * Re-export PRICING and email constants for convenience
 */
export { PRICING, FROM_EMAIL, REPLY_TO_EMAIL, BCC_EMAILS };
