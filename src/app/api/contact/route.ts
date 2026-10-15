import { NextResponse, type NextRequest } from "next/server";
import { sendContactNotificationEmailAction } from "@/lib/email";
import { SITE_NAME } from "@/lib/site";

export const runtime = "nodejs";

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  resultId?: string;
  message: string;
  honeypot?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ContactSubmission = await req.json();

    // 1. Honeypot check (anti-spam)
    if (body.honeypot && body.honeypot.trim().length > 0) {
      // Silently accept bots without doing anything
      return NextResponse.json(
        {
          success: true,
          message: "Thank you! Your message has been received.",
        },
        { status: 200 }
      );
    }

    const { name, email, subject, message, resultId } = body;

    // 2. Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid name (at least 2 characters).",
          field: "name",
        },
        { status: 422 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid email address.",
          field: "email",
        },
        { status: 422 }
      );
    }

    if (!subject || subject.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select a subject for your inquiry.",
          field: "subject",
        },
        { status: 422 }
      );
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a message of at least 10 characters.",
          field: "message",
        },
        { status: 422 }
      );
    }

    // 3. Send notification email via Resend (to the support inbox, BCC to configured team inboxes)
    try {
      await sendContactNotificationEmailAction({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        resultId: resultId?.trim(),
      });
    } catch (emailErr) {
      console.error("[contact] Failed to dispatch notification email:", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Thank you for contacting ${SITE_NAME}! Your message has been received. Our support team will review your inquiry and respond within 24 business hours.`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to process contact submission.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
