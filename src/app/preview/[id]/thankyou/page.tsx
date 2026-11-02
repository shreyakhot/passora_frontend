"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Download,
  Printer,
  FileText,
  Mail,
  ExternalLink,
  Sparkles,
  Upload,
  Check,
  Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrintTemplateGenerator from "@/components/PrintTemplateGenerator";
import type { PassportProcessResult } from "@/lib/passport-api";
import { getPlanPricing } from "@/lib/config/pricing";
import { resultImageUrl } from "@/lib/storage/result-urls";
import {
  DEFAULT_COUNTRY,
  countryFlag,
  getCountryByCode,
  getCountryByName,
} from "@/config/countries";

interface StoredPassportResult extends PassportProcessResult {
  country_code?: string;
  country_name?: string;
  target_dimensions?: string;
  document_type?: string;
  original_preview?: string;
  timestamp?: number;
}

interface StoredPaymentInfo {
  paymentId: string;
  downloadToken?: string;
  invoiceNumber?: string;
  status: "paid" | "pending" | "failed";
  email: string;
  paidAt?: string;
  planType?: "standard" | "expert_edit";
}

function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/** The "latest" entry only stands in for this result if it is the same photo. */
function latestIfSameResult(raw: string | null, resultId: string): string | null {
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as { result_id?: string }).result_id === resultId ? raw : null;
  } catch {
    return null;
  }
}

function getRawStoredResult(resultId: string): string {
  if (typeof window === "undefined") return "";
  try {
    return (
      sessionStorage.getItem(`photogovt_${resultId}`) ||
      localStorage.getItem(`photogovt_${resultId}`) ||
      latestIfSameResult(sessionStorage.getItem("photogovt_latest"), resultId) ||
      latestIfSameResult(localStorage.getItem("photogovt_latest"), resultId) ||
      ""
    );
  } catch {
    return "";
  }
}

function getStoredPayment(resultId: string): StoredPaymentInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(`photogovt_paid_${resultId}`) ||
      localStorage.getItem(`photogovt_paid_${resultId}`);
    return raw ? (JSON.parse(raw) as StoredPaymentInfo) : null;
  } catch {
    return null;
  }
}

function getCountryFlag(countryCode?: string, countryName?: string): string {
  const code = countryCode || getCountryByName(countryName || "")?.country_code || "";
  return code ? countryFlag(code) : "📄";
}

export default function ThankYouDownloadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = params?.id;
  const resultId = (Array.isArray(rawId) ? rawId[0] : (rawId as string)) || "result";
  const queryPaymentId = searchParams.get("paymentId") || "";

  const rawData = useSyncExternalStore(
    subscribeToStorage,
    () => getRawStoredResult(resultId),
    () => ""
  );

  const data = useMemo<StoredPassportResult | null>(() => {
    if (!rawData) return null;
    try {
      return JSON.parse(rawData) as StoredPassportResult;
    } catch {
      return null;
    }
  }, [rawData]);

  const [activeTab, setActiveTab] = useState<"single" | "sheet">("single");
  const [downloading, setDownloading] = useState(false);
  const [paymentState, setPaymentState] = useState<StoredPaymentInfo | null>(() => getStoredPayment(resultId));
  const [, setIsLoadingStatus] = useState(false);

  const countryName = data?.country_name || DEFAULT_COUNTRY.country_name;
  const countryCode = data?.country_code || DEFAULT_COUNTRY.country_code;
  const dimensions =
    data?.dimensions ||
    data?.target_dimensions ||
    getCountryByCode(countryCode)?.dimensions ||
    DEFAULT_COUNTRY.dimensions;
  const flag = getCountryFlag(countryCode, countryName);

  const fullImageUrl =
    data?.image_url ||
    resultImageUrl(resultId, "photo");

  const previewUrl =
    data?.preview_url ||
    data?.image_url ||
    resultImageUrl(resultId, "preview");

  // Active high-resolution image to download/tile
  const activeImageSource = fullImageUrl || previewUrl;

  // If token is missing, fetch status from server
  useEffect(() => {
    const paymentIdToFetch = paymentState?.paymentId || queryPaymentId;
    if (!paymentIdToFetch || (paymentState?.downloadToken && paymentState.status === "paid")) {
      return;
    }

    let isMounted = true;
    async function loadStatus() {
      setIsLoadingStatus(true);
      try {
        const res = await fetch(`/api/payments/status/${paymentIdToFetch}`);
        const resData = await res.json();
        if (isMounted && resData.success) {
          const updated: StoredPaymentInfo = {
            paymentId: resData.paymentId,
            downloadToken: resData.downloadToken,
            status: resData.status,
            email: paymentState?.email || resData.email || "",
            paidAt: resData.paidAt || new Date().toISOString(),
            planType: resData.planType || paymentState?.planType || "standard",
          };
          setPaymentState(updated);
          try {
            sessionStorage.setItem(`photogovt_paid_${resultId}`, JSON.stringify(updated));
            localStorage.setItem(`photogovt_paid_${resultId}`, JSON.stringify(updated));
          } catch {}
        }
      } catch (err) {
        console.error("Failed to fetch payment status:", err);
      } finally {
        if (isMounted) {
          setIsLoadingStatus(false);
        }
      }
    }
    loadStatus();

    return () => {
      isMounted = false;
    };
  }, [queryPaymentId, paymentState?.paymentId, paymentState?.downloadToken, paymentState?.status, paymentState?.email, paymentState?.planType, resultId]);

  /**
   * Handle Single Photo Download
   */
  const handleDownloadSingle = async () => {
    setDownloading(true);
    try {
      if (paymentState?.downloadToken) {
        const url = `/api/download/${paymentState.downloadToken}`;
        const a = document.createElement("a");
        a.href = url;
        a.download = `passport-photo-${countryCode.toLowerCase()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const targetUrl = fullImageUrl || previewUrl;
      if (!targetUrl) return;

      const res = await fetch(targetUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `passport-photo-${countryCode.toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Single download error:", err);
      if (fullImageUrl) window.open(fullImageUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const paymentId = paymentState?.paymentId || queryPaymentId;
  const userEmail = paymentState?.email || "your email";
  const activePlanType = paymentState?.planType || "standard";
  const expertPricing = getPlanPricing("expert_edit");

  return (
    <div className="min-h-screen flex flex-col bg-ink-50 text-ink-950">
      <Navbar ctaText="Create Another Photo" ctaHref="/passport-size-photo-maker" />

      <main className="relative flex-1 overflow-hidden" id="main-content">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-dots [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
        <div
          className={`pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full blur-3xl ${
            paymentState?.status === "failed"
              ? "bg-red-200/40"
              : paymentState?.status === "pending"
                ? "bg-amber-200/40"
                : "bg-emerald-200/40"
          }`}
          aria-hidden="true"
        />

        <div className="container-narrow relative max-w-4xl space-y-5 py-8 sm:space-y-6 sm:py-12">
          {/* ========================================================================= */}
          {/* SUCCESS / STATUS HEADER */}
          {/* ========================================================================= */}
          <section className="surface p-6 shadow-soft animate-fade-in sm:p-8" aria-labelledby="thankyou-heading">
            <div className="flex flex-col items-center text-center">
              {paymentState?.status === "failed" ? (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700 ring-8 ring-red-50" aria-hidden="true">
                  <AlertCircle className="h-8 w-8" />
                </span>
              ) : paymentState?.status === "pending" ? (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-8 ring-amber-50" aria-hidden="true">
                  <Clock className="h-8 w-8" />
                </span>
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50" aria-hidden="true">
                  <Check className="h-8 w-8" strokeWidth={3} />
                </span>
              )}

              <h1 id="thankyou-heading" className="mt-6 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
                {paymentState?.status === "failed"
                  ? "We couldn’t confirm your payment"
                  : paymentState?.status === "pending"
                    ? "Confirming your payment"
                    : "Thank you! Your photo is ready"}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-600 sm:text-base">
                Sized and checked against the published <strong className="text-ink-950">{countryName}</strong> {flag}{" "}
                passport &amp; visa photo rules.
              </p>
            </div>

            {paymentState?.status === "pending" && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="status">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                <p>
                  Your payment is still being confirmed. This usually takes a moment, so refresh this page shortly. Your
                  download link is also emailed to <strong>{userEmail}</strong> once payment is confirmed.
                </p>
              </div>
            )}

            {paymentState?.status === "failed" && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                <p>
                  We couldn’t confirm this payment. If you were charged,{" "}
                  <Link href="/contact-us" className="font-bold underline underline-offset-2 hover:text-red-950">
                    contact support
                  </Link>
                  {paymentId ? (
                    <>
                      {" "}and include your payment ID <span className="font-mono font-semibold">{paymentId}</span>.
                    </>
                  ) : (
                    "."
                  )}
                </p>
              </div>
            )}

            {/* Order summary */}
            <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 text-left sm:grid-cols-4">
              <div className="bg-white p-4">
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">Country</dt>
                <dd className="mt-1 flex items-center gap-1.5 truncate text-sm font-bold text-ink-950">
                  <span aria-hidden="true">{flag}</span>
                  <span className="truncate">{countryName}</span>
                </dd>
              </div>
              <div className="bg-white p-4">
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">Photo size</dt>
                <dd className="mt-1 font-mono text-sm font-bold text-ink-950">{dimensions} px</dd>
              </div>
              <div className="bg-white p-4">
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">Plan</dt>
                <dd className="mt-1 truncate text-sm font-bold text-ink-950">{getPlanPricing(activePlanType).title}</dd>
              </div>
              <div className="bg-white p-4">
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">Payment ID</dt>
                <dd className="mt-1 truncate font-mono text-sm font-semibold text-ink-950" title={paymentId || undefined}>
                  {paymentId || "—"}
                </dd>
              </div>
            </dl>

            {/* Email Callout */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-700">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700" aria-hidden="true">
                <Mail className="h-4 w-4" />
              </span>
              <span className="min-w-0 truncate">
                Emailed with <strong className="text-ink-950">Tax Invoice PDF</strong> to:{" "}
                <strong className="text-ink-950">{userEmail}</strong>
              </span>
            </div>

            {/* Expert Review Notification Banner (if expert_edit plan) */}
            {activePlanType === "expert_edit" && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-bold text-amber-950">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                    <span>Expert Review &amp; Edit Included ({expertPricing.amountFormatted})</span>
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-bold text-amber-900">
                    <Clock className="h-3 w-3 text-amber-700" aria-hidden="true" />
                    <span>Usually within 20 minutes</span>
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900 sm:text-sm">
                  Our photo editors have received your original photo for <strong>{countryName}</strong>. They are
                  refining shadows, contrast and edges, and will email the reviewed photo to <strong>{userEmail}</strong>,
                  usually within <strong>20 minutes</strong>.
                </p>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* MAIN STUDIO: Single Download vs 4×6″ Multi-Photo Print Sheet Generator */}
          {/* ========================================================================= */}
          <section className="surface p-4 shadow-soft sm:p-6" aria-label="Download your photo">
            {/* Studio Tab Switcher */}
            <div className="mb-5 flex gap-1 rounded-2xl bg-ink-100 p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("single")}
                aria-pressed={activeTab === "single"}
                className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all focus-ring sm:text-sm ${
                  activeTab === "single"
                    ? "bg-white text-ink-950 shadow-soft"
                    : "text-ink-600 hover:text-ink-950"
                }`}
              >
                <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Single Digital Photo (300 DPI)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sheet")}
                aria-pressed={activeTab === "sheet"}
                className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all focus-ring sm:text-sm ${
                  activeTab === "sheet"
                    ? "bg-white text-ink-950 shadow-soft"
                    : "text-ink-600 hover:text-ink-950"
                }`}
              >
                <Printer className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Print Sheet Studio (4×6″ / A4)</span>
              </button>
            </div>

            {/* Tab 1: Single High-Resolution Master Photo */}
            {activeTab === "single" && (
              <div className="grid items-center gap-6 md:grid-cols-2 md:gap-8 animate-fade-in">
                <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 p-5 text-center sm:p-8">
                  <div className="pointer-events-none absolute inset-0 bg-dots" aria-hidden="true" />
                  <div className="relative inline-block overflow-hidden rounded-xl border-4 border-white bg-white shadow-lift">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeImageSource}
                      alt={`${countryName} Verified Master Photo`}
                      className="max-h-64 w-auto rounded-lg object-contain sm:max-h-80"
                    />
                    <div className="absolute right-2 top-2 rounded-full bg-ink-950/85 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      300 DPI
                    </div>
                  </div>
                  <p className="relative mt-4 text-xs font-semibold text-ink-600">
                    {countryName} photo size: <span className="font-mono font-bold text-ink-950">{dimensions} px</span>
                  </p>
                </div>

                {/* Single Download Action Button */}
                <div>
                  <h2 className="text-xl font-extrabold text-ink-950 sm:text-2xl">Download your photo</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    A high-resolution JPEG at the {countryName} photo size, ready to upload with an online application.
                    Need prints? Switch to the Print Sheet Studio tab.
                  </p>

                  <button
                    type="button"
                    onClick={handleDownloadSingle}
                    disabled={downloading}
                    className="btn-brand btn-lg mt-6 w-full focus-ring"
                  >
                    <Download className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{downloading ? "Preparing High-Res Download…" : "Download Single Photo (300 DPI JPEG)"}</span>
                  </button>

                  {paymentId && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4 text-sm">
                      <a
                        href={`/api/invoices/${paymentId}?format=pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline-brand focus-ring"
                      >
                        <FileText className="h-4 w-4 text-brand-600" aria-hidden="true" />
                        <span>Download Tax Invoice (PDF)</span>
                      </a>

                      <a
                        href={`/api/invoices/${paymentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 font-semibold text-ink-600 transition-colors hover:text-brand-700 focus-ring"
                      >
                        <span>View Web Invoice</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Interactive Print Sheet Studio (Pre-loaded with paid photo) */}
            {activeTab === "sheet" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span>Your verified photo has been automatically loaded into the print sheet builder.</span>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                    4×6″ Standard Ready
                  </span>
                </div>

                {/* Embedded Full-Featured Print Sheet Generator */}
                <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-50/60">
                  <PrintTemplateGenerator
                    initialImageUrl={activeImageSource}
                    initialPaperSize="4x6"
                    initialPhotoStandard={dimensions.includes("600") ? "2x2" : "35x45"}
                    showInstructions={false}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Action Footer: Create Photo for Another Person */}
          <div className="flex justify-center pt-2">
            <Link href="/passport-size-photo-maker" className="btn-outline-brand focus-ring">
              <Upload className="h-4 w-4 text-brand-600" aria-hidden="true" />
              <span>Create Photo for Another Person</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
