/**
 * GET /api/admin/orders/export.csv — up to 10,000 orders matching the filters.
 */

import { NextResponse } from "next/server";
import { getPaymentCollection } from "@/lib/models/Payment";
import { LIST_PROJECTION, orderFilter } from "@/lib/admin/orders";
import { audit } from "@/lib/admin/query";
import { adminRoute, STAFF } from "@/lib/admin/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cell(value: unknown): string {
  const s = value === undefined || value === null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const HEADER = [
  "Created (UTC)", "Paid (UTC)", "Payment ID", "Email", "Plan", "Country", "Amount", "Refunded",
  "Currency", "Status", "Fulfilment", "Email delivery", "Invoice", "Razorpay order", "Razorpay payment",
];

export const GET = adminRoute(STAFF, async ({ req, admin }) => {
  const col = await getPaymentCollection();
  const rows = await col
    .find(orderFilter(req), { projection: LIST_PROJECTION })
    .sort({ createdAt: -1 })
    .limit(10_000)
    .toArray();

  const lines = [HEADER.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.createdAt?.toISOString(),
        r.paidAt?.toISOString(),
        r.paymentId,
        r.email,
        r.planType || "standard",
        r.metadata?.countryCode,
        ((r.amount || 0) / 100).toFixed(2),
        ((r.refundedAmount || 0) / 100).toFixed(2),
        r.currency,
        r.status,
        r.fulfillmentStatus,
        r.emailDelivery?.status,
        r.invoice?.invoiceNumber,
        r.razorpayOrderId,
        r.razorpayPaymentId,
      ]
        .map(cell)
        .join(",")
    );
  }
  await audit(admin, "orders.export", { type: "orders" }, { rows: rows.length, query: req.nextUrl.search });

  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
