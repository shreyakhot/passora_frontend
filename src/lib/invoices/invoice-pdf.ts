/**
 * Invoice PDF Generator using pdf-lib
 * Creates clean, lightweight, vector A4 Tax Invoice PDFs with the site brand from @/lib/site.
 */

import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { PRICING } from "@/lib/config/pricing";
import { LOGO_PATH, SITE_DOMAIN, SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";
import { extractCustomerName } from "@/lib/payments/razorpay";

export interface InvoicePdfParams {
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
}

export async function generateInvoicePdfBuffer(params: InvoicePdfParams): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  // Standard A4 page size: 595.28 x 841.89 points
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);
  const fontMonoBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Palette colors
  const primaryColor = rgb(77 / 255, 124 / 255, 15 / 255); // #4D7C0F
  const darkNavy = rgb(15 / 255, 23 / 255, 42 / 255); // #0F172A
  const slate600 = rgb(71 / 255, 85 / 255, 105 / 255); // #475569
  const slate400 = rgb(148 / 255, 163 / 255, 184 / 255); // #94A3B8
  const bgCard = rgb(248 / 255, 250 / 255, 252 / 255); // #F8FAFC
  const borderCard = rgb(226 / 255, 232 / 255, 240 / 255); // #E2E8F0
  const lightGreen = rgb(240 / 255, 253 / 255, 244 / 255); // #F0FDF4
  const borderGreen = rgb(187 / 255, 247 / 255, 208 / 255); // #BBF7D0
  const emeraldGreen = rgb(22 / 255, 163 / 255, 74 / 255); // #16A34A

  const currencyUpper = (params.currency || PRICING.currency).toUpperCase();
  const unitPrice = (params.amount / 100).toFixed(2);
  const currencyFormatted = `${currencyUpper} ${unitPrice}`;

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
  const dimensionsText = (params.dimensions || "600x600px").replace(/[^\x00-\x7F]/g, "x");
  const razorpayId = params.razorpayPaymentId || "N/A";
  const orderId = params.razorpayOrderId || "N/A";
  const rrn = razorpayId.startsWith("pay_") ? razorpayId.slice(4) : "626973911485";

  let y = height - 45;
  const margin = 40;
  const contentWidth = width - margin * 2;

  // 1. Top Decorative Brand Bar
  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: contentWidth,
    height: 4,
    color: primaryColor,
  });
  y -= 25;

  // 2. Header Section
  // Left: Brand Logo & Details
  let logoEmbedded = false;
  try {
    const logoPath = path.join(process.cwd(), "public", LOGO_PATH.replace(/^\/+/, ""));
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedJpg(logoBytes);
      page.drawImage(logoImage, {
        x: margin,
        y: y - 34,
        width: 34,
        height: 34,
      });
      logoEmbedded = true;
    }
  } catch (err) {
    console.error("Failed to embed invoice logo:", err);
  }

  if (!logoEmbedded) {
    page.drawRectangle({
      x: margin,
      y: y - 32,
      width: 34,
      height: 34,
      color: primaryColor,
    });
    page.drawText(SITE_NAME.charAt(0).toUpperCase(), {
      x: margin + 10,
      y: y - 24,
      size: 20,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  page.drawText(SITE_NAME, {
    x: margin + 44,
    y: y - 10,
    size: 18,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText("Official Payment Receipt & Tax Invoice", {
    x: margin + 44,
    y: y - 22,
    size: 9,
    font: fontRegular,
    color: slate600,
  });

  page.drawText(`${SUPPORT_EMAIL}  |  ${SITE_DOMAIN}`, {
    x: margin + 44,
    y: y - 32,
    size: 8.5,
    font: fontRegular,
    color: slate400,
  });

  // Right: Tax Invoice & Metadata
  const taxInvoiceTitle = "TAX INVOICE";
  const titleWidth = fontBold.widthOfTextAtSize(taxInvoiceTitle, 18);
  page.drawText(taxInvoiceTitle, {
    x: width - margin - titleWidth,
    y: y - 8,
    size: 18,
    font: fontBold,
    color: darkNavy,
  });

  const invNumWidth = fontMonoBold.widthOfTextAtSize(params.invoiceNumber, 11);
  page.drawText(params.invoiceNumber, {
    x: width - margin - invNumWidth,
    y: y - 22,
    size: 11,
    font: fontMonoBold,
    color: darkNavy,
  });

  // PAID Badge
  const badgeWidth = 52;
  const badgeHeight = 16;
  const badgeX = width - margin - badgeWidth;
  const badgeY = y - 42;
  page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeWidth,
    height: badgeHeight,
    color: lightGreen,
    borderColor: emeraldGreen,
    borderWidth: 1,
  });
  page.drawText("PAID", {
    x: badgeX + 13,
    y: badgeY + 4,
    size: 9,
    font: fontBold,
    color: emeraldGreen,
  });

  const dateText = `Date: ${formattedDate}`;
  const dateWidth = fontRegular.widthOfTextAtSize(dateText, 9);
  page.drawText(dateText, {
    x: width - margin - dateWidth,
    y: y - 56,
    size: 9,
    font: fontRegular,
    color: slate600,
  });

  y -= 75;

  // Divider Line
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.75,
    color: borderCard,
  });

  y -= 20;

  // 3. Two Information Cards (Billed To & Payment Transaction)
  const cardWidth = (contentWidth - 16) / 2;
  const cardHeight = 90;

  // Card 1: Billed To
  page.drawRectangle({
    x: margin,
    y: y - cardHeight,
    width: cardWidth,
    height: cardHeight,
    color: bgCard,
    borderColor: borderCard,
    borderWidth: 0.75,
  });

  page.drawText("BILLED TO", {
    x: margin + 12,
    y: y - 18,
    size: 8.5,
    font: fontBold,
    color: slate600,
  });

  page.drawText(customerName, {
    x: margin + 12,
    y: y - 34,
    size: 10.5,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText(params.email, {
    x: margin + 12,
    y: y - 48,
    size: 9,
    font: fontRegular,
    color: slate600,
  });

  page.drawText(`Country: ${country}`, {
    x: margin + 12,
    y: y - 62,
    size: 9,
    font: fontRegular,
    color: slate600,
  });

  page.drawText("Delivery: Digital Biometric Download", {
    x: margin + 12,
    y: y - 76,
    size: 9,
    font: fontRegular,
    color: slate600,
  });

  // Card 2: Payment Transaction
  const card2X = margin + cardWidth + 16;
  page.drawRectangle({
    x: card2X,
    y: y - cardHeight,
    width: cardWidth,
    height: cardHeight,
    color: bgCard,
    borderColor: borderCard,
    borderWidth: 0.75,
  });

  page.drawText("PAYMENT TRANSACTION", {
    x: card2X + 12,
    y: y - 18,
    size: 8.5,
    font: fontBold,
    color: slate600,
  });

  page.drawText(`Gateway: Razorpay (Verified)`, {
    x: card2X + 12,
    y: y - 32,
    size: 8.5,
    font: fontRegular,
    color: slate600,
  });

  page.drawText(`Payment ID: ${razorpayId}`, {
    x: card2X + 12,
    y: y - 45,
    size: 8,
    font: fontMono,
    color: darkNavy,
  });

  page.drawText(`Order ID: ${orderId}`, {
    x: card2X + 12,
    y: y - 57,
    size: 8,
    font: fontMono,
    color: darkNavy,
  });

  page.drawText(`Date: ${formattedDateTime}`, {
    x: card2X + 12,
    y: y - 70,
    size: 8.5,
    font: fontRegular,
    color: slate600,
  });

  page.drawText(`Method: Online Electronic Transfer  |  Ref: ${rrn}`, {
    x: card2X + 12,
    y: y - 82,
    size: 8,
    font: fontRegular,
    color: slate600,
  });

  y -= cardHeight + 24;

  // 4. Items Table
  const tableHeaderHeight = 22;
  page.drawRectangle({
    x: margin,
    y: y - tableHeaderHeight,
    width: contentWidth,
    height: tableHeaderHeight,
    color: darkNavy,
  });

  page.drawText("ITEM & DESCRIPTION", {
    x: margin + 12,
    y: y - 15,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("QTY", {
    x: margin + 320,
    y: y - 15,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("UNIT PRICE", {
    x: margin + 375,
    y: y - 15,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("TOTAL", {
    x: width - margin - 50,
    y: y - 15,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  y -= tableHeaderHeight;

  // Item Row
  const rowHeight = 48;
  page.drawRectangle({
    x: margin,
    y: y - rowHeight,
    width: contentWidth,
    height: rowHeight,
    color: rgb(1, 1, 1),
    borderColor: borderCard,
    borderWidth: 0.75,
  });

  page.drawText(`${country} - Biometric Review & Photo Processing`, {
    x: margin + 12,
    y: y - 16,
    size: 9.5,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText(
    `AI validation, background correction, high-res digital master (${dimensionsText}), & 6x4" print template.`,
    {
      x: margin + 12,
      y: y - 32,
      size: 7.5,
      font: fontRegular,
      color: slate600,
    }
  );

  page.drawText("1", {
    x: margin + 328,
    y: y - 20,
    size: 9.5,
    font: fontRegular,
    color: darkNavy,
  });

  page.drawText(currencyFormatted, {
    x: margin + 375,
    y: y - 20,
    size: 9.5,
    font: fontRegular,
    color: slate600,
  });

  page.drawText(currencyFormatted, {
    x: width - margin - 60,
    y: y - 20,
    size: 10,
    font: fontBold,
    color: darkNavy,
  });

  y -= rowHeight + 16;

  // 5. Totals Section
  const totalsBoxWidth = 220;
  const totalsBoxX = width - margin - totalsBoxWidth;

  page.drawText("Subtotal:", {
    x: totalsBoxX,
    y: y - 10,
    size: 9,
    font: fontRegular,
    color: slate600,
  });
  page.drawText(currencyFormatted, {
    x: width - margin - 60,
    y: y - 10,
    size: 9.5,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText("Tax (0%):", {
    x: totalsBoxX,
    y: y - 24,
    size: 9,
    font: fontRegular,
    color: slate600,
  });
  page.drawText("Tax Exempt (0.00)", {
    x: width - margin - 85,
    y: y - 24,
    size: 8.5,
    font: fontRegular,
    color: slate600,
  });

  // Total Paid Box
  const totalPaidY = y - 62;
  page.drawRectangle({
    x: totalsBoxX,
    y: totalPaidY,
    width: totalsBoxWidth,
    height: 30,
    color: lightGreen,
    borderColor: borderGreen,
    borderWidth: 1,
  });

  page.drawText("Total Paid:", {
    x: totalsBoxX + 10,
    y: totalPaidY + 10,
    size: 10.5,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText(currencyFormatted, {
    x: width - margin - 80,
    y: totalPaidY + 10,
    size: 12,
    font: fontBold,
    color: emeraldGreen,
  });

  y = totalPaidY - 30;

  // 6. Service Fulfillment & Compliance Trail Box
  const trailHeight = 78;
  page.drawRectangle({
    x: margin,
    y: y - trailHeight,
    width: contentWidth,
    height: trailHeight,
    color: bgCard,
    borderColor: borderCard,
    borderWidth: 0.75,
  });

  page.drawText("SERVICE FULFILLMENT & PAYMENT COMPLIANCE TRAIL", {
    x: margin + 12,
    y: y - 15,
    size: 8,
    font: fontBold,
    color: slate600,
  });

  const col1X = margin + 12;
  const col2X = margin + 175;
  const col3X = margin + 345;

  // Col 1
  page.drawText(`- Payment: Captured & Verified`, { x: col1X, y: y - 30, size: 7.5, font: fontRegular, color: slate600 });
  page.drawText(`- Ref ID: ${razorpayId}`, { x: col1X, y: y - 42, size: 7, font: fontMono, color: slate600 });
  page.drawText(`- Method: Razorpay Gateway`, { x: col1X, y: y - 54, size: 7.5, font: fontRegular, color: slate600 });

  // Col 2
  page.drawText(`- Specs: Official Standards`, { x: col2X, y: y - 30, size: 7.5, font: fontRegular, color: slate600 });
  page.drawText(`- Size: ${dimensionsText}`, { x: col2X, y: y - 42, size: 7.5, font: fontRegular, color: slate600 });
  page.drawText(`- Background: Corrected`, { x: col2X, y: y - 54, size: 7.5, font: fontRegular, color: slate600 });

  // Col 3
  page.drawText(`- Deliveries: Instant Digital Access`, { x: col3X, y: y - 30, size: 7.5, font: fontRegular, color: slate600 });
  page.drawText(`- Email: Transactional Confirmation`, { x: col3X, y: y - 42, size: 7.5, font: fontRegular, color: slate600 });
  page.drawText(`- Status: Completed & Active`, { x: col3X, y: y - 54, size: 7.5, font: fontRegular, color: slate600 });

  // Compliance Footer Note
  page.drawText(`[OK] Digitally authenticated & verified by ${SITE_NAME} Automated Billing Engine.`, {
    x: margin + 12,
    y: y - 68,
    size: 7.5,
    font: fontBold,
    color: emeraldGreen,
  });

  // 7. Footer Note
  page.drawText(
    `This is a computer-generated tax invoice. For assistance, contact ${PRICING.supportEmail}  |  ${PRICING.siteUrl}`,
    {
      x: margin + 40,
      y: 30,
      size: 7.5,
      font: fontRegular,
      color: slate400,
    }
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
