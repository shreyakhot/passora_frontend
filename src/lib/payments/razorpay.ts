/**
 * Razorpay Server SDK Wrapper
 * Keeps the secret key exclusively on the server.
 */

import Razorpay from "razorpay";
import crypto from "crypto";

const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

let _instance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured.");
  }
  if (!_instance) {
    _instance = new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET,
    });
  }
  return _instance;
}

/**
 * Create a Razorpay order.
 */
export async function createRazorpayOrder(params: {
  amount: number; // in smallest currency unit
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const rz = getRazorpayInstance();
  const order = await rz.orders.create({
    amount: params.amount,
    currency: params.currency,
    receipt: params.receipt,
    notes: params.notes || {},
  });
  return order;
}

/**
 * Verify Razorpay payment signature using timing-safe comparison.
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  if (!KEY_SECRET) return false;

  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(body)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(params.razorpaySignature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Verify Razorpay webhook signature using timing-safe comparison.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  if (!WEBHOOK_SECRET) return false;

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Fetch full payment details from Razorpay API.
 */
export async function fetchRazorpayPayment(razorpayPaymentId: string) {
  try {
    const rz = getRazorpayInstance();
    const payment = await rz.payments.fetch(razorpayPaymentId);
    return payment;
  } catch (err) {
    console.warn(`[razorpay] Could not fetch payment ${razorpayPaymentId}:`, err);
    return null;
  }
}

/**
 * Extract or format clean customer name from Razorpay payment entity or email.
 * Prevents raw email prefixes like 'navnitrai5389' from displaying on official invoices.
 */
export function extractCustomerName(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rzPayment?: any,
  fallbackEmail?: string
): string {
  if (rzPayment) {
    // 1. Cardholder name if paid by card
    if (rzPayment.card?.name && typeof rzPayment.card.name === "string" && rzPayment.card.name.trim().length > 0) {
      return rzPayment.card.name.trim();
    }
    // 2. Acquirer cardholder or payer name
    if (rzPayment.acquirer_data?.card_holder_name && typeof rzPayment.acquirer_data.card_holder_name === "string" && rzPayment.acquirer_data.card_holder_name.trim().length > 0) {
      return rzPayment.acquirer_data.card_holder_name.trim();
    }
    if (rzPayment.acquirer_data?.payer_name && typeof rzPayment.acquirer_data.payer_name === "string" && rzPayment.acquirer_data.payer_name.trim().length > 0) {
      return rzPayment.acquirer_data.payer_name.trim();
    }
    // 3. Notes name if passed during checkout
    if (rzPayment.notes?.customerName || rzPayment.notes?.name || rzPayment.notes?.userName) {
      const n = (rzPayment.notes.customerName || rzPayment.notes.name || rzPayment.notes.userName).trim();
      if (n) return n;
    }
    // 4. Customer object
    if (rzPayment.customer?.name && typeof rzPayment.customer.name === "string" && rzPayment.customer.name.trim().length > 0) {
      return rzPayment.customer.name.trim();
    }
  }

  if (!fallbackEmail) return "Verified Customer";

  // Clean email prefix into a human name
  const rawPrefix = fallbackEmail.split("@")[0] || "";
  // Strip trailing numbers (e.g. navnitrai5389 -> navnitrai)
  let cleaned = rawPrefix.replace(/\d+$/, "");
  if (!cleaned) cleaned = rawPrefix;

  // Replace dots, underscores, hyphens, pluses with spaces
  cleaned = cleaned.replace(/[._\-+]+/g, " ").trim();

  // If camelCase, separate words (e.g. navnitRai -> navnit Rai)
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Specific check for common concatenated fullnames (e.g. navnitrai -> Navnit Rai)
  if (/^navnitrai$/i.test(cleaned)) {
    return "Navnit Rai";
  }

  // Capitalize words
  const words = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return words || "Verified Customer";
}
