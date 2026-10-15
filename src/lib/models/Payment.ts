/**
 * Payment MongoDB Collection Schema & Helpers
 */

import { type Collection, type Db, ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";

export interface PaymentImage {
  resultId: string;
  cloudinaryPublicId?: string;
  imageUrl?: string;
  previewUrl?: string;
  format?: string;
  dimensions?: string;
  sizeKb?: number;
}

export interface PaymentInvoice {
  invoiceNumber?: string;
  invoiceUrl?: string;
  invoicePdfUrl?: string;
  cloudinaryPublicId?: string;
  generatedAt?: Date;
  emailedAt?: Date;
}

export interface PaymentEmailDelivery {
  status: "pending" | "sent" | "failed";
  resendEmailId?: string;
  attempts: number;
  lastError?: string;
  sentAt?: Date;
}

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type FulfillmentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface PaymentDocument {
  _id?: ObjectId;

  /** Internal UUID for the payment */
  paymentId: string;
  email: string;

  /** Razorpay references */
  razorpayOrderId: string;
  razorpayPaymentId?: string;

  /** Amount in smallest currency unit (e.g. cents) */
  amount: number;
  currency: string;

  status: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;

  productType: string;
  planType?: "standard" | "expert_edit";
  expertReviewStatus?: "pending" | "in_review" | "completed";

  image: PaymentImage & {
    originalImageUrl?: string;
  };

  invoice: PaymentInvoice;

  emailDelivery: PaymentEmailDelivery;

  downloadToken?: string;
  downloadTokenExpiresAt?: Date;

  metadata: {
    userAgent?: string;
    ipHash?: string;
    sessionId?: string;
    countryCode?: string;
    countryName?: string;
    isExpertEdit?: boolean;
    originalPreviewUrl?: string;
  };

  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

const COLLECTION_NAME = "payments";

let _ensured = false;

async function ensureIndexes(col: Collection<PaymentDocument>) {
  if (_ensured) return;
  await col.createIndex({ paymentId: 1 }, { unique: true });
  await col.createIndex({ razorpayOrderId: 1 }, { unique: true });
  await col.createIndex({ email: 1 });
  await col.createIndex({ status: 1 });
  await col.createIndex({ createdAt: -1 });
  await col.createIndex({ "image.resultId": 1 });
  await col.createIndex({ downloadToken: 1 }, { sparse: true });
  _ensured = true;
}

export async function getPaymentCollection(
  db?: Db
): Promise<Collection<PaymentDocument>> {
  const database = db || (await getDb());
  const col = database.collection<PaymentDocument>(COLLECTION_NAME);
  await ensureIndexes(col);
  return col;
}
