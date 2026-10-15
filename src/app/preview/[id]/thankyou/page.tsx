"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
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
    <div className="min-h-screen flex flex-col bg-slate-100/60 text-slate-900">
      <Navbar ctaText="Create Another Photo" ctaHref="/passport-size-photo-maker" />

      <main className="flex-1 py-5 sm:py-8 px-3 sm:px-6" id="main-content">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* ========================================================================= */}
          {/* COMPACT TOP SUCCESS HEADER */}
          {/* ========================================================================= */}
          <div className="bg-white border border-emerald-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-3">
            
                <div>
                
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                    sized and checked against official <strong>{countryName}</strong> {flag} passport &amp; visa standards.
                  </p>
                </div>
              </div>

              {/* Email Callout */}
              <div className="w-full sm:w-auto inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-700 font-medium">
                <Mail className="w-4 h-4 text-[#4D7C0F] shrink-0" />
                <span className="truncate">
                  Emailed with <strong>Tax Invoice PDF</strong> to: <strong className="text-slate-900">{userEmail}</strong>
                </span>
              </div>
            </div>

            {/* VIP Expert Review Notification Banner (if expert_edit plan) */}
            {activePlanType === "expert_edit" && (
              <div className="mt-3.5 bg-gradient-to-r from-amber-50 to-yellow-50/80 border border-amber-300/80 p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm text-[#713F12]">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <div className="font-black text-[#854D0E] flex items-center gap-1.5 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-[#CA8A04] shrink-0" />
                    <span>VIP Expert Manual Review &amp; Edit Included ({expertPricing.amountFormatted})</span>
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700" />
                    <span>⚡ Guaranteed Delivery: &lt; 20 Minutes</span>
                  </span>
                </div>
                <p className="leading-relaxed text-[11.5px] sm:text-xs text-amber-900/90 font-medium">
                  Our human passport photo editors have received your original photo for <strong>{countryName}</strong>. They are currently performing precision shadow removal, contrast calibration, and edge refinement. Your human-verified photo will also be delivered to <strong>{userEmail}</strong> within <strong>20 minutes</strong>.
                </p>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* MAIN STUDIO: Single Download vs 4×6″ Multi-Photo Print Sheet Generator */}
          {/* ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
            {/* Studio Tab Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("single")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "single"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Single Digital Photo (300 DPI)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sheet")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "sheet"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>Print Sheet Studio (4×6″ / A4)</span>
              </button>
            </div>

            {/* Tab 1: Single High-Resolution Master Photo */}
            {activeTab === "single" && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center border border-slate-200 text-center">
                  <div className="inline-block relative rounded-xl overflow-hidden shadow-md border-2 border-white bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeImageSource}
                      alt={`${countryName} Verified Master Photo`}
                      className="max-h-64 sm:max-h-80 w-auto object-contain rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-[#4D7C0F] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      300 DPI &bull; ICAO Validated
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold mt-3">
                    {countryName} Official Dimensions: <span className="font-mono text-slate-900 font-bold">{dimensions} px</span>
                  </p>
                </div>

                {/* Single Download Action Button */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadSingle}
                    disabled={downloading}
                    className="w-full inline-flex items-center justify-center gap-2.5 bg-[#4D7C0F] hover:bg-[#3F650C] !text-white text-white font-bold text-sm sm:text-base py-4 rounded-xl transition-all shadow-md focus-ring cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span>{downloading ? "Preparing High-Res Download…" : "Download Single Photo (300 DPI JPEG)"}</span>
                  </button>

                  {paymentId && (
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                      <a
                        href={`/api/invoices/${paymentId}?format=pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[#4D7C0F]" />
                        <span>Download Tax Invoice (PDF)</span>
                      </a>

                      <a
                        href={`/api/invoices/${paymentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-medium transition-colors"
                      >
                        <span>View Web Invoice</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Interactive Print Sheet Studio (Pre-loaded with paid photo) */}
            {activeTab === "sheet" && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 stroke-[3] shrink-0" />
                    <span>Your verified photo has been automatically loaded into the print sheet builder.</span>
                  </div>
                  <span className="font-bold text-emerald-800 shrink-0">4×6″ Standard Ready</span>
                </div>

                {/* Embedded Full-Featured Print Sheet Generator */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  <PrintTemplateGenerator
                    initialImageUrl={activeImageSource}
                    initialPaperSize="4x6"
                    initialPhotoStandard={dimensions.includes("600") ? "2x2" : "35x45"}
                    showInstructions={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Footer: Create Photo for Another Person */}
          <div className="flex justify-center pt-2">
            <Link
              href="/passport-size-photo-maker"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs sm:text-sm py-2.5 px-5 rounded-xl transition-all shadow-xs text-center cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#4D7C0F]" />
              <span>Create Photo for Another Person</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
