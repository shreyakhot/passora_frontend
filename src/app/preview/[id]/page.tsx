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
  { key: "gov12", label: "Sized to ICAO photo guidance" },
  { key: "gov", label: "Checked against published photo rules" },
  { key: "gov5", label: "Automated biometric checks" },
  { key: "gov2", label: "Free re-processing if rejected for sizing" },
  { key: "gov0", label: "Refund policy applies" },
  { key: "gov3", label: "Instant download + print sheet" },
];

const BEFORE_AFTER_PAIRS = [
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
    title: "Full Check Against ICAO Photo Guidance",
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
          color: "#4F46E5",
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
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <Navbar ctaText="Create New Photo" ctaHref="/passport-size-photo-maker" />

      {/* Main container with bottom padding on mobile for sticky payment bar */}
      <main className="relative flex-1 overflow-hidden flex items-start justify-center px-4 sm:px-6 pt-8 sm:pt-12 pb-48 lg:pb-16 text-ink-950" id="main-content">

        <div className="relative w-full max-w-6xl">
          {!fullImageUrl && !previewUrl ? (
            /* Empty or Expired Session State */
            <div className="mx-auto max-w-lg rounded-3xl border border-ink-200 bg-white p-7 text-center shadow-lift sm:p-12">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700" aria-hidden="true">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h1 className="mb-3 text-2xl text-ink-950 sm:text-3xl">
                Photo Session Not Found
              </h1>
              <p className="mb-8 text-sm text-ink-600 sm:text-base">
                No active photo preview found for ID:{" "}
                <span className="break-all font-mono font-semibold text-ink-950">{resultId}</span>.
                Please upload your photo again to create a new preview.
              </p>
              <Link
                href="/passport-size-photo-maker"
                className="btn-brand btn-lg w-full focus-ring"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                <span>Upload New Photo</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Header Title & Subtitle */}
              <div className="mb-8 text-center lg:mb-10 lg:text-left">
                <span className="eyebrow">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  Preview ready
                </span>
                <h1 className="mt-4 text-3xl text-ink-950 sm:text-4xl lg:text-5xl">
                  Your <span className="marker">ID photo</span> is ready{" "}
                  <span className="inline-block" aria-hidden="true">{flag}</span> {countryName}
                </h1>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
                  {/* 24*7 Mail Support Badge */}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=Support%20Request%20-%20Photo%20Session%20${encodeURIComponent(resultId)}`}
                    className="group inline-flex min-h-[2.25rem] items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 shadow-soft transition-colors hover:border-brand-300 hover:text-brand-700"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                    <Mail className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                    <span>24/7 Email Support: <span className="font-bold text-ink-950 underline decoration-brand-300 decoration-2 underline-offset-2 group-hover:text-brand-700">{SUPPORT_EMAIL}</span></span>
                  </a>

                  <p className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium text-ink-600 lg:justify-start">
                    <Shield className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>
                      <Link href="/refund-policy" className="underline decoration-ink-300 underline-offset-2 hover:text-brand-700">Refund policy</Link>{" "}
                      applies if rejected
                    </span>
                    <span className="ml-1 inline-flex items-center gap-1 font-semibold text-ink-800">
                      <span aria-hidden="true">{flag}</span> Sized for {countryName}
                    </span>
                  </p>
                </div>
              </div>

              {/* 2-Column Responsive Layout */}
              <div className="flex flex-col items-start gap-5 lg:flex-row lg:gap-8">
                {/* ========================================================================= */}
                {/* LEFT COLUMN: Photo Display & "Your Photo Meets Official Requirements" Card */}
                {/* ========================================================================= */}
                <div className="w-full space-y-5 lg:w-[58%]">
                  {/* Photo Card */}
                  <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-lift">
                    {/* Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/70 px-5 py-3 sm:px-6">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-base" aria-hidden="true">{flag}</span>
                        <p className="truncate text-sm font-bold text-ink-950">
                          {countryName} photo <span className="font-mono text-xs font-semibold text-ink-500">· {dimensions} px</span>
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                        <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                        <span className="text-[11px] font-bold">Rules checked</span>
                      </div>
                    </div>

                    {/* Photo Container */}
                    <div
                      className="group relative mx-4 my-4 flex cursor-zoom-in select-none items-center justify-center overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 p-4 focus-ring sm:mx-6 sm:my-6 sm:p-6"
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
                        className="pointer-events-none block max-h-[300px] w-auto max-w-full select-none rounded-lg object-contain shadow-soft ring-1 ring-ink-200 sm:max-h-[380px]"
                        draggable={false}
                        onContextMenu={(e) => !isPaid && e.preventDefault()}
                      />

                      {/* Subtle Glass Tag (Non-obstructive) */}
                      <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-ink-950 px-2.5 py-1 text-[11px] font-semibold text-white shadow-soft">
                        <Eye className="h-3 w-3 text-brand-300" aria-hidden="true" />
                        <span>Preview</span>
                      </div>

                      {/* Hover Zoom Hint */}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink-950/0 transition-colors group-hover:bg-ink-950/5">
                        <div className="flex scale-95 items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3.5 py-2 text-xs font-bold text-ink-950 opacity-0 shadow-lift transition-all group-hover:scale-100 group-hover:opacity-100">
                          <ZoomIn className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                          <span>Click to Zoom</span>
                        </div>
                      </div>
                    </div>

                    {/* Post-Payment Action Buttons */}
                    {isPaid && (
                      <div className="space-y-3 border-t border-ink-100 px-5 pb-6 pt-5 sm:px-6">
                        <button
                          type="button"
                          onClick={() => handleDownload("single")}
                          disabled={downloading}
                          className="btn-brand btn-lg w-full focus-ring"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          <span>{downloading ? "Preparing High-Res Download…" : "Download Single Photo (300 DPI)"}</span>
                        </button>

                        {paymentState?.paymentId && (
                          <div className="flex justify-end pt-1">
                            <a
                              href={`/api/invoices/${paymentState.paymentId}?format=pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-semibold text-ink-600 transition-colors hover:text-brand-700"
                            >
                              <Receipt className="h-4 w-4 text-brand-600" aria-hidden="true" />
                              <span>Download Tax Invoice (PDF)</span>
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* "Your Photo Meets Official Requirements" Card */}
                  <div className="surface p-6 sm:p-7">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="icon-tile" aria-hidden="true">
                        <Camera className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-lg text-ink-950 sm:text-xl">
                          Checked against {countryName}&apos;s photo rules
                        </h2>
                        <p className="text-xs text-ink-500 sm:text-sm">What&apos;s included with your photo</p>
                      </div>
                    </div>

                    <ul className="m-0 grid list-none gap-x-6 p-0 sm:grid-cols-2">
                      {METRIC_FIXES.map((metric) => (
                        <li
                          key={metric.key}
                          className="flex items-start gap-3 border-b border-ink-100 py-3 last:border-0 sm:[&:nth-last-child(2)]:border-0"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700" aria-hidden="true">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                          <span className="text-sm font-medium text-ink-700">
                            {metric.label}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Bottom Highlight Box */}
                    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
                      <Star className="h-4 w-4 shrink-0 fill-brand-200 text-brand-600" aria-hidden="true" />
                      <p className="text-sm font-semibold leading-relaxed text-brand-800">
                        Background replaced and corrected to the published requirements
                      </p>
                    </div>
                  </div>

                  {/* Dedicated 24/7 Mail Support Card */}
                  <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-6 text-white sm:p-7">
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-brand-300" aria-hidden="true">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <h3 className="text-base text-white sm:text-lg">
                            24/7 Dedicated Email Support
                          </h3>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                            Live 24×7
                          </span>
                        </div>
                        <p className="mb-5 text-sm leading-relaxed text-ink-300">
                          Questions about embassy requirements, print sizing, or need custom assistance with your photo? Our biometric support team is ready to help 24 hours a day, 7 days a week.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                          <a
                            href={`mailto:${SUPPORT_EMAIL}?subject=Passport%20Photo%20Support%20-%20Session%20${encodeURIComponent(resultId)}`}
                            className="btn-light max-w-full text-sm"
                          >
                            <Mail className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                            <span className="truncate">Email {SUPPORT_EMAIL}</span>
                          </a>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-ink-400">
                            <Clock className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
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
                <div className="w-full space-y-5 lg:sticky lg:top-24 lg:w-[42%]">
                  <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-lift">
                    <div className="p-5 sm:p-7">
                      {!isPaid ? (
                        <div className="space-y-5">
                          {/* Top Heading */}
                          <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl text-ink-950 sm:text-2xl">Choose your plan</h2>
                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                              <Shield className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                              <span>Order summary</span>
                            </p>
                          </div>

                          {/* Plans Selection */}
                          <div className="space-y-4">
                            {/* Plan 1: Standard Pack */}
                            <button
                              type="button"
                              onClick={() => setSelectedPlan("standard")}
                              aria-pressed={selectedPlan === "standard"}
                              className={`relative w-full cursor-pointer rounded-2xl border p-4 text-left transition-all duration-150 focus-ring sm:p-5 ${
                                selectedPlan === "standard"
                                  ? "border-brand-600 bg-brand-50/50 ring-4 ring-brand-500/15"
                                  : "border-ink-200 bg-white hover:border-brand-300"
                              }`}
                            >
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                      selectedPlan === "standard" ? "border-brand-600 bg-brand-600" : "border-ink-300 bg-white"
                                    }`}
                                    aria-hidden="true"
                                  >
                                    {selectedPlan === "standard" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                  </span>
                                  <h4 className="text-base text-ink-950">
                                    Standard Pack
                                  </h4>
                                </div>
                                <p className="font-display text-2xl font-extrabold tracking-tight text-ink-950">
                                  {standardPricing.amountFormatted}
                                </p>
                              </div>
                              <ul className="m-0 list-none space-y-2 p-0 pl-8">
                                {[
                                  "AI Biometric Check",
                                  "Instant digital download",
                                  "Official 6×4″ print sheet",
                                  "Refund policy applies",
                                ].map((f) => (
                                  <li
                                    key={f}
                                    className="flex items-center gap-2.5 text-sm font-medium text-ink-600"
                                  >
                                    <Check
                                      className={`h-3.5 w-3.5 shrink-0 stroke-[3] ${
                                        selectedPlan === "standard"
                                          ? "text-brand-600"
                                          : "text-ink-300"
                                      }`}
                                      aria-hidden="true"
                                    />
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </button>

                            {/* Plan 2: Premium Pack (Expert Review) */}
                            <div
                              onClick={() => setSelectedPlan("expert_edit")}
                              className={`relative w-full cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${
                                selectedPlan === "expert_edit"
                                  ? "border-brand-600 bg-brand-50/50 ring-4 ring-brand-500/15"
                                  : "border-ink-200 bg-white hover:border-brand-300"
                              }`}
                            >
                              {/* Floating MOST POPULAR Badge */}
                              <div className="absolute -top-3 right-5 z-10 inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                <Star className="h-3 w-3 fill-white" aria-hidden="true" />
                                Most popular
                              </div>

                              {/* Header: Tag, Title & Price */}
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <span
                                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                      selectedPlan === "expert_edit" ? "border-brand-600 bg-brand-600" : "border-ink-300 bg-white"
                                    }`}
                                    aria-hidden="true"
                                  >
                                    {selectedPlan === "expert_edit" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                  </span>
                                  <div>
                                    <span className="inline-block rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-800">
                                      Expert review
                                    </span>
                                    <h4 className="mt-1 text-lg text-ink-950">
                                      Premium Pack
                                    </h4>
                                  </div>
                                </div>
                                <p className="font-display text-3xl font-extrabold tracking-tight text-ink-950">
                                  {expertPricing.amountFormatted}
                                </p>
                              </div>

                              {/* Features List with Checkmarks */}
                              <ul className="m-0 mb-4 list-none space-y-2 p-0 pl-8">
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
                                    className="flex items-center gap-2.5 text-sm font-medium leading-snug text-ink-700"
                                  >
                                    <Check
                                      className={`h-3.5 w-3.5 shrink-0 stroke-[3] ${
                                        selectedPlan === "expert_edit" ? "text-brand-600" : "text-ink-300"
                                      }`}
                                      aria-hidden="true"
                                    />
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>

                              {/* Sub-Card: See What Our Experts Fix */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPlan("expert_edit");
                                  setIsFixModalOpen(true);
                                }}
                                className="group/fix flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-3 text-left transition-colors hover:border-brand-300 focus-ring sm:p-3.5"
                              >
                                <span className="block space-y-1.5">
                                  <span className="block font-display text-sm font-bold leading-tight text-ink-950 transition-colors group-hover/fix:text-brand-700">
                                    See What Our Experts Fix
                                  </span>

                                  {/* Avatars + Count */}
                                  <span className="flex items-center">
                                    <span className="flex -space-x-2 overflow-hidden py-0.5">
                                      {[
                                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
                                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
                                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
                                        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
                                      ].map((src, idx) => (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          key={idx}
                                          src={src}
                                          alt="Customer avatar"
                                          width={24}
                                          height={24}
                                          loading="lazy"
                                          className="inline-block h-6 w-6 rounded-full object-cover ring-2 ring-white"
                                        />
                                      ))}
                                    </span>
                                    <span className="ml-2 text-xs font-semibold text-ink-600">
                                      +2.7k
                                    </span>
                                  </span>
                                </span>

                                {/* Action Arrow */}
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-950 text-white transition-all group-hover/fix:translate-x-0.5 group-hover/fix:bg-brand-600" aria-hidden="true">
                                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Desktop Only: Email Input & Checkout Button (Hidden on Mobile) */}
                          <div className="hidden space-y-4 pt-1 lg:block">
                            {/* Email Input Field */}
                            <div>
                              <label
                                htmlFor="checkout-email-desktop"
                                className="mb-2 block text-sm font-bold text-ink-950"
                              >
                                Email for Delivery
                              </label>
                              <input
                                type="email"
                                id="checkout-email-desktop"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Enter your email"
                                className={`field ${
                                  emailError
                                    ? "border-red-400 text-red-950 focus:border-red-500 focus:shadow-[0_0_0_4px_rgb(239_68_68/0.15)]"
                                    : ""
                                }`}
                                required
                                aria-invalid={!!emailError}
                              />
                              {emailError && (
                                <p className="mt-1.5 text-xs font-semibold text-red-600">
                                  {emailError}
                                </p>
                              )}
                            </div>

                            {/* Error Alert */}
                            {paymentError && (
                              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                <span>{paymentError}</span>
                              </div>
                            )}

                            {/* Desktop Main CTA Button */}
                            <div className="space-y-2 pt-1">
                              <button
                                type="button"
                                onClick={handleMainCtaClick}
                                disabled={isProcessingPayment}
                                className="btn-brand btn-lg w-full focus-ring"
                              >
                                {isProcessingPayment ? (
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                  <>
                                    <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
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
                              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-ink-100 py-4">
                                <div className="flex items-center gap-1.5 text-ink-600">
                                  <span className="text-[14px]" aria-hidden="true">{flag}</span>
                                  <span className="text-xs font-semibold text-ink-700">
                                    Sized for {countryName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-ink-600">
                                  <Shield className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                                  <span className="text-xs font-semibold">Secure Checkout</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-ink-600">
                                  <RotateCcw className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                                  <span className="text-xs font-semibold">Refund policy applies</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-ink-600">
                                  <Lock className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
                                  <span className="text-xs font-semibold">256-bit SSL</span>
                                </div>
                              </div>

                                {/* 24/7 Mail Support in Order Summary */}
                                <div className="border-t border-ink-100 pt-4">
                                  <a
                                    href={`mailto:${SUPPORT_EMAIL}?subject=Passport%20Photo%20Support%20-%20Session%20${encodeURIComponent(resultId)}`}
                                    className="group flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 p-3 transition-colors hover:border-brand-300 hover:bg-brand-50/60"
                                  >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 ring-1 ring-ink-200" aria-hidden="true">
                                      <Mail className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-bold text-ink-950 transition-colors group-hover:text-brand-800">
                                          24/7 Email Support
                                        </p>
                                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                          Active
                                        </span>
                                      </div>
                                      <p className="truncate text-xs font-medium text-ink-500 group-hover:text-brand-700">
                                        {SUPPORT_EMAIL}
                                      </p>
                                    </div>
                                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-ink-400 group-hover:text-brand-700" aria-hidden="true" />
                                  </a>
                                </div>

                                {/* Razorpay Badge */}
                                <div className="flex justify-center pt-3">
                                  <a
                                    href="https://razorpay.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                            <div className="block border-t border-ink-100 pt-3 lg:hidden">
                              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-1 text-ink-600">
                                <a
                                  href={`mailto:${SUPPORT_EMAIL}?subject=Passport%20Photo%20Support%20-%20Session%20${encodeURIComponent(resultId)}`}
                                  className="flex min-h-[2.75rem] items-center gap-1.5 font-semibold text-brand-700 hover:underline"
                                >
                                  <Mail className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                                  <span className="text-xs">24/7 Mail Support: {SUPPORT_EMAIL}</span>
                                </a>
                                <div className="flex items-center gap-1.5">
                                  <Shield className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                                  <span className="text-xs font-semibold">Refund policy applies</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <RotateCcw className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                                  <span className="text-xs font-semibold">Free re-processing if rejected for sizing</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Paid State Receipt */
                          <div className="space-y-4">
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-soft" aria-hidden="true">
                                <Check className="h-7 w-7 stroke-[3]" />
                              </div>
                              <h2 className="text-xl text-emerald-900 sm:text-2xl">
                                Payment Successful!
                              </h2>
                              <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                                Your photo is unlocked. Receipt and download links have been sent to{" "}
                                <strong>{paymentState?.email || email}</strong>.
                              </p>
                            </div>

                            <Link
                              href={`/preview/${resultId}/thankyou?paymentId=${paymentState?.paymentId || ""}`}
                              className="btn-brand btn-lg w-full focus-ring"
                            >
                              <Download className="h-5 w-5" aria-hidden="true" />
                              <span>Go to Download Studio &rarr;</span>
                            </Link>

                            <div className="flex items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-ink-50 p-3 text-center text-sm text-ink-600">
                              <Mail className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                              <span>Need assistance? 24/7 Support: <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-ink-950 underline decoration-brand-300 underline-offset-2 hover:text-brand-700">{SUPPORT_EMAIL}</a></span>
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
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-200 bg-white px-4 pb-4 pt-3 shadow-[0_-12px_32px_-12px_rgb(11_16_32/0.25)] lg:hidden">
              <div className="mx-auto max-w-md space-y-2.5">
                {/* Mobile Sticky Email Input */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400" aria-hidden="true">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    id="checkout-email-mobile-sticky"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter email to receive photo & invoice"
                    className={`field pl-10 text-sm ${
                      emailError
                        ? "border-red-400 text-red-950 focus:border-red-500 focus:shadow-[0_0_0_4px_rgb(239_68_68/0.15)]"
                        : ""
                    }`}
                    required
                  />
                </div>

                {emailError && (
                  <p className="px-1 text-xs font-semibold text-red-600">
                    {emailError}
                  </p>
                )}

                {/* Bottom Row: Selected Plan Info & Primary Action Button */}
                <div className="flex items-center justify-between gap-3">
                  {/* Left side: selected plan & price */}
                  <div className="min-w-0 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                        {selectedPlan === "expert_edit" ? "Expert Review" : "Standard Pack"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="font-display text-xl font-extrabold leading-none tracking-tight text-ink-950">
                        {selectedPlan === "expert_edit"
                          ? expertPricing.amountFormatted
                          : standardPricing.amountFormatted}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-700">
                        <Shield className="h-2.5 w-2.5" aria-hidden="true" /> Secure
                      </span>
                    </div>
                  </div>

                  {/* Right side: large sticky action button */}
                  <button
                    type="button"
                    onClick={handleMainCtaClick}
                    disabled={isProcessingPayment}
                    className="btn-brand flex-1 px-4 text-sm focus-ring"
                  >
                    {isProcessingPayment ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          {selectedPlan === "expert_edit" ? "Get Review" : "Download Now"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
              className="fixed inset-0 z-[300] flex items-end justify-center bg-ink-950/75 p-0 animate-fade-in sm:items-center sm:p-4"
              onClick={() => setIsEmailModalOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="email-modal-title"
            >
              <div
                className="relative max-h-[92dvh] w-full overflow-hidden overflow-y-auto rounded-t-3xl border-t border-ink-200 bg-white shadow-2xl sm:max-w-md sm:rounded-3xl sm:border"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="absolute right-4 top-4 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-ink-100 text-ink-600 transition-colors hover:bg-ink-200 focus-ring"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="p-6 sm:p-8">
                  {/* Top Icon & Titles */}
                  <div className="mb-4 flex items-center gap-3 pr-12">
                    <span className="icon-tile" aria-hidden="true">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 id="email-modal-title" className="text-lg leading-tight text-ink-950 sm:text-xl">
                        Where should we send your photo?
                      </h3>
                      <p className="mt-0.5 text-xs text-ink-500">
                        Instant delivery &bull; High-res file &bull; 6×4″ print sheet &bull; Invoice
                      </p>
                    </div>
                  </div>

                  {/* Plan Pill */}
                  <div className="my-5 flex items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-ink-50 p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm" aria-hidden="true">{flag}</span>
                      <span className="text-sm font-bold text-ink-800">
                        {selectedPlan === "expert_edit" ? "Premium Pack (Expert Review)" : "Standard Pack (AI Verified)"}
                      </span>
                    </div>
                    <span className="rounded-lg border border-ink-200 bg-white px-2 py-0.5 font-display text-sm font-extrabold text-ink-950">
                      {selectedPlan === "expert_edit" ? expertPricing.amountFormatted : standardPricing.amountFormatted}
                    </span>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleModalEmailSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="modal-email-input" className="mb-2 block text-sm font-bold text-ink-950">
                        Email Address <span className="text-red-600">*</span>
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
                        className={`field ${
                          modalEmailError
                            ? "border-red-400 text-red-950 focus:border-red-500 focus:shadow-[0_0_0_4px_rgb(239_68_68/0.15)]"
                            : ""
                        }`}
                        required
                      />
                      {modalEmailError && (
                        <p className="mt-1.5 text-xs font-semibold text-red-600">
                          {modalEmailError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <button
                        type="submit"
                        disabled={isProcessingPayment}
                        className="btn-brand btn-lg w-full focus-ring"
                      >
                        {isProcessingPayment ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <>
                            <span>Continue to Payment &rarr;</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEmailModalOpen(false)}
                        className="btn-outline-brand w-full text-sm focus-ring"
                      >
                        Cancel
                      </button>
                    </div>

                    <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-ink-500">
                      <Shield className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      <span>
                        <Link href="/refund-policy" className="underline decoration-ink-300 underline-offset-2 hover:text-brand-700">Refund policy</Link>{" "}
                        applies if your photo is rejected for sizing
                      </span>
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
              className="fixed inset-0 z-[200] flex items-center justify-center bg-ink-950/80 p-3 animate-fade-in sm:p-4"
              onClick={() => setIsZoomOpen(false)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-ink-200 bg-white p-5 text-center shadow-2xl sm:p-7"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="absolute right-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-ink-100 text-ink-700 transition-colors hover:bg-ink-200 focus-ring sm:right-4 sm:top-4"
                  aria-label="Close zoom preview"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mb-4 flex items-center justify-center gap-2 px-12">
                  <span className="text-base" aria-hidden="true">{flag}</span>
                  <h3 className="text-base text-ink-950 sm:text-lg">
                    {countryName} Photo Preview <span className="font-mono text-xs font-semibold text-ink-500 sm:text-sm">({dimensions} px)</span>
                  </h3>
                </div>

                <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 p-3 sm:p-6">
                  {/* Clean preview image with no dark overlays */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={isPaid ? (fullImageUrl || previewUrl) : previewUrl}
                    alt={`${countryName} Enlarged Preview`}
                    className="max-h-[50vh] max-w-full rounded-lg object-contain shadow-soft ring-1 ring-ink-200 sm:max-h-[60vh]"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 sm:mt-5">
                  <div className="text-left">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 sm:text-sm">
                      <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" /> Sized to {countryName}&apos;s published dimensions
                    </p>
                    <p className="text-xs text-ink-500">
                      High-resolution 300 DPI version is generated upon checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsZoomOpen(false);
                      handleMainCtaClick();
                    }}
                    className="btn-brand w-full text-sm focus-ring sm:ml-auto sm:w-auto"
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
              className="fixed inset-0 z-[250] flex items-end justify-center bg-ink-950/75 p-0 animate-fade-in sm:items-center sm:p-4 md:p-6"
              onClick={() => setIsFixModalOpen(false)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative flex h-[94dvh] max-h-[94dvh] w-full max-w-full flex-col overflow-hidden rounded-t-3xl border-t border-ink-200 bg-white shadow-2xl transition-all duration-200 sm:h-auto sm:max-h-[88vh] sm:max-w-xl sm:rounded-3xl sm:border md:max-w-2xl lg:max-w-4xl xl:max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="relative shrink-0 border-b border-ink-100 bg-white px-5 py-4 sm:px-7 sm:py-5">
                  <button
                    onClick={() => setIsFixModalOpen(false)}
                    className="absolute right-3.5 top-3.5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-ink-100 text-ink-600 transition-colors hover:bg-ink-200 focus-ring sm:right-5 sm:top-4"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="pr-14">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="eyebrow py-1 text-[10px]">
                        Human Expert Review
                      </span>
                      <span className="hidden text-xs font-medium text-ink-500 sm:inline">
                        &bull; Checked by a person before delivery
                      </span>
                    </div>
                    <h3 className="text-xl leading-tight text-ink-950 sm:text-2xl">
                      See What Our Experts Fix
                    </h3>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="grow space-y-4 overflow-y-auto bg-ink-50 p-4 sm:space-y-5 sm:p-7">
                  {/* Banner */}
                  <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-3.5 text-sm font-medium text-brand-900 sm:items-center">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-brand-100 sm:mt-0" aria-hidden="true">
                      <Shield className="h-4 w-4" />
                    </div>
                    <span className="leading-snug">
                      Examples of the kinds of fixes our editors make. Results depend on your original photo.
                    </span>
                  </div>

                  {/* Transformation Cards Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {BEFORE_AFTER_PAIRS.map((pair, idx) => (
                      <div
                        key={idx}
                        className="surface flex flex-col justify-between space-y-3 p-4 transition-colors hover:border-brand-200 sm:p-5"
                      >
                        <div>
                          <div className="mb-3 flex items-center gap-2.5">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-950 text-[11px] font-bold text-white" aria-hidden="true">
                              {idx + 1}
                            </span>
                            <h4 className="text-sm leading-snug text-ink-950 sm:text-base">
                              {pair.title}
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Before Image */}
                            <div className="space-y-1.5">
                              <div
                                className="relative w-full overflow-hidden rounded-xl border border-ink-200 bg-ink-100"
                                style={{ aspectRatio: "3 / 4" }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={pair.beforeImg}
                                  alt={pair.beforeTag}
                                  className="absolute inset-0 h-full w-full object-cover object-center"
                                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                                  loading="lazy"
                                />
                                <span className="absolute left-2 top-2 z-10 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
                                  Before
                                </span>
                              </div>
                              <p className="line-clamp-2 text-[11px] font-medium leading-tight text-ink-500 sm:text-xs">
                                {pair.beforeTag}
                              </p>
                            </div>

                            {/* After Image */}
                            <div className="space-y-1.5">
                              <div
                                className="relative w-full overflow-hidden rounded-xl border border-emerald-300 bg-ink-100 ring-2 ring-emerald-500/15"
                                style={{ aspectRatio: "3 / 4" }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={pair.afterImg}
                                  alt={pair.afterTag}
                                  className="absolute inset-0 h-full w-full object-cover object-center"
                                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                                  loading="lazy"
                                />
                                <span className="absolute left-2 top-2 z-10 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
                                  After
                                </span>
                              </div>
                              <p className="line-clamp-2 text-[11px] font-bold leading-tight text-emerald-700 sm:text-xs">
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
                <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-ink-100 bg-white p-4 sm:flex-row sm:p-5">
                  <div className="text-center text-sm text-ink-600 sm:text-left">
                    Select <strong className="text-ink-950">Expert Edit ({expertPricing.amountFormatted})</strong> for a manual check by a person.
                  </div>
                  <div className="flex w-full items-center gap-2.5 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan("expert_edit");
                        setIsFixModalOpen(false);
                      }}
                      className="btn-brand flex-1 text-sm focus-ring sm:flex-initial"
                    >
                      Continue with Expert Review ({expertPricing.amountFormatted}) &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFixModalOpen(false)}
                      className="btn-outline-brand text-sm focus-ring"
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
