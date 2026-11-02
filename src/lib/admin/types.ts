/**
 * Admin API response shapes (FastAPI backend, /admin/*).
 * Dates arrive as ISO strings; amounts are in the smallest currency unit.
 */

export type AdminRole = "owner" | "support" | "editor";

export interface AdminMe {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Money {
  currency: string;
  amount: number;
  orders?: number;
}

export interface OrderListItem {
  paymentId: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  fulfillmentStatus: string;
  planType?: "standard" | "expert_edit";
  expertReviewStatus?: string;
  refundedAmount?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  invoice?: { invoiceNumber?: string };
  emailDelivery?: { status?: string };
  metadata?: { countryCode?: string; countryName?: string };
  image?: { previewUrl?: string };
  createdAt: string;
  paidAt?: string;
}

export interface OrderDetail extends OrderListItem {
  productType?: string;
  downloadUrl?: string | null;
  downloadTokenExpiresAt?: string;
  updatedAt?: string;
  image?: {
    resultId?: string;
    imageUrl?: string;
    previewUrl?: string;
    originalImageUrl?: string;
    dimensions?: string;
    format?: string;
    sizeKb?: number;
  };
  invoice?: {
    invoiceNumber?: string;
    invoicePdfUrl?: string;
    generatedAt?: string;
  };
  emailDelivery?: {
    status?: string;
    attempts?: number;
    lastError?: string;
    sentAt?: string;
    resendEmailId?: string;
  };
  metadata?: {
    countryCode?: string;
    countryName?: string;
    userAgent?: string;
    ipHash?: string;
    originalPreviewUrl?: string;
  };
  expertEdit?: {
    assignee?: { name: string; email: string };
    claimedAt?: string;
    editedImageUrl?: string;
    aiImageUrl?: string;
    deliveredAt?: string;
    deliveredBy?: { name: string };
    note?: string;
    emailedAt?: string;
  };
  refunds?: {
    refundId?: string;
    amount: number;
    currency: string;
    status?: string;
    reason: string;
    adminName?: string;
    createdAt: string;
  }[];
  adminNotes?: { id: string; text: string; adminName: string; createdAt: string }[];
}

export interface ActivityLog {
  event: string;
  status: string;
  paymentId?: string;
  sessionId?: string;
  email?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WebhookEvent {
  eventId: string;
  eventType: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  status: string;
  metadata?: Record<string, unknown>;
  processedAt?: string;
  createdAt: string;
}

export interface OrderDetailResponse {
  order: OrderDetail;
  activity: ActivityLog[];
  webhooks: WebhookEvent[];
  relatedOrders: Pick<OrderListItem, "paymentId" | "status" | "amount" | "currency" | "createdAt">[];
}

export interface DashboardData {
  range: { days: number; from: string; to: string };
  revenue: Money[];
  revenueToday: Money[];
  orders: { created: number; paid: number; byStatus: Record<string, number>; paidRate: number | null };
  series: { date: string; orders: number; revenue: Record<string, number> }[];
  topCountries: { countryCode: string; countryName?: string; orders: number }[];
  plans: { planType: string; currency: string; orders: number; amount: number }[];
  queues: {
    expertPending: number;
    expertInReview: number;
    fulfillmentFailed: number;
    fulfillmentStuck: number;
    emailFailed: number;
  };
  funnel: Funnel;
  recentOrders: OrderListItem[];
}

/** Photos uploaded in the period and how many reached each step (cumulative). */
export interface Funnel {
  failed: number;
  uploaded: number;
  checkout: number;
  paid: number;
  downloaded: number;
  avgProcessingMs: number | null;
}

export type JourneyStage = "failed" | "uploaded" | "checkout" | "paid" | "downloaded";

export interface Journey {
  uploadedAt: string;
  stage: JourneyStage;
  resultId?: string;
  countryCode?: string;
  documentType?: string;
  durationMs?: number;
  error?: string;
  order?: {
    paymentId: string;
    email: string;
    status: string;
    amount: number;
    currency: string;
    planType?: string;
    createdAt: string;
    paidAt?: string;
  };
  checkouts: number;
  downloads: number;
  lastDownloadAt?: string;
}

export interface ExpertQueueItem {
  paymentId: string;
  email: string;
  expertReviewStatus?: string;
  expertEdit?: { assignee?: { id: string; name: string }; claimedAt?: string; deliveredAt?: string };
  metadata?: { countryCode?: string; countryName?: string };
  image?: { previewUrl?: string; dimensions?: string };
  paidAt?: string;
  createdAt: string;
}

export interface CountrySpec {
  countryCode: string;
  countryName: string;
  documentType: string;
  dimensions: string;
  widthMm?: number | null;
  heightMm?: number | null;
  printDpi?: number;
  maxFileSizeKb?: number;
  background?: string;
  headHeightPct?: [number, number];
  eyeFromBottomPct?: [number, number];
  topMarginMinPct?: number;
}

export interface ExpertDetail {
  paymentId: string;
  email: string;
  status: "pending" | "in_review" | "completed";
  paidAt?: string;
  country: { code?: string; name?: string };
  spec: CountrySpec | null;
  images: { original?: string; ai?: string; preview?: string; edited?: string };
  dimensions?: string;
  expertEdit: {
    assignee?: { id: string; name: string; email: string };
    claimedAt?: string;
    deliveredAt?: string;
    deliveredBy?: { name: string };
    note?: string;
    emailedAt?: string;
    dimensions?: string;
    sizeKb?: number;
  };
}

export interface Customer {
  email: string;
  orders: number;
  paidOrders: number;
  expertOrders: number;
  spent: Money[];
  firstOrderAt: string;
  lastOrderAt: string;
  countries: string[];
}

export interface AuditLog {
  adminEmail?: string;
  adminName?: string;
  action: string;
  target: { type: string; id?: string | null };
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
  activeSessions: number;
}

export interface SystemStatus {
  photoApi: { url: string; ok: boolean; latencyMs: number | null; version?: string; countriesLoaded?: number };
  mongo: { ok: boolean; pingMs: number | null; database: string };
  integrations: { resend: boolean; razorpay: boolean; razorpayWebhook: boolean; cloudinary: boolean };
  shop: { siteUrl: string; currency: string; standard: string; expertEdit: string };
  uploads24h: {
    processed: number;
    failed: number;
    avgMs: number | null;
    maxMs: number | null;
    topErrors: { error: string | null; count: number }[];
  } | null;
}
