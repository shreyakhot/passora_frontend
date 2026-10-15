"use client";

import {
  useState,
  useRef,
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  X,
  AlertCircle,
  Globe,
  CheckCircle,
  Zap,
  ArrowRight,
  Camera,
  Check,
  RotateCcw,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  DEFAULT_COUNTRY_CODE,
  countryFlag,
  detectCountryFromLocales,
  getCountryByCode,
  type CountryPassportConfig,
} from "@/config/countries";
import {
  compressImageTo3MB,
  type CompressionResult,
} from "@/lib/image-compress";
import type { PassportProcessResult } from "@/lib/passport-api";

interface PhotoMakerStudioProps {
  defaultCountryCode?: string;
  defaultDocumentType?: string;
  badgeText?: string;
  className?: string;
  autoProcess?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 20;

const PROCESSING_STEPS = [
  { text: "Analyzing facial landmarks & eye alignment…", progress: 25 },
  { text: "Removing shadows & verifying background…", progress: 50 },
  { text: "Cropping to exact government dimensions…", progress: 75 },
  { text: "Finalizing digital photo & 6×4″ print sheet…", progress: 95 },
];

// Browser-locale country guess. Read through useSyncExternalStore so the server
// render (and hydration) uses no guess and the client switches after mount.
function subscribeToLocaleChanges(onChange: () => void) {
  window.addEventListener("languagechange", onChange);
  return () => window.removeEventListener("languagechange", onChange);
}

function getLocaleCountryCode(): string | null {
  const locales =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
  return detectCountryFromLocales(locales)?.country_code ?? null;
}

function getServerLocaleCountryCode(): string | null {
  return null;
}

export default function PhotoMakerStudio({
  defaultCountryCode,
  defaultDocumentType = "passport",
  autoProcess = true,
  className = "",
}: PhotoMakerStudioProps) {
  const router = useRouter();

  // Country selection: the user's pick wins, then the page's default, then the
  // visitor's browser locale, then DEFAULT_COUNTRY_CODE.
  const localeCountryCode = useSyncExternalStore(
    subscribeToLocaleChanges,
    getLocaleCountryCode,
    getServerLocaleCountryCode
  );
  const [pickedCountryCode, setPickedCountryCode] = useState<string | null>(null);
  const [prevDefaultCode, setPrevDefaultCode] = useState(defaultCountryCode);

  // Prop synchronization: a new page default replaces any earlier pick.
  if (defaultCountryCode !== prevDefaultCode) {
    setPrevDefaultCode(defaultCountryCode);
    setPickedCountryCode(null);
  }

  const selectedCountryCode =
    pickedCountryCode ?? defaultCountryCode ?? localeCountryCode ?? DEFAULT_COUNTRY_CODE;

  const selectedCountry: CountryPassportConfig =
    getCountryByCode(selectedCountryCode) || DEFAULT_COUNTRY;

  // Searchable country dropdown state
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const countryBoxRef = useRef<HTMLDivElement>(null);
  const countrySearchRef = useRef<HTMLInputElement>(null);

  const filteredCountries = COUNTRIES.filter((c) => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.country_name.toLowerCase().includes(q) ||
      c.country_code.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        countryBoxRef.current &&
        !countryBoxRef.current.contains(e.target as Node)
      ) {
        setIsCountryOpen(false);
        setCountryQuery("");
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsCountryOpen(false);
        setCountryQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function openCountryDropdown() {
    if (isProcessing) return;
    setIsCountryOpen(true);
    requestAnimationFrame(() => countrySearchRef.current?.focus());
  }

  function selectCountry(code: string) {
    setPickedCountryCode(code);
    setIsCountryOpen(false);
    setCountryQuery("");
  }

  // File and state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);

  // 10-Second Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStepIndex, setProcessingStepIndex] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);
  const processBtnRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to process CTA button upon successful photo upload (if not auto-processing)
  useEffect(() => {
    if (preview && file && !isProcessing) {
      const timer = setTimeout(() => {
        processBtnRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [preview, file, isProcessing]);

  // Validation
  function validate(f: File): string | null {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return "Please upload a JPEG, PNG, or WebP image.";
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File must be smaller than ${MAX_FILE_SIZE_MB} MB.`;
    }
    return null;
  }

  const processPhoto = useCallback(
    async (fileToProcess?: File, previewToUse?: string) => {
      const targetFile = fileToProcess || file;
      const targetPreview = previewToUse || preview;
      if (!targetFile) return;

      setIsProcessing(true);
      setError(null);
      setProcessingProgress(0);
      setProcessingStepIndex(0);
      setCountdown(10);

      const startTime = Date.now();
      const TOTAL_DURATION_MS = 10000;

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progressPct = Math.min(
          100,
          Math.round((elapsed / TOTAL_DURATION_MS) * 100)
        );
        setProcessingProgress(progressPct);

        const remainingSec = Math.max(
          0,
          Math.ceil((TOTAL_DURATION_MS - elapsed) / 1000)
        );
        setCountdown(remainingSec);

        if (progressPct >= 75) {
          setProcessingStepIndex(3);
        } else if (progressPct >= 50) {
          setProcessingStepIndex(2);
        } else if (progressPct >= 25) {
          setProcessingStepIndex(1);
        } else {
          setProcessingStepIndex(0);
        }
      }, 100);

      try {
        const fileExt = targetFile.name.split(".").pop() || "jpg";
        const timestamp = Date.now();
        const fileName = `upload_${timestamp}.${fileExt}`;
        const freshFile = new File([targetFile], fileName, {
          type: targetFile.type,
        });

        const formData = new FormData();
        formData.append("image", freshFile);
        formData.append("country_code", selectedCountry.country_code);
        formData.append(
          "document_type",
          defaultDocumentType || selectedCountry.document_type || "passport"
        );

        const apiPromise = fetch("/api/passport-photo", {
          method: "POST",
          body: formData,
        }).then(async (res) => {
          const data: PassportProcessResult = await res.json();
          if (!res.ok || data.status === "error" || data.error) {
            throw new Error(data.error || "Failed to process passport photo.");
          }
          return data;
        });

        const [apiResult] = await Promise.all([
          apiPromise,
          new Promise((res) => setTimeout(res, TOTAL_DURATION_MS)),
        ]);

        clearInterval(interval);
        setProcessingProgress(100);

        const resultId =
          apiResult.result_id ||
          `res_${selectedCountry.country_code.toLowerCase()}_${timestamp}`;

        const payload = {
          ...apiResult,
          result_id: resultId,
          country_code: selectedCountry.country_code,
          country_name: selectedCountry.country_name,
          target_dimensions: selectedCountry.dimensions,
          document_type: selectedCountry.document_type,
          original_preview: targetPreview,
          timestamp,
        };

        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              `photogovt_${resultId}`,
              JSON.stringify(payload)
            );
            sessionStorage.setItem(
              "photogovt_latest",
              JSON.stringify(payload)
            );
            localStorage.setItem(
              `photogovt_${resultId}`,
              JSON.stringify(payload)
            );
            localStorage.setItem("photogovt_latest", JSON.stringify(payload));
          } catch {
            // fallback
          }
        }

        router.push(`/preview/${resultId}`);
      } catch (err: unknown) {
        clearInterval(interval);
        setIsProcessing(false);
        const msg =
          err instanceof Error
            ? err.message
            : "An error occurred while communicating with the photo processing service.";
        setError(msg);
      }
    },
    // State setters are stable; they are listed so the React Compiler can keep this memoization.
    [
      file,
      preview,
      selectedCountry,
      defaultDocumentType,
      router,
      setIsProcessing,
      setError,
      setProcessingProgress,
      setProcessingStepIndex,
      setCountdown,
    ]
  );

  async function handleFile(f: File) {
    const err = validate(f);
    if (err) {
      setError(err);
      setFile(null);
      setPreview(null);
      setCompressionInfo(null);
      return;
    }

    setError(null);

    // Read preview data URL asynchronously
    let previewData: string | null = null;
    try {
      previewData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to read image file"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(f);
      });
      setPreview(previewData);
    } catch {
      // If preview read fails, continue with file
    }

    // Auto-compress to <= 3 MB
    let uploadFile = f;
    try {
      const compResult = await compressImageTo3MB(f);
      uploadFile = compResult.file;
      setFile(compResult.file);
      setCompressionInfo(compResult);
    } catch {
      setFile(f);
      setCompressionInfo(null);
    }

    // Automatically trigger processing immediately
    if (autoProcess) {
      processPhoto(uploadFile, previewData || undefined);
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      handleFile(f);
      e.target.value = "";
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    setError(null);
    setCompressionInfo(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={`space-y-4 sm:space-y-5 ${className}`}>
      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 bg-red-50 border border-red-200 text-red-900 rounded-xl p-3.5 sm:p-4 text-sm flex items-start justify-between gap-3 font-medium"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            className="text-red-700 hover:text-red-900 p-1 rounded-lg focus-ring cursor-pointer"
            onClick={() => setError(null)}
            aria-label="Dismiss error notification"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* CARD 1 — Country Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <label
          htmlFor="country-search-trigger"
          className="block text-xs sm:text-sm font-bold text-slate-900 mb-2"
        >
          Select Country / Destination
        </label>

        <div className="relative" ref={countryBoxRef}>
          <button
            id="country-search-trigger"
            type="button"
            disabled={isProcessing}
            onClick={() =>
              isCountryOpen ? setIsCountryOpen(false) : openCountryDropdown()
            }
            className="w-full flex items-center justify-between gap-2 text-slate-900 font-semibold bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm sm:text-base focus-ring transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            aria-haspopup="listbox"
            aria-expanded={isCountryOpen}
            aria-controls="country-listbox"
            aria-label={`Selected country: ${selectedCountry.country_name}, dimensions ${selectedCountry.dimensions} pixels. Click to change.`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-lg leading-none shrink-0" aria-hidden="true">
                {countryFlag(selectedCountry.country_code)}
              </span>
              <span className="truncate">
                {selectedCountry.country_name} ({selectedCountry.country_code}) —{" "}
                {selectedCountry.dimensions} px
              </span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-600 shrink-0 transition-transform ${
                isCountryOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {isCountryOpen && (
            <div
              id="country-listbox"
              className="absolute z-30 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col"
              role="listbox"
              aria-label="Supported countries and dimensions"
            >
              <div className="p-2 border-b border-slate-100 bg-white shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
                  <input
                    ref={countrySearchRef}
                    id="country-search-input"
                    type="text"
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    placeholder="Search country…"
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus-ring"
                    aria-label="Filter countries list"
                  />
                </div>
              </div>

              <ul className="max-h-56 sm:max-h-72 overflow-y-auto py-1 list-none p-0 m-0" role="presentation">
                {filteredCountries.length === 0 && (
                  <li className="px-4 py-4 text-sm text-slate-700 text-center">
                    No countries match &ldquo;{countryQuery}&rdquo;
                  </li>
                )}
                {filteredCountries.map((c) => {
                  const active = c.country_code === selectedCountry.country_code;
                  return (
                    <li key={c.country_code} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        id={`country-opt-${c.country_code}`}
                        onClick={() => selectCountry(c.country_code)}
                        className={`w-full flex items-center justify-between gap-2 text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                          active
                            ? "bg-lime-50 text-lime-900 font-bold"
                            : "text-slate-800 hover:bg-slate-50 font-medium"
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="text-base leading-none shrink-0" aria-hidden="true">
                            {countryFlag(c.country_code)}
                          </span>
                          <span className="truncate">{c.country_name}</span>
                        </span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs text-slate-600">
                            {c.dimensions}px
                          </span>
                          {active && (
                            <Check className="w-4 h-4 text-lime-700" aria-hidden="true" />
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <p className="text-slate-700 text-xs mt-2 flex items-center gap-1.5 font-medium">
          <Globe className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
          <span>
            {selectedCountry.document_type
              ? `${selectedCountry.document_type.charAt(0).toUpperCase()}${selectedCountry.document_type.slice(1)} photo`
              : "Passport photo"}{" "}
            sized to {selectedCountry.dimensions} px for {selectedCountry.country_name}
          </span>
        </p>
      </div>

      {/* CARD 2 — Upload Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xs">
        <div>
          <label htmlFor="photo-file-input" className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
            Upload or Take Your Photo
          </label>

          {!preview ? (
            <div
              className={`border-2 border-dashed rounded-2xl p-5 sm:p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-lime-700 bg-lime-50/70"
                  : "border-slate-300 hover:border-lime-700 bg-slate-50/60 hover:bg-slate-50"
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              aria-label="Upload photo area. Drag and drop a photo or press enter to browse files."
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-600" aria-hidden="true">
                <ImagePlus className="w-6 h-6 sm:w-7 sm:h-7 text-lime-800" />
              </div>

              <p className="text-slate-900 font-bold text-sm sm:text-lg mb-1">
                Tap to upload photo or take picture
              </p>
              <p className="text-slate-700 text-xs sm:text-sm mb-2 font-medium">
                Drag &amp; drop from your device · JPEG, PNG, or WebP (up to 20 MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photo Preview Card */}
              <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center">
                <div className="relative max-h-64 sm:max-h-80 w-auto rounded-xl overflow-hidden border border-slate-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Uploaded passport photo preview"
                    className="max-h-64 sm:max-h-80 w-auto object-contain rounded-xl"
                  />
                </div>

                {compressionInfo && compressionInfo.compressed && (
                  <div className="mt-2 text-xs text-slate-700 bg-lime-50 border border-lime-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-[#4D7C0F]" aria-hidden="true" />
                    <span>Pre-compressed for upload ({compressionInfo.finalSizeKB} KB)</span>
                  </div>
                )}

                {!isProcessing && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-300 transition-colors focus-ring cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Change Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-800 font-semibold text-xs px-3.5 py-2 rounded-lg border border-red-300 transition-colors focus-ring cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={onFileChange}
            className="sr-only"
            id="photo-file-input"
            aria-label="Select photo file from device"
          />
        </div>

        {/* Action CTA Button */}
        {file && !isProcessing && (
          <div ref={processBtnRef} className="pt-5 sm:pt-6 border-t border-slate-100 mt-5 sm:mt-6">
            <button
              className="w-full inline-flex items-center justify-center gap-2 bg-[#4D7C0F] hover:bg-[#3F650C] !text-white text-white font-bold text-sm sm:text-base py-3.5 sm:py-4 rounded-xl transition-colors text-center shadow-xs focus-ring cursor-pointer"
              onClick={() => processPhoto()}
            >
              <Zap className="w-5 h-5 text-lime-300 shrink-0" aria-hidden="true" />
              <span className="truncate">
                Process for {selectedCountry.country_name}
              </span>
              <ArrowRight className="w-4 h-4 ml-1 shrink-0" aria-hidden="true" />
            </button>
            <p className="text-center text-xs text-slate-700 mt-2.5 font-medium">
              ⚡ 10-second biometric crop &amp; verify · Single digital file + 6×4″ printable sheet
            </p>
          </div>
        )}

        {/* Photo Guidelines Checklist */}
        <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100 text-xs text-slate-700">
          <p className="font-bold text-slate-900 mb-2">
            Quick Acceptance Tips:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-lime-700 shrink-0" aria-hidden="true" />
              <span>Look straight into camera, neutral face</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-lime-700 shrink-0" aria-hidden="true" />
              <span>Eyes open, mouth closed, no red-eye</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-lime-700 shrink-0" aria-hidden="true" />
              <span>Even lighting on face &amp; shoulders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-lime-700 shrink-0" aria-hidden="true" />
              <span>Plain background (our AI will auto-clean)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 10-SECOND PROCESSING MODAL OVERLAY */}
      {isProcessing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="processing-modal-title"
          aria-describedby="processing-modal-desc"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in"
        >
          <div className="bg-white border border-slate-200 max-w-md w-full max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-8 text-center shadow-2xl">
            {/* Screen reader live status announcement */}
            <div aria-live="polite" className="sr-only">
              Processing passport photo: {PROCESSING_STEPS[processingStepIndex].text} {processingProgress}% completed, {countdown} seconds remaining.
            </div>

            {/* Countdown circle */}
            <div className="relative mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-lime-50 border border-lime-200 flex items-center justify-center mb-4">
              <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-[#4D7C0F]" aria-hidden="true" />
              <span className="absolute -bottom-1 -right-1 font-mono text-xs font-extrabold bg-[#4D7C0F] text-white px-1.5 py-0.5 rounded-full" aria-hidden="true">
                {countdown}s
              </span>
            </div>

            <h2
              id="processing-modal-title"
              className="text-base sm:text-xl font-bold text-slate-900 mb-1"
            >
              Processing Passport Photo
            </h2>
            <p id="processing-modal-desc" className="text-xs text-slate-700 font-mono mb-5 font-semibold">
              {selectedCountry.country_name} · Format: {selectedCountry.dimensions} px
            </p>

            {/* Progress Bar */}
            <div className="space-y-2 mb-6">
              <div
                role="progressbar"
                aria-valuenow={processingProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Passport photo processing progress"
                className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200"
              >
                <div
                  className="bg-[#4D7C0F] h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-700 font-semibold">
                <span>{processingProgress}% Complete</span>
                <span>{countdown}s remaining</span>
              </div>
            </div>

            {/* Animated Progress Steps */}
            <div className="bg-slate-50 p-4 rounded-xl text-left space-y-2.5 border border-slate-200 text-xs">
              {PROCESSING_STEPS.map((step, idx) => {
                const isDone = processingProgress >= step.progress;
                const isCurrent = processingStepIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 transition-colors ${
                      isDone
                        ? "text-lime-900 font-bold"
                        : isCurrent
                        ? "text-[#365314] font-bold"
                        : "text-slate-500 font-medium"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                    ) : isCurrent ? (
                      <span className="w-4 h-4 rounded-full border-2 border-[#4D7C0F] border-t-transparent animate-spin shrink-0" aria-hidden="true" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-400 shrink-0" aria-hidden="true" />
                    )}
                    <span>{step.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
