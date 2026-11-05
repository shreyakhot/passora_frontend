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

const CROP_ONLY_PROCESSING_STEPS = PROCESSING_STEPS.map((step, idx) =>
  idx === 1 ? { ...step, text: "Checking your background (left unedited)…" } : step
);

// Countries whose passport authority rejects digitally altered photos. The
// maker offers crop-only processing there and turns it on by default.
// US: travel.state.gov — "Do not change your photo using computer software,
// phone apps or filters."
const CROP_ONLY_COUNTRY_CODES = new Set(["US"]);

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

  // Crop-only (keep the original background) is offered where edited photos
  // are rejected, and is on by default there.
  const cropOnlyAvailable = CROP_ONLY_COUNTRY_CODES.has(selectedCountry.country_code);
  const [cropOnlyPreferred, setCropOnlyPreferred] = useState(true);
  const cropOnly = cropOnlyAvailable && cropOnlyPreferred;
  const processingSteps = cropOnly ? CROP_ONLY_PROCESSING_STEPS : PROCESSING_STEPS;

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
        formData.append("background_mode", cropOnly ? "keep" : "auto");

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
          background_mode: cropOnly ? "keep" : "auto",
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
      cropOnly,
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

  const documentTypeLabel = selectedCountry.document_type
    ? `${selectedCountry.document_type.charAt(0).toUpperCase()}${selectedCountry.document_type.slice(1)} photo`
    : "Passport photo";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            className="cursor-pointer rounded-lg p-1 text-red-700 hover:text-red-900 focus-ring"
            onClick={() => setError(null)}
            aria-label="Dismiss error notification"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-lift">
        {/* Studio header */}
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/70 px-5 py-3 sm:px-6">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          </div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <Zap className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            Photo studio · ~10 seconds
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          {/* STEP 1 — Country Selector */}
          <div>
            <label
              htmlFor="country-search-trigger"
              className="mb-2.5 flex items-center gap-2 text-sm font-bold text-ink-950"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-950 text-[11px] font-bold text-white" aria-hidden="true">
                1
              </span>
              Choose your country
            </label>

            <div className="relative" ref={countryBoxRef}>
              <button
                id="country-search-trigger"
                type="button"
                disabled={isProcessing}
                onClick={() => (isCountryOpen ? setIsCountryOpen(false) : openCountryDropdown())}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left transition-all focus-ring disabled:cursor-not-allowed disabled:opacity-60 ${
                  isCountryOpen ? "border-brand-500 ring-4 ring-brand-500/15" : "border-ink-200 hover:border-brand-300"
                }`}
                aria-haspopup="listbox"
                aria-expanded={isCountryOpen}
                aria-controls="country-listbox"
                aria-label={`Selected country: ${selectedCountry.country_name}, dimensions ${selectedCountry.dimensions} pixels. Click to change.`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-2xl leading-none" aria-hidden="true">
                    {countryFlag(selectedCountry.country_code)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-bold text-ink-950">
                      {selectedCountry.country_name}{" "}
                      <span className="font-medium text-ink-400">({selectedCountry.country_code})</span>
                    </span>
                    <span className="block font-mono text-xs font-medium text-ink-500">
                      {selectedCountry.dimensions} px
                    </span>
                  </span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-ink-500 transition-transform ${isCountryOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {isCountryOpen && (
                <div
                  id="country-listbox"
                  className="absolute z-30 mt-2 flex w-full flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift animate-fade-in"
                  role="listbox"
                  aria-label="Supported countries and dimensions"
                >
                  <div className="shrink-0 border-b border-ink-100 p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                      <input
                        ref={countrySearchRef}
                        id="country-search-input"
                        type="text"
                        value={countryQuery}
                        onChange={(e) => setCountryQuery(e.target.value)}
                        placeholder="Search country…"
                        className="field min-h-0 py-2.5 pl-9 text-sm"
                        aria-label="Filter countries list"
                      />
                    </div>
                  </div>

                  <ul className="m-0 max-h-60 list-none overflow-y-auto p-1.5 sm:max-h-72" role="presentation">
                    {filteredCountries.length === 0 && (
                      <li className="px-4 py-4 text-center text-sm text-ink-600">
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
                            className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                              active ? "bg-brand-50 font-bold text-brand-800" : "font-medium text-ink-800 hover:bg-ink-50"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span className="shrink-0 text-base leading-none" aria-hidden="true">
                                {countryFlag(c.country_code)}
                              </span>
                              <span className="truncate">{c.country_name}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <span className="font-mono text-xs text-ink-500">{c.dimensions}px</span>
                              {active && <Check className="h-4 w-4 text-brand-600" aria-hidden="true" />}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-ink-500">
              <Globe className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
              <span>
                {documentTypeLabel} sized to {selectedCountry.dimensions} px for {selectedCountry.country_name}
              </span>
            </p>

            {cropOnlyAvailable && (
              <div className="mt-3 rounded-2xl border border-ink-200 bg-ink-50/60 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm mt-0.5"
                    checked={cropOnlyPreferred}
                    disabled={isProcessing}
                    onChange={(e) => setCropOnlyPreferred(e.target.checked)}
                    aria-describedby="crop-only-help"
                  />
                  <span className="text-sm font-bold text-ink-950">
                    Crop only: keep my original background
                    <span className="ml-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      Recommended
                    </span>
                  </span>
                </label>
                <p id="crop-only-help" className="mt-2 pl-7 text-xs font-medium leading-relaxed text-ink-600">
                  {cropOnly
                    ? `The ${selectedCountry.country_name} passport office rejects photos changed with software, so we only crop and size your photo. Take it against a plain white or off-white wall in even light.`
                    : `We will replace the background if it is not plain. The ${selectedCountry.country_name} passport office says not to change photos with software, so an edited background can be rejected.`}
                </p>
              </div>
            )}
          </div>

          {/* STEP 2 — Upload */}
          <div>
            <label htmlFor="photo-file-input" className="mb-2.5 flex items-center gap-2 text-sm font-bold text-ink-950">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-950 text-[11px] font-bold text-white" aria-hidden="true">
                2
              </span>
              Upload or take your photo
            </label>

            {!preview ? (
              <div
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-all sm:p-10 ${
                  isDragging
                    ? "border-brand-500 bg-brand-50"
                    : "border-ink-200 bg-ink-50/60 hover:border-brand-400 hover:bg-brand-50/50"
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
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white transition-transform group-hover:-translate-y-0.5 sm:h-16 sm:w-16"
                  aria-hidden="true"
                >
                  <ImagePlus className="h-7 w-7" />
                </div>
                <p className="font-display text-base font-extrabold text-ink-950 sm:text-lg">
                  Drop your photo here, or <span className="text-brand-600 underline decoration-brand-300 decoration-2 underline-offset-4">browse</span>
                </p>
                <p className="mt-1.5 text-xs font-medium text-ink-500 sm:text-sm">
                  JPEG, PNG or WebP · up to 20 MB · tap to use your camera on mobile
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-2xl border border-ink-200 bg-ink-50 p-4">
                <div className="relative overflow-hidden rounded-xl border border-ink-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Uploaded passport photo preview"
                    className="max-h-64 w-auto rounded-xl object-contain sm:max-h-80"
                  />
                </div>

                {compressionInfo && compressionInfo.compressed && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Pre-compressed for upload ({compressionInfo.finalSizeKB} KB)</span>
                  </div>
                )}

                {!isProcessing && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink-800 transition-colors hover:border-brand-300 hover:text-brand-700 focus-ring"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Change photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 focus-ring"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
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
            <div ref={processBtnRef}>
              <button className="btn-brand btn-lg w-full" onClick={() => processPhoto()}>
                <Zap className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="truncate">Process for {selectedCountry.country_name}</span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
              <p className="mt-2.5 text-center text-xs font-medium text-ink-500">
                10-second crop &amp; check · digital file + 6×4″ printable sheet
              </p>
            </div>
          )}

          {/* Quick tips */}
          <div className="rounded-2xl bg-ink-50 p-4">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-500">Quick tips</p>
            <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 text-xs text-ink-700 sm:grid-cols-2 sm:text-sm">
              {[
                "Look straight at the camera, neutral face",
                "Eyes open, mouth closed, no red-eye",
                "Even lighting on face & shoulders",
                cropOnly
                  ? "Plain white or off-white wall behind you"
                  : "Plain background (we clean it up)",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white" aria-hidden="true">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/75 p-4 animate-fade-in"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-ink-200 bg-white p-6 text-center shadow-2xl sm:p-8">
            {/* Screen reader live status announcement */}
            <div aria-live="polite" className="sr-only">
              Processing passport photo: {processingSteps[processingStepIndex].text} {processingProgress}% completed,{" "}
              {countdown} seconds remaining.
            </div>

            {/* Scanning visual */}
            <div className="relative mx-auto mb-5 h-24 w-20 overflow-hidden rounded-2xl border border-brand-200 bg-brand-50" aria-hidden="true">
              <Camera className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-brand-600" />
              <span className="absolute left-0 right-0 h-0.5 bg-brand-500 animate-scan" />
              <span className="absolute -bottom-0 right-0 rounded-tl-lg bg-brand-600 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                {countdown}s
              </span>
            </div>

            <h2 id="processing-modal-title" className="text-xl font-extrabold text-ink-950 sm:text-2xl">
              Making your photo
            </h2>
            <p id="processing-modal-desc" className="mb-6 mt-1 font-mono text-xs font-semibold text-ink-500">
              {selectedCountry.country_name} · {selectedCountry.dimensions} px
            </p>

            {/* Progress Bar */}
            <div className="mb-6 space-y-2">
              <div
                role="progressbar"
                aria-valuenow={processingProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Passport photo processing progress"
                className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100"
              >
                <div
                  className="h-2.5 rounded-full bg-brand-600 transition-all duration-300 ease-out"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-xs font-semibold text-ink-500">
                <span>{processingProgress}%</span>
                <span>{countdown}s remaining</span>
              </div>
            </div>

            {/* Progress Steps */}
            <ol className="m-0 list-none space-y-2.5 rounded-2xl bg-ink-50 p-4 text-left text-xs sm:text-sm">
              {processingSteps.map((step, idx) => {
                const isDone = processingProgress >= step.progress;
                const isCurrent = processingStepIndex === idx;

                return (
                  <li
                    key={idx}
                    className={`flex items-center gap-2.5 transition-colors ${
                      isDone ? "font-semibold text-ink-900" : isCurrent ? "font-bold text-brand-700" : "font-medium text-ink-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    ) : isCurrent ? (
                      <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" aria-hidden="true" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border border-ink-300" aria-hidden="true" />
                    )}
                    <span>{step.text}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
