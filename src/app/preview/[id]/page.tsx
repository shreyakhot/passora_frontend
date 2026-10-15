"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Check,
  Download,
  AlertCircle,
  Upload,
  Lock,
  Receipt,
  ExternalLink,
  ArrowRight,
  Shield,
  RotateCcw,
  Star,
  X,
  ZoomIn,
  Eye,
  Mail,
  Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { PassportProcessResult } from "@/lib/passport-api";
import { PRICING, getPlanPricing, type PlanType } from "@/lib/config/pricing";
import { resultImageUrl } from "@/lib/storage/result-urls";
import { LOGO_URL, SUPPORT_EMAIL } from "@/lib/site";
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
  status: "paid" | "pending" | "failed";
  email: string;
  paidAt?: string;
  planType?: PlanType;
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

function saveStoredPayment(resultId: string, info: StoredPaymentInfo) {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(info);
    sessionStorage.setItem(`photogovt_paid_${resultId}`, json);
    localStorage.setItem(`photogovt_paid_${resultId}`, json);
  } catch (e) {
    console.error("Failed to save payment info locally:", e);
  }
}

/**
 * Dynamically load Razorpay checkout script
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function getCountryFlag(countryCode?: string, countryName?: string): string {
  const code = countryCode || getCountryByName(countryName || "")?.country_code || "";
  return code ? countryFlag(code) : "📄";
}

const METRIC_FIXES = [
  { key: "gov12", label: "ICAO Standard photo" },
  { key: "gov", label: "Government compliant photo" },
  { key: "gov5", label: "AI biometric validation" },
  { key: "gov2", label: "Acceptance guarantee" },
  { key: "gov0", label: "Refund if rejected" },
  { key: "gov3", label: "Instant download + print sheet" },
];

const BEFORE_AFTER_PAIRS = [
  {
    title: "Wall Shadow Removal & Background Calibration",
    beforeImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786628280/before_uk_f24dre.jpg",
    afterImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786627664/eu_pixpassport.com_ppfhlr.jpg",
    beforeTag: "Original: Wall Shadow & Yellow Tint",
    afterTag: "Expert Fixed: Plain White Background",
  },
  {
    title: "Biometric Eye Level & Face Centering",
    beforeImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786630383/1000383324_bxx77h.jpg",
    afterImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786630498/597e95e4-676d-41dd-be79-c45be7e07b04_photo_zm53xt.jpg",
    beforeTag: "Original: Head Tilted & Off-Center",
    afterTag: "Expert Fixed: Aligned Biometric Crop",
  },
  {
    title: "Glare & Reflection Reduction on Glasses",
    beforeImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786628395/before_us_phel7i.jpg",
    afterImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786628788/ulape_c0dexm.jpg",
    beforeTag: "Original: Harsh Lighting & Glare",
    afterTag: "Expert Fixed: Clear Biometric Visibility",
  },
  {
    title: "Head Tilt Correction & Alignment",
    beforeImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786628855/bef_d5mwgy.jpg",
    afterImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786628853/ff150d13-c01a-418a-8e26-9483f3a7907c_photo_pttp0l.jpg",
    beforeTag: "Original: Tilted Angle & Exposure",
    afterTag: "Expert Fixed: Perfectly Straight Head",
  },
  {
    title: "Lighting & Contrast Balancing",
    beforeImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786629026/1000378632_1_g13xko.jpg",
    afterImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786629107/ebec124b-38dd-44b9-8b2b-5a11972d15c2_photo_ukzvse.jpg",
    beforeTag: "Original: Dim Lighting & Underexposed",
    afterTag: "Expert Fixed: Studio-Quality Illumination",
  },
  {
    title: "Background Uniformity & Noise Removal",
    beforeImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786629172/Minimal_studio_portrait_of_young_man_wpjxdp.png",
    afterImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786629173/file_ge84gv_fhqvi2.png",
    beforeTag: "Original: Textured Background",
    afterTag: "Expert Fixed: Pure Plain White Surface",
  },
  {
    title: "Official Passport Aspect Ratio & Crop",
    beforeImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786629405/A_passport_e4y2u3.jpg",
    afterImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786629172/pix_passport_y4bjki.jpg",
    beforeTag: "Original: Incorrect Crop Ratio",
    afterTag: "Expert Fixed: Exact Embassy Dimensions",
  },
  {
    title: "Color Balance & Tone Normalization",
    beforeImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786629541/1000379376_1_d2ibas.jpg",
    afterImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786629817/cropped-tttt_vpemzs.jpg",
    beforeTag: "Original: Color Cast & Shadows",
    afterTag: "Expert Fixed: Natural Skin Tone",
  },
  {
    title: "Shoulder Leveling & Posture Balance",
    beforeImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786629895/1000368998_1_mmnu84.jpg",
    afterImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786629988/98411d2e-09fd-4d93-9fa7-cbe7e6db2460_photo_qrmwty.jpg",
    beforeTag: "Original: Uneven Shoulder Height",
    afterTag: "Expert Fixed: Balanced Posture",
  },
  {
    title: "Full ICAO Standard Compliance Verification",
    beforeImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786630292/1000383509_ffkmf2.jpg",
    afterImg:
      "https://res.cloudinary.com/dipzpwbbk/image/upload/v1786630114/3606955d-8470-4d49-a65d-7425be0b182f_photo_qsbsbu.jpg",
    beforeTag: "Original: Non-Standard Photo",
    afterTag: "Expert Fixed: Checked Against Guidance",
  },
];

export default function PassportPhotoPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const resultId = (Array.isArray(rawId) ? rawId[0] : (rawId as string)) || "result";

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

  const [paymentState, setPaymentState] = useState<StoredPaymentInfo | null>(() => {
    if (typeof window === "undefined") return null;
    return getStoredPayment(resultId);
  });
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(() => {
    if (typeof window === "undefined") return "standard";
    const existing = getStoredPayment(resultId);
    return existing?.planType || "standard";
  });
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [email, setEmail] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const existing = getStoredPayment(resultId);
    return existing?.email || "";
  });
  const [emailError, setEmailError] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalEmailError, setModalEmailError] = useState("");

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Handle ESC key to close open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomOpen(false);
        setIsFixModalOpen(false);
        setIsEmailModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const countryName = data?.country_name || DEFAULT_COUNTRY.country_name;
  const countryCode = data?.country_code || DEFAULT_COUNTRY.country_code;
  const dimensions =
    data?.dimensions ||
    data?.target_dimensions ||
    getCountryByCode(countryCode)?.dimensions ||
    DEFAULT_COUNTRY.dimensions;
  const originalPreview = data?.original_preview;
  const flag = getCountryFlag(countryCode, countryName);

  // Full-res clean image (unlocked only after payment)
  const fullImageUrl =
    data?.image_url ||
    resultImageUrl(resultId, "photo");

  // Preview image
  const previewUrl =
    data?.preview_url ||
    data?.image_url ||
    resultImageUrl(resultId, "preview");

  const isPaid = paymentState?.status === "paid";
  const standardPricing = getPlanPricing("standard");
  const expertPricing = getPlanPricing("expert_edit");

  const isValidEmail = (val: string): boolean => {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return false;
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed);
  };

  const validateInlineEmail = (val: string): boolean => {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) {
      setEmailError("Please enter your email address to receive your photos.");
      return false;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) {
      validateInlineEmail(val);
    }
  };

  /**
   * Initiate Razorpay Payment with selected plan
   */
  const handleInitiatePayment = async (planOverride?: PlanType, emailOverride?: string) => {
    const activePlan = planOverride || selectedPlan;
    const targetEmail = (emailOverride || email).trim().toLowerCase();

    setPaymentError("");
    if (!isValidEmail(targetEmail)) {
      setModalEmail(targetEmail);
      setModalEmailError("Please enter a valid email address.");
      setIsEmailModalOpen(true);
      return;
    }

    if (!fullImageUrl && !previewUrl) {
      setPaymentError("Image session data missing. Please re-upload your photo.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Load Razorpay checkout script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load payment gateway. Please check your internet connection.");
      }

      // 2. Create order on server
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          resultId,
          imageUrl: fullImageUrl || previewUrl,
          previewUrl: previewUrl || fullImageUrl,
          originalPreview: originalPreview || undefined,
          planType: activePlan,
          dimensions,
          format: data?.format || "JPEG",
          sizeKb: data?.size_kb || 150,
          countryCode,
          countryName,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initiate payment. Please try again.");
      }

      const { paymentId, razorpayOrderId, amount, currency, keyId } = orderData;

      // 3. Open Razorpay Checkout Modal
      const RazorpayConstructor = (window as unknown as {
        Razorpay: new (options: Record<string, unknown>) => {
          open: () => void;
          on: (event: string, callback: (resp: unknown) => void) => void;
        };
      }).Razorpay;

      const rzp = new RazorpayConstructor({
        key: keyId,
        amount,
        currency,
        name: PRICING.businessName,
        description:
          activePlan === "expert_edit"
            ? `${countryName} Passport Photo + Expert Manual Edit & Review`
            : `${countryName} Biometric Passport Photo & Print Sheet`,
        image: LOGO_URL,
        order_id: razorpayOrderId,
        prefill: {
          email: targetEmail,
        },
        notes: {
          paymentId,
          resultId,
          planType: activePlan,
        },
        theme: {
          color: activePlan === "expert_edit" ? "#65A30D" : "#0F172A",
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 4. Verify payment on server
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            // 5. Obtain download token directly from verification response
            let downloadToken = verifyData.downloadToken || "";
            if (!downloadToken) {
              try {
                const statusRes = await fetch(`/api/payments/status/${paymentId}`);
                const statusData = await statusRes.json();
                if (statusData.success && statusData.downloadToken) {
                  downloadToken = statusData.downloadToken;
                }
              } catch {
                // Polling fallback
              }
            }

            const paidInfo: StoredPaymentInfo = {
              paymentId,
              downloadToken,
              status: "paid",
              email: targetEmail,
              paidAt: new Date().toISOString(),
              planType: activePlan,
            };

            saveStoredPayment(resultId, paidInfo);
            setPaymentState(paidInfo);

            // Redirect customer to Thank You & Download Studio
            router.push(`/preview/${resultId}/thankyou?paymentId=${paymentId}`);
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            setPaymentError(
              verifyErr instanceof Error
                ? verifyErr.message
                : "Payment was charged but verification had an issue. Please contact support."
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
      });

      rzp.on("payment.failed", (resp: unknown) => {
        setIsProcessingPayment(false);
        const errDesc = (resp as { error?: { description?: string } })?.error?.description;
        setPaymentError(errDesc || "Payment was not completed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setIsProcessingPayment(false);
      setPaymentError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
    }
  };

  /**
   * Main CTA Click Handler:
   * If email is not entered or invalid, open the Email Capture Modal.
   * If valid, immediately proceed to Razorpay checkout.
   */
  const handleMainCtaClick = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !isValidEmail(trimmed)) {
      setModalEmail(email);
      setModalEmailError("");
      setIsEmailModalOpen(true);
      return;
    }
    handleInitiatePayment(selectedPlan, trimmed);
  };

  /**
   * Modal Email Submit Handler:
   * Validates email, saves it, closes modal, and initiates Razorpay.
   */
  const handleModalEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = modalEmail.trim().toLowerCase();
    if (!trimmed) {
      setModalEmailError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setModalEmailError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }
    setEmail(trimmed);
    setEmailError("");
    setIsEmailModalOpen(false);
    handleInitiatePayment(selectedPlan, trimmed);
  };

  /**
   * Handle downloading single high-res photo or sheet
   */
  const handleDownload = async (type: "single" | "sheet") => {
    setDownloading(true);
    try {
      if (isPaid && paymentState?.downloadToken && type === "single") {
        // Protected endpoint for paid customers
        const url = `/api/download/${paymentState.downloadToken}`;
        const a = document.createElement("a");
        a.href = url;
        a.download = `passport-photo-${countryCode.toLowerCase()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const targetUrl = type === "single" ? (fullImageUrl || previewUrl) : previewUrl;
      if (!targetUrl) return;

      if (targetUrl.startsWith("data:") || targetUrl.startsWith("blob:")) {
        const link = document.createElement("a");
        link.href = targetUrl;
        link.download = `passport-${type}-${countryCode.toLowerCase()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const res = await fetch(targetUrl);
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `passport-${type}-${countryCode.toLowerCase()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error("Download failed:", err);
      const fallbackUrl = type === "single" ? fullImageUrl : previewUrl;
      if (fallbackUrl) window.open(fallbackUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200/40 flex flex-col">
      <Navbar ctaText="Create New Photo" ctaHref="/passport-size-photo-maker" />

      {/* Main container with bottom padding on mobile for sticky payment bar */}
      <main className="flex-1 flex items-start justify-center px-3.5 sm:px-4 py-5 sm:py-8 pb-40 lg:pb-8 text-slate-900" id="main-content">
        <div className="w-full max-w-6xl">
          {!fullImageUrl && !previewUrl ? (
            /* Empty or Expired Session State */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
                Photo Session Not Found
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 font-medium">
                No active photo preview found for ID:{" "}
                <span className="font-mono font-semibold text-slate-900 break-all">{resultId}</span>.
                Please upload your photo to process an official verified result.
              </p>
              <Link
                href="/passport-size-photo-maker"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] !text-white text-white font-bold text-sm sm:text-base py-3.5 rounded-xl transition-colors text-center shadow-xs focus-ring"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span>Upload New Photo</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Header Title & Subtitle */}
              <div className="mb-4 text-center lg:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Your <span className="text-lime-600">ID Photo</span> Is Ready{" "}
                  <span className="inline-block text-xl sm:text-2xl" aria-hidden="true">{flag}</span> {countryName}
                </h1>
                <div className="flex items-center justify-center lg:justify-start gap-2 mt-2 flex-wrap text-center lg:text-left">
                  {/* 24*7 Mail Support Badge */}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=Support%20Request%20-%20Photo%20Session%20${encodeURIComponent(resultId)}`}
                    className="inline-flex items-center gap-1.5 bg-lime-50 hover:bg-lime-100 text-lime-900 border border-lime-300 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-colors shadow-2xs group"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                    <Mail className="w-3.5 h-3.5 text-lime-700 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    <span>24/7 Email Support: <span className="underline font-extrabold text-lime-950">{SUPPORT_EMAIL}</span></span>
                  </a>

                  <p className="text-[11px] sm:text-[12px] text-slate-500 font-semibold flex items-center gap-1 flex-wrap justify-center lg:justify-start">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Acceptance Guarantee &bull; Refund if Rejected</span>
                    <span className="ml-1 font-bold text-slate-700 inline-flex items-center gap-1">
                      <span>{flag}</span> {countryName} Compliant
                    </span>
                  </p>
                </div>
              </div>

              {/* 2-Column Responsive Layout */}
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-start">
                {/* ========================================================================= */}
                {/* LEFT COLUMN: Photo Display & "Your Photo Meets Official Requirements" Card */}
                {/* ========================================================================= */}
                <div className="w-full lg:w-[60%] space-y-4">
                  {/* Photo Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    {/* Top Bar */}
                    <div className="px-4 sm:px-5 pt-3.5 sm:pt-4 pb-3 flex items-center justify-between border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{flag}</span>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {countryName} Official Photo ({dimensions} px)
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 sm:py-1 shadow-2xs shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span className="text-[10px] sm:text-[11px] font-bold">Verified Compliant</span>
                      </div>
                    </div>

                    {/* Photo Container */}
                    <div
                      className="relative cursor-zoom-in group mx-3 sm:mx-5 my-3 sm:my-4 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center select-none"
                      onClick={() => setIsZoomOpen(true)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setIsZoomOpen(true);
                        }
                      }}
                      aria-label="Click to enlarge passport photo preview"
                      style={{ minHeight: 240 }}
                    >
                      {/* Clean Preview Image without intrusive obstructing watermark blocks */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={isPaid ? (fullImageUrl || previewUrl) : previewUrl}
                        alt={`${countryName} Passport Photo Preview`}
                        className="max-h-[300px] sm:max-h-[380px] w-auto max-w-full object-contain select-none pointer-events-none block rounded-md"
                        draggable={false}
                        onContextMenu={(e) => !isPaid && e.preventDefault()}
                      />

                      {/* Subtle Glass Tag (Non-obstructive) */}
                      <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-slate-900/80 text-white text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-sm pointer-events-none">
                        <Eye className="w-3 h-3 text-lime-400" />
                        <span>Official Preview</span>
                      </div>

                      {/* Hover Zoom Hint */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-full px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 shadow-md flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <ZoomIn className="w-3.5 h-3.5 text-slate-700" />
                          <span>Click to Zoom</span>
                        </div>
                      </div>
                    </div>

                    {/* Post-Payment Action Buttons */}
                    {isPaid && (
                      <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 space-y-3">
                        <button
                          type="button"
                          onClick={() => handleDownload("single")}
                          disabled={downloading}
                          className="w-full inline-flex items-center justify-center gap-2 bg-[#4D7C0F] hover:bg-[#3F650C] !text-white text-white font-bold text-sm py-3.5 rounded-xl transition-all text-center shadow-xs focus-ring cursor-pointer"
                          style={{ color: "#ffffff" }}
                        >
                          <Download className="w-4 h-4 text-white" aria-hidden="true" />
                          <span>{downloading ? "Preparing High-Res Download…" : "Download Single Photo (300 DPI)"}</span>
                        </button>

                        {paymentState?.paymentId && (
                          <div className="flex justify-end pt-1">
                            <a
                              href={`/api/invoices/${paymentState.paymentId}?format=pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                              <span>Download Tax Invoice (PDF)</span>
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* "Your Photo Meets Official Requirements" Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-3.5 sm:mb-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-lime-100 rounded-lg flex items-center justify-center text-lime-700 shrink-0">
                        <Camera className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>
                      <p className="text-sm sm:text-base font-bold text-slate-900">
                        Your Photo Meets Official Requirements
                      </p>
                    </div>

                    <div className="space-y-0">
                      {METRIC_FIXES.map((metric) => (
                        <div
                          key={metric.key}
                          className="flex items-center gap-2.5 py-2 sm:py-2.5 border-b border-slate-100 last:border-0"
                        >
                          <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-lime-100 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-lime-700 stroke-[3]" />
                          </div>
                          <span className="text-[12px] sm:text-[13px] text-slate-700 font-medium">
                            {metric.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Highlight Box */}
                    <div className="mt-3.5 sm:mt-4 rounded-xl bg-lime-50 border border-lime-200 px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-lime-600 shrink-0 fill-lime-300" />
                      <Check className="w-3.5 h-3.5 text-lime-700 stroke-[3] shrink-0" />
                      <p className="text-[11px] sm:text-[11.5px] text-lime-800 font-semibold leading-relaxed">
                        Background professionally corrected to official requirements
                      </p>
                    </div>
                  </div>

                  {/* Dedicated 24/7 Mail Support Card */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-700/60 relative overflow-hidden">
                    <div className="flex items-start gap-3.5 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-lime-400/20 border border-lime-400/30 text-lime-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                            24/7 Dedicated Email Support
                          </h3>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10.5px] font-bold border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live 24×7
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                          Questions about embassy requirements, print sizing, or need custom assistance with your photo? Our biometric support team is ready to help 24 hours a day, 7 days a week.
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <a
                            href={`mailto:${SUPPORT_EMAIL}?subject=Passport%20Photo%20Support%20-%20Session%20${encodeURIComponent(resultId)}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs transition-colors shadow-xs cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email {SUPPORT_EMAIL}</span>
                          </a>
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-lime-400" />
                            Average reply &lt;15 mins
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* RIGHT COLUMN: Order Summary & Plan Choices */}
                {/* ========================================================================= */}
                <div className="w-full lg:w-[40%] space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs lg:sticky lg:top-6">
                    <div className="p-4 sm:p-6">
                      {!isPaid ? (
                        <div className="space-y-4">
                          {/* Top Heading */}
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              Order Summary &bull; Accepted for {countryName}
                            </p>
                          </div>

                          {/* Plans Selection */}
                          <div className="space-y-3">
                            {/* Plan 1: Standard Pack */}
                            <button
                              type="button"
                              onClick={() => setSelectedPlan("standard")}
                              className={`w-full text-left rounded-xl border-2 p-3.5 sm:p-4 transition-all duration-150 relative cursor-pointer ${
                                selectedPlan === "standard"
                                  ? "border-emerald-500 bg-emerald-50/60 shadow-xs"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="text-sm font-bold text-slate-900">
                                    Standard Pack
                                  </h4>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg sm:text-xl font-black text-slate-900">
                                    {standardPricing.amountFormatted}
                                  </p>
                                </div>
                              </div>
                              <ul className="space-y-1.5">
                                {[
                                  "AI Biometric Check",
                                  "Instant digital download",
                                  "Official 6×4″ print sheet",
                                  "Acceptance guarantee",
                                ].map((f) => (
                                  <li
                                    key={f}
                                    className="flex items-center gap-2 text-[12.5px] sm:text-[13px] text-slate-600 font-medium"
                                  >
                                    <Check
                                      className={`w-3.5 h-3.5 stroke-[3] shrink-0 ${
                                        selectedPlan === "standard"
                                          ? "text-emerald-600"
                                          : "text-slate-300"
                                      }`}
                                    />
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </button>

                            {/* Plan 2: Premium Pack (Expert Review) */}
                            <div
                              onClick={() => setSelectedPlan("expert_edit")}
                              className={`w-full text-left rounded-2xl border-2 p-3.5 sm:p-5 transition-all duration-200 relative cursor-pointer ${
                                selectedPlan === "expert_edit"
                                  ? "border-lime-500 bg-lime-50/30 shadow-[0_0_0_1px_rgba(132,204,22,0.2)]"
                                  : "border-slate-200 bg-white hover:border-lime-300"
                              }`}
                            >
                              {/* Floating MOST POPULAR Badge */}
                              <div className="absolute -top-3 right-4 sm:right-5 bg-[#ff9500] text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 sm:px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs z-10">
                                MOST POPULAR
                              </div>

                              {/* Header: Tag, Title & Price */}
                              <div className="flex justify-between items-start mb-2.5 sm:mb-3">
                                <div>
                                  <span className="inline-block bg-lime-100 text-lime-800 text-[9.5px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded uppercase tracking-wider">
                                    EXPERT REVIEW
                                  </span>
                                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 sm:mt-1">
                                    Premium Pack
                                  </h4>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl sm:text-2xl font-black text-slate-900">
                                    {expertPricing.amountFormatted}
                                  </p>
                                </div>
                              </div>

                              {/* Features List with Green Checkmarks */}
                              <ul className="space-y-1.5 sm:space-y-2 mb-3.5 sm:mb-4">
                                {[
                                  "Everything in Standard",
                                  "Human expert review in <15 min",
                                  "Extra compliance verifications",
                                  "Priority processing",
                                  "Email support",
                                  "Reduced rejection risk",
                                ].map((f) => (
                                  <li
                                    key={f}
                                    className="flex items-center gap-2 text-[12.5px] sm:text-[13.5px] text-slate-700 font-medium leading-snug"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3] shrink-0" />
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>

                              {/* Sub-Card: See What Our Experts Fix */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPlan("expert_edit");
                                  setIsFixModalOpen(true);
                                }}
                                className="bg-lime-50/80 border border-lime-200/90 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3 group/fix hover:bg-lime-100/70 transition-colors cursor-pointer"
                              >
                                <div className="space-y-1.5">
                                  <div>
                                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight group-hover/fix:text-lime-700 transition-colors">
                                      See What Our Experts Fix
                                    </h5>
                                  </div>

                                  {/* Avatars + Count */}
                                  <div className="flex items-center">
                                    <div className="flex -space-x-1.5 sm:-space-x-2 overflow-hidden py-0.5">
                                      {[
                                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
                                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
                                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
                                        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
                                      ].map((src, idx) => (
                                        <img
                                          key={idx}
                                          src={src}
                                          alt="Customer avatar"
                                          width={24}
                                          height={24}
                                          loading="lazy"
                                          className="inline-block h-5 w-5 sm:h-6 sm:w-6 rounded-full ring-2 ring-white object-cover"
                                        />
                                      ))}
                                    </div>
                                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600 ml-2">
                                      +2.7k
                                    </span>
                                  </div>
                                </div>

                                {/* Green Action Button */}
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500 group-hover/fix:bg-emerald-600 text-white flex items-center justify-center transition-transform group-hover/fix:scale-105 shrink-0 shadow-xs">
                                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Only: Email Input & Checkout Button (Hidden on Mobile) */}
                          <div className="hidden lg:block space-y-4 pt-1">
                            {/* Email Input Field */}
                            <div>
                              <label
                                htmlFor="checkout-email-desktop"
                                className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                              >
                                Email for Delivery
                              </label>
                              <input
                                type="email"
                                id="checkout-email-desktop"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Enter your email"
                                className={`w-full px-3.5 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                                  emailError
                                    ? "border-red-400 focus:ring-red-400/30 text-red-950"
                                    : "border-slate-200 focus:ring-lime-500 focus:border-transparent"
                                }`}
                                required
                                aria-invalid={!!emailError}
                              />
                              {emailError && (
                                <p className="text-xs text-red-600 font-semibold mt-1">
                                  {emailError}
                                </p>
                              )}
                            </div>

                            {/* Error Alert */}
                            {paymentError && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 font-medium">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{paymentError}</span>
                              </div>
                            )}

                            {/* Desktop Main CTA Button */}
                            <div className="space-y-2 pt-1">
                              <button
                                type="button"
                                onClick={handleMainCtaClick}
                                disabled={isProcessingPayment}
                                className={`w-full font-bold py-4 rounded-xl transition-all text-sm tracking-wide flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-md ${
                                  selectedPlan === "expert_edit"
                                    ? "bg-lime-600 hover:bg-lime-700 text-white shadow-lime-600/20"
                                    : "bg-slate-900 hover:bg-black text-white shadow-slate-900/20"
                                }`}
                              >
                                {isProcessingPayment ? (
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4 shrink-0" />
                                    <span>
                                      {selectedPlan === "expert_edit"
                                        ? "Get Expert Review"
                                        : "Download Now"}{" "}
                                      —{" "}
                                      {selectedPlan === "expert_edit"
                                        ? expertPricing.amountFormatted
                                        : standardPricing.amountFormatted}
                                    </span>
                                  </>
                                )}
                              </button>

                              {/* Desktop Trust Badges */}
                              <div className="flex items-center justify-center gap-x-5 gap-y-1.5 py-3 flex-wrap border-t border-slate-100 mt-3">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <span className="text-[14px]">{flag}</span>
                                  <span className="text-[11px] font-semibold text-slate-700">
                                    {countryName} Compliant
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-[11px] font-semibold">Secure Checkout</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-[11px] font-semibold">Refund if Rejected</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-[11px] font-semibold">256-bit SSL</span>
                                </div>
                              </div>

                                {/* 24/7 Mail Support in Order Summary */}
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <a
                                    href={`mailto:${SUPPORT_EMAIL}?subject=Passport%20Photo%20Support%20-%20Session%20${encodeURIComponent(resultId)}`}
                                    className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-lime-50/80 border border-slate-200/90 hover:border-lime-300 transition-colors"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center shrink-0">
                                      <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-bold text-slate-900 group-hover:text-lime-900 transition-colors">
                                          24/7 Email Support
                                        </p>
                                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                                          Active
                                        </span>
                                      </div>
                                      <p className="text-[11px] font-semibold text-slate-500 group-hover:text-lime-700 truncate">
                                        {SUPPORT_EMAIL}
                                      </p>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-lime-700 shrink-0" />
                                  </a>
                                </div>

                                {/* Razorpay Badge */}
                                <div className="flex justify-center pt-2">
                                  <a
                                    href="https://razorpay.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      referrerPolicy="origin"
                                      src="https://badges.razorpay.com/badge-dark.png"
                                      style={{ height: 40, width: 100 }}
                                      alt="Razorpay | Payment Gateway | Neobank"
                                    />
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* Mobile Trust Badges Notice */}
                            <div className="block lg:hidden pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-center gap-3 py-2 flex-wrap text-slate-500">
                                <a
                                  href={`mailto:${SUPPORT_EMAIL}?subject=Passport%20Photo%20Support%20-%20Session%20${encodeURIComponent(resultId)}`}
                                  className="flex items-center gap-1 text-lime-800 font-bold hover:underline"
                                >
                                  <Mail className="w-3 h-3 text-lime-700" />
                                  <span className="text-[10.5px]">24/7 Mail Support: {SUPPORT_EMAIL}</span>
                                </a>
                                <div className="flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-emerald-600" />
                                  <span className="text-[10.5px] font-semibold">Acceptance Guarantee</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <RotateCcw className="w-3 h-3 text-emerald-600" />
                                  <span className="text-[10.5px] font-semibold">Instant Refund</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Paid State Receipt */
                          <div className="space-y-4">
                            <div className="bg-emerald-50 rounded-2xl p-5 sm:p-6 text-center border border-emerald-200">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-2xl sm:text-3xl">
                                🎉
                              </div>
                              <h2 className="text-emerald-800 font-bold text-lg sm:text-xl">
                                Payment Successful!
                              </h2>
                              <p className="mt-2 text-emerald-700 text-xs leading-relaxed">
                                Your photo is unlocked. Receipt and download links have been sent to{" "}
                                <strong>{paymentState?.email || email}</strong>.
                              </p>
                            </div>

                            <Link
                              href={`/preview/${resultId}/thankyou?paymentId=${paymentState?.paymentId || ""}`}
                              className="w-full bg-[#4D7C0F] hover:bg-[#3F650C] !text-white text-white font-bold py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all text-sm sm:text-base shadow-md text-center cursor-pointer"
                              style={{ color: "#ffffff" }}
                            >
                              <Download className="w-5 h-5 text-white" />
                              <span className="!text-white text-white font-bold">Go to Download Studio &rarr;</span>
                            </Link>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-center text-xs text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-lime-700 shrink-0" />
                              <span>Need assistance? 24/7 Support: <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-slate-900 underline hover:text-lime-700">{SUPPORT_EMAIL}</a></span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* MOBILE STICKY BOTTOM PAYMENT BAR (With inline email input & action button) */}
          {/* ========================================================================= */}
          {!isPaid && (fullImageUrl || previewUrl) && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3.5 pt-2.5 pb-3.5 sm:pb-4 shadow-[0_-6px_30px_rgba(0,0,0,0.12)] lg:hidden">
              <div className="max-w-md mx-auto space-y-2">
                {/* Mobile Sticky Email Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="checkout-email-mobile-sticky"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter email to receive photo & invoice"
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      emailError
                        ? "border-red-400 focus:ring-red-400/30 text-red-950"
                        : "border-slate-300 focus:ring-lime-500 focus:border-transparent"
                    }`}
                    required
                  />
                </div>

                {emailError && (
                  <p className="text-[11px] text-red-600 font-semibold px-1">
                    {emailError}
                  </p>
                )}

                {/* Bottom Row: Selected Plan Info & Primary Action Button */}
                <div className="flex items-center justify-between gap-2.5">
                  {/* Left side: selected plan & price */}
                  <div className="min-w-0 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {selectedPlan === "expert_edit" ? "Expert Review" : "Standard Pack"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                        {selectedPlan === "expert_edit"
                          ? expertPricing.amountFormatted
                          : standardPricing.amountFormatted}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> Guaranteed
                      </span>
                    </div>
                  </div>

                  {/* Right side: large sticky action button */}
                  <button
                    type="button"
                    onClick={handleMainCtaClick}
                    disabled={isProcessingPayment}
                    className={`flex-1 font-bold py-3 px-3.5 rounded-xl text-xs sm:text-sm tracking-wide flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-[0.98] disabled:opacity-50 ${
                      selectedPlan === "expert_edit"
                        ? "bg-lime-600 hover:bg-lime-700 text-white shadow-lime-600/25"
                        : "bg-slate-900 hover:bg-black text-white shadow-slate-900/25"
                    }`}
                  >
                    {isProcessingPayment ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {selectedPlan === "expert_edit" ? "Get Review" : "Download Now"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* EMAIL CAPTURE POPUP MODAL (Triggered on mobile/desktop without email) */}
          {/* ========================================================================= */}
          {isEmailModalOpen && (
            <div
              className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
              onClick={() => setIsEmailModalOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="email-modal-title"
            >
              <div
                className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 overflow-hidden max-h-[92dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer z-10"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="p-5 sm:p-7">
                  {/* Top Icon & Titles */}
                  <div className="flex items-center gap-3 mb-3 pr-8">
                    <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 id="email-modal-title" className="text-base sm:text-xl font-bold text-slate-900 leading-tight">
                        Where should we send your photo?
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                        Instant delivery &bull; High-res file &bull; 6×4″ print sheet &bull; Invoice
                      </p>
                    </div>
                  </div>

                  {/* Plan Pill */}
                  <div className="my-3 sm:my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{flag}</span>
                      <span className="text-xs font-bold text-slate-800">
                        {selectedPlan === "expert_edit" ? "Premium Pack (Expert Review)" : "Standard Pack (AI Verified)"}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedPlan === "expert_edit" ? expertPricing.amountFormatted : standardPricing.amountFormatted}
                    </span>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleModalEmailSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="modal-email-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="modal-email-input"
                        autoFocus
                        value={modalEmail}
                        onChange={(e) => {
                          setModalEmail(e.target.value);
                          if (modalEmailError) setModalEmailError("");
                        }}
                        placeholder="e.g. yourname@example.com"
                        className={`w-full px-3.5 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                          modalEmailError
                            ? "border-red-400 focus:ring-red-400/30 text-red-950"
                            : "border-slate-300 focus:ring-lime-500 focus:border-transparent"
                        }`}
                        required
                      />
                      {modalEmailError && (
                        <p className="text-xs text-red-600 font-semibold mt-1">
                          {modalEmailError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        type="submit"
                        disabled={isProcessingPayment}
                        className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {isProcessingPayment ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Continue to Payment &rarr;</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEmailModalOpen(false)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <p className="text-[10.5px] sm:text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5 pt-1">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>Money-back guarantee if your photo is rejected</span>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ZOOM OVERLAY LIGHTBOX (Unobstructed preview of the user's processed photo) */}
          {/* ========================================================================= */}
          {isZoomOpen && (
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in"
              onClick={() => setIsZoomOpen(false)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative max-w-2xl w-full bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 text-center max-h-[92dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close zoom preview"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center gap-2 mb-3 pr-6 sm:pr-0">
                  <span className="text-base">{flag}</span>
                  <h3 className="text-xs sm:text-base font-bold text-slate-900">
                    {countryName} Official Photo Preview ({dimensions} px)
                  </h3>
                </div>

                <div className="flex justify-center items-center bg-slate-50 rounded-xl p-2 sm:p-6 border border-slate-200 overflow-hidden">
                  {/* Clean preview image with no dark overlays */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={isPaid ? (fullImageUrl || previewUrl) : previewUrl}
                    alt={`${countryName} Enlarged Preview`}
                    className="max-h-[50vh] sm:max-h-[60vh] max-w-full object-contain rounded-lg shadow-sm"
                  />
                </div>

                <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-left">
                    <p className="text-[11px] sm:text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Official Embassy Dimensions &amp; Biometric Alignment
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                      High-resolution 300 DPI version is generated upon checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsZoomOpen(false);
                      handleMainCtaClick();
                    }}
                    className="w-full sm:w-auto bg-lime-600 hover:bg-lime-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-xs sm:ml-auto"
                  >
                    Proceed to Download &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* EXPERTS FIX MODAL (With real before/after transformation comparisons) */}
          {/* ========================================================================= */}
          {isFixModalOpen && (
            <div
              className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in"
              onClick={() => setIsFixModalOpen(false)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl overflow-hidden border-t sm:border border-slate-200/80 relative h-[94dvh] sm:h-auto max-h-[94dvh] sm:max-h-[88vh] flex flex-col transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white border-b border-slate-200/80 relative shrink-0">
                  <button
                    onClick={() => setIsFixModalOpen(false)}
                    className="absolute top-3 sm:top-4 right-3.5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer z-10"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="pr-10 sm:pr-12">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Human Expert Review
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                        &bull; Acceptance Guaranteed
                      </span>
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-slate-900 leading-tight">
                      See What Our Experts Fix
                    </h3>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 grow bg-slate-50/60">
                  {/* Banner */}
                  <div className="bg-purple-50/90 border border-purple-200/80 rounded-xl p-3 sm:p-3.5 text-xs text-purple-900 font-medium flex items-start sm:items-center gap-2.5 sm:gap-3 shadow-2xs">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="leading-snug">
                      This information and customer feedback is added based on user confirmation &amp; verified embassy submission results.
                    </span>
                  </div>

                  {/* Transformation Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    {BEFORE_AFTER_PAIRS.map((pair, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="w-5 h-5 rounded-full bg-lime-100 text-lime-800 text-[11px] font-extrabold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {pair.title}
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            {/* Before Image */}
                            <div className="space-y-1.5">
                              <div
                                className="relative w-full rounded-xl overflow-hidden bg-slate-100 border border-red-200 shadow-2xs"
                                style={{ aspectRatio: "3 / 4" }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={pair.beforeImg}
                                  alt={pair.beforeTag}
                                  className="absolute inset-0 w-full h-full object-cover object-center"
                                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                                  loading="lazy"
                                />
                                <span className="absolute top-2 left-2 bg-red-600/95 backdrop-blur-xs text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded shadow-xs z-10 uppercase tracking-wider">
                                  Before
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight line-clamp-2">
                                {pair.beforeTag}
                              </p>
                            </div>

                            {/* After Image */}
                            <div className="space-y-1.5">
                              <div
                                className="relative w-full rounded-xl overflow-hidden bg-slate-100 border border-emerald-300 shadow-2xs"
                                style={{ aspectRatio: "3 / 4" }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={pair.afterImg}
                                  alt={pair.afterTag}
                                  className="absolute inset-0 w-full h-full object-cover object-center"
                                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                                  loading="lazy"
                                />
                                <span className="absolute top-2 left-2 bg-emerald-600/95 backdrop-blur-xs text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded shadow-xs z-10 uppercase tracking-wider">
                                  After
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-[11px] text-emerald-700 font-bold leading-tight line-clamp-2">
                                {pair.afterTag}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-3.5 sm:p-5 bg-white border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
                    Select <strong>Expert Edit ({expertPricing.amountFormatted})</strong> for guaranteed human verification.
                  </div>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan("expert_edit");
                        setIsFixModalOpen(false);
                      }}
                      className="flex-1 sm:flex-initial bg-lime-600 hover:bg-lime-700 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-colors text-center shadow-xs cursor-pointer"
                    >
                      Continue with Expert Review ({expertPricing.amountFormatted}) &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFixModalOpen(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
