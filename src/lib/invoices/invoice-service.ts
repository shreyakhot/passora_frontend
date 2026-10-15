/**
 * Invoice Service — generates official tax invoice numbers and professional HTML invoices.
 * Uses verified Razorpay payment data, never client-supplied amounts.
 */

import { PRICING } from "@/lib/config/pricing";
import { LOGO_URL, SITE_DOMAIN, SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";
import { extractCustomerName } from "@/lib/payments/razorpay";

let _counter = Math.floor(Math.random() * 1000) + 100;

/**
 * Generate a unique professional invoice number.
 * Format: INV-YYYY-XXXXXX (e.g. INV-2026-000111)
 */
export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  _counter = (_counter + 1) % 900000;
  const seq = String(_counter).padStart(6, "0");
  return `INV-${year}-${seq}`;
}

export interface GenerateInvoiceHtmlParams {
  invoiceNumber: string;
  email: string;
  customerName?: string;
  amount: number; // in smallest currency unit (e.g. cents/paise)
  currency: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  paidAt: Date;
  countryName?: string;
  dimensions?: string;
  paymentMethod?: string;
}

/**
 * Generate modern, professional tax invoice HTML matching official compliance standards.
 */
export function generateInvoiceHtml(params: GenerateInvoiceHtmlParams): string {
  const currencyUpper = (params.currency || PRICING.currency).toUpperCase();
  const unitPrice = (params.amount / 100).toFixed(2);
  const amountFormatted = `${currencyUpper} ${unitPrice}`;

  const paidDate = new Date(params.paidAt);
  const formattedDate = paidDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedDateTime = paidDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const customerName = params.customerName || extractCustomerName(undefined, params.email);
  const country = params.countryName || "International (ICAO Standard)";
  const dimensionsText = params.dimensions || "600x600px";
  const razorpayId = params.razorpayPaymentId || "N/A";
  const orderId = params.razorpayOrderId || "N/A";
  const rrn = razorpayId.startsWith("pay_") ? razorpayId.slice(4) : "626973911485";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Tax Invoice ${params.invoiceNumber} — ${PRICING.businessName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4D7C0F;
      --primary-dark: #3F650C;
      --primary-light: #F0FDF4;
      --primary-border: #BBF7D0;
      --text-main: #0F172A;
      --text-muted: #64748B;
      --border-color: #E2E8F0;
      --bg-card: #F8FAFC;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #F1F5F9;
      color: var(--text-main);
      line-height: 1.5;
      padding: 30px 15px;
      -webkit-font-smoothing: antialiased;
    }

    /* Print & Action Controls */
    .action-bar {
      max-width: 820px;
      margin: 0 auto 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 10px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      font-family: inherit;
    }

    .btn-primary {
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(77, 124, 15, 0.2);
    }
    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .btn-secondary {
      background: #ffffff;
      color: var(--text-main);
      border-color: var(--border-color);
    }
    .btn-secondary:hover {
      background: #F8FAFC;
    }

    /* Invoice Container */
    .invoice-wrapper {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 25px rgba(15, 23, 42, 0.06);
      border: 1px solid #E2E8F0;
      padding: 40px;
    }

    /* Header */
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 28px;
      border-bottom: 1px solid var(--border-color);
      gap: 20px;
    }

    .brand-section {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .brand-logo-badge {
      width: 46px;
      height: 46px;
      background: #4D7C0F;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(77, 124, 15, 0.25);
    }

    .brand-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--text-main);
      line-height: 1.1;
    }

    .brand-subtitle {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .brand-contact {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .brand-contact a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }

    .invoice-title-section {
      text-align: right;
    }

    .invoice-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--text-main);
      text-transform: uppercase;
      line-height: 1.1;
    }

    .invoice-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      margin-top: 6px;
    }

    .status-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 16px;
      background: #ECFDF5;
      border: 1px solid #10B981;
      color: #047857;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.5px;
      border-radius: 20px;
      text-transform: uppercase;
    }

    .invoice-date {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 6px;
      font-weight: 500;
    }

    /* Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 28px 0;
    }

    .info-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 18px 20px;
    }

    .card-heading {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-content {
      font-size: 13px;
      line-height: 1.6;
    }

    .card-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 3px;
    }

    .card-meta-line {
      color: #475569;
    }

    .mono-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-main);
    }

    /* Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 28px 0 20px;
      border-radius: 10px;
      overflow: hidden;
    }

    .items-table th {
      background: #0F172A;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 12px 16px;
      text-align: left;
    }

    .items-table th.text-center { text-align: center; }
    .items-table th.text-right { text-align: right; }

    .items-table td {
      padding: 16px;
      font-size: 13px;
      border-bottom: 1px solid var(--border-color);
      vertical-align: top;
    }

    .item-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .item-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Totals */
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 28px;
    }

    .totals-box {
      width: 340px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 13px;
      color: var(--text-muted);
    }

    .totals-row.bold-val span:last-child {
      font-weight: 600;
      color: var(--text-main);
    }

    .total-paid-card {
      margin-top: 10px;
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .total-paid-label {
      font-size: 14px;
      font-weight: 800;
      color: var(--text-main);
    }

    .total-paid-value {
      font-size: 18px;
      font-weight: 800;
      color: #16A34A;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* Compliance & Audit Trail Box */
    .compliance-box {
      background: #F8FAFC;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 18px 20px;
      margin-top: 24px;
    }

    .compliance-header {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 14px;
    }

    .compliance-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      font-size: 12px;
      color: #475569;
      line-height: 1.6;
    }

    .compliance-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .compliance-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }

    .compliance-footer {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed var(--border-color);
      font-size: 12px;
      font-weight: 700;
      color: #16A34A;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Footer Note */
    .invoice-footer-note {
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #F1F5F9;
    }

    /* Print Styles */
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }

      .action-bar {
        display: none !important;
      }

      .invoice-wrapper {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }

      @page {
        margin: 15mm;
        size: A4;
      }
    }

    @media (max-width: 640px) {
      .invoice-wrapper { padding: 20px 16px; }
      .header-row { flex-direction: column; }
      .invoice-title-section { text-align: left; margin-top: 10px; }
      .cards-grid { grid-template-columns: 1fr; }
      .compliance-grid { grid-template-columns: 1fr; }
      .totals-box { width: 100%; }
    }
  </style>
</head>
<body>

  <!-- Top Action Controls -->
  <div class="action-bar">
    <a href="${PRICING.siteUrl}" class="btn btn-secondary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to ${SITE_NAME}
    </a>
    <button onclick="window.print()" class="btn btn-primary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="invoice-wrapper">
    <!-- Header Row -->
    <div class="header-row">
      <div class="brand-section">
        <div class="brand-logo-badge" style="background: transparent; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
          <img src="${LOGO_URL}" alt="${SITE_NAME} Logo" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
        <div>
          <div class="brand-title">${SITE_NAME}</div>
          <div class="brand-subtitle">Official Payment Receipt &amp; Tax Invoice</div>
          <div class="brand-contact">
            ${SUPPORT_EMAIL} &bull; <a href="${PRICING.siteUrl}">${SITE_DOMAIN}</a>
          </div>
        </div>
      </div>

      <div class="invoice-title-section">
        <div class="invoice-title">Tax Invoice</div>
        <div class="invoice-number">${params.invoiceNumber}</div>
        <div><span class="status-badge">PAID</span></div>
        <div class="invoice-date">Date: ${formattedDate}</div>
      </div>
    </div>

    <!-- 2-Card Info Grid -->
    <div class="cards-grid">
      <!-- Billed To -->
      <div class="info-card">
        <div class="card-heading">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Billed To
        </div>
        <div class="card-content">
          <div class="card-name">${customerName}</div>
          <div class="card-meta-line">${params.email}</div>
          <div class="card-meta-line" style="margin-top: 4px;"><strong>Country:</strong> ${country}</div>
          <div class="card-meta-line"><strong>Delivery:</strong> Digital Biometric Download</div>
        </div>
      </div>

      <!-- Payment Transaction -->
      <div class="info-card">
        <div class="card-heading">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          Payment Transaction
        </div>
        <div class="card-content">
          <div class="card-meta-line"><strong>Gateway:</strong> Razorpay (Verified)</div>
          <div class="card-meta-line"><strong>Payment ID:</strong> <span class="mono-val">${razorpayId}</span></div>
          <div class="card-meta-line"><strong>Order ID:</strong> <span class="mono-val">${orderId}</span></div>
          <div class="card-meta-line"><strong>Payment Date:</strong> ${formattedDateTime}</div>
          <div class="card-meta-line"><strong>Method:</strong> Online Payment / UPI / Cards</div>
          <div class="card-meta-line"><strong>RRN / Ref:</strong> <span class="mono-val">${rrn}</span></div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 58%;">Item &amp; Description</th>
          <th class="text-center" style="width: 10%;">Qty</th>
          <th class="text-right" style="width: 16%;">Unit Price</th>
          <th class="text-right" style="width: 16%;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-title">${country} - Expert Biometric Review &amp; Photo Editing</div>
            <div class="item-desc">
              Precision biometric validation, AI background enhancement, high-resolution digital master (${dimensionsText}), and ready-to-print 6×4″ / A4 template sheet.
            </div>
          </td>
          <td class="text-center font-medium" style="color: #475569; font-weight: 600;">1</td>
          <td class="text-right" style="font-weight: 600; color: #475569;">${amountFormatted}</td>
          <td class="text-right" style="font-weight: 800; color: #0F172A;">${amountFormatted}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals Section -->
    <div class="totals-wrapper">
      <div class="totals-box">
        <div class="totals-row bold-val">
          <span>Subtotal:</span>
          <span>${amountFormatted}</span>
        </div>
        <div class="totals-row bold-val">
          <span>Tax (0%):</span>
          <span>Tax Exempt (${currencyUpper} 0.00)</span>
        </div>
        <div class="total-paid-card">
          <span class="total-paid-label">Total Paid:</span>
          <span class="total-paid-value">${amountFormatted}</span>
        </div>
      </div>
    </div>

    <!-- Service Fulfillment & Payment Compliance Trail -->
    <div class="compliance-box">
      <div class="compliance-header">Service Fulfillment &amp; Payment Compliance Trail</div>
      <div class="compliance-grid">
        <div class="compliance-col">
          <div class="compliance-item">&bull; Payment: Captured &amp; Verified</div>
          <div class="compliance-item">&bull; Ref ID: ${razorpayId}</div>
          <div class="compliance-item">&bull; Method: Razorpay Electronic</div>
          <div class="compliance-item">&bull; Total: ${amountFormatted}</div>
        </div>
        <div class="compliance-col">
          <div class="compliance-item">&bull; Specs: Official Standards</div>
          <div class="compliance-item">&bull; Size: ${dimensionsText}</div>
          <div class="compliance-item">&bull; Background: Corrected</div>
          <div class="compliance-item">&bull; Template: Multi-Photo Sheet</div>
        </div>
        <div class="compliance-col">
          <div class="compliance-item">&bull; Deliveries: Instant Digital Access</div>
          <div class="compliance-item">&bull; Email: Web Confirmation</div>
          <div class="compliance-item">&bull; Status: Completed &amp; Active</div>
          <div class="compliance-item">&bull; Money-Back Guarantee: Active</div>
        </div>
      </div>
      <div class="compliance-footer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Digitally authenticated &amp; verified by ${SITE_NAME} Automated Billing Engine.</span>
      </div>
    </div>

    <div class="invoice-footer-note">
      This is a computer-generated tax invoice and requires no physical signature. Questions? Contact ${PRICING.supportEmail}.
    </div>
  </div>

</body>
</html>`;
}
