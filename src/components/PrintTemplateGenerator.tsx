"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  Upload,
  Download,
  Printer,
  Sparkles,
  RotateCcw,
  Grid,
  FileText,
  Scissors,
  Copy,
  CheckCheck,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site";

export interface PaperSizeOption {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
  popular?: boolean;
}

export interface PhotoStandardOption {
  id: string;
  name: string;
  country: string;
  flag: string;
  widthMm: number;
  heightMm: number;
  spec: string;
}

export const PAPER_SIZES: PaperSizeOption[] = [
  {
    id: "4x6",
    name: "4 × 6 inches (10 × 15 cm)",
    widthMm: 152.4,
    heightMm: 101.6,
    description: "Standard photo print size. Available at most photo kiosks and print shops.",
    popular: true,
  },
  {
    id: "5x7",
    name: "5 × 7 inches (13 × 18 cm)",
    widthMm: 177.8,
    heightMm: 127.0,
    description: "Medium photo print format.",
  },
  {
    id: "3.5x5",
    name: "3.5 × 5 inches (9 × 13 cm)",
    widthMm: 127.0,
    heightMm: 88.9,
    description: "Compact photo print size.",
  },
  {
    id: "a4",
    name: "A4 (210 × 297 mm)",
    widthMm: 297.0,
    heightMm: 210.0,
    description: "Standard home & office printer paper. Holds up to 18–24 photos.",
  },
  {
    id: "letter",
    name: "US Letter (8.5 × 11 in)",
    widthMm: 279.4,
    heightMm: 215.9,
    description: "Standard North American paper size.",
  },
];

export const PHOTO_STANDARDS: PhotoStandardOption[] = [
  {
    id: "35x45",
    name: "International Standard (35 × 45 mm)",
    country: "Schengen Area, UK, India, Australia & many more",
    flag: "🌍",
    widthMm: 35,
    heightMm: 45,
    spec: "35 × 45 mm",
  },
  {
    id: "51x51",
    name: "US Visa & Passport / OCI",
    country: "United States & India OCI",
    flag: "🇺🇸",
    widthMm: 50.8,
    heightMm: 50.8,
    spec: "2 × 2 inches (51 × 51 mm)",
  },
  {
    id: "50x70",
    name: "Canada Passport",
    country: "Canada",
    flag: "🇨🇦",
    widthMm: 50,
    heightMm: 70,
    spec: "50 × 70 mm",
  },
  {
    id: "33x48",
    name: "China Passport & Visa",
    country: "China",
    flag: "🇨🇳",
    widthMm: 33,
    heightMm: 48,
    spec: "33 × 48 mm",
  },
];

export interface PrintTemplateGeneratorProps {
  initialPaperSize?: string;
  initialPhotoStandard?: string;
  initialPhotoCount?: number;
  initialImageUrl?: string;
  showInstructions?: boolean;
  className?: string;
}

export default function PrintTemplateGenerator({
  initialPaperSize = "4x6",
  initialPhotoStandard = "35x45",
  initialPhotoCount,
  initialImageUrl,
  className = "",
}: PrintTemplateGeneratorProps) {
  // State: Initial null unless an initialImageUrl is explicitly provided
  const [imageSrc, setImageSrc] = useState<string | null>(initialImageUrl || null);
  const [prevInitialImageUrl, setPrevInitialImageUrl] = useState(initialImageUrl);
  if (initialImageUrl !== prevInitialImageUrl) {
    setPrevInitialImageUrl(initialImageUrl);
    setImageSrc(initialImageUrl || null);
  }

  const [paperSizeId, setPaperSizeId] = useState<string>(initialPaperSize);
  const [photoStandardId, setPhotoStandardId] = useState<string>(initialPhotoStandard);
  const [customPhotoWidth, setCustomPhotoWidth] = useState<number>(35);
  const [customPhotoHeight, setCustomPhotoHeight] = useState<number>(45);

  const [activeTab, setActiveTab] = useState<"preset" | "grid" | "guides">("preset");
  const [guideStyle, setGuideStyle] = useState<"corner" | "dashed" | "solid" | "none">("corner");
  const [gapMm, setGapMm] = useState<number>(2.5);
  const [marginMm, setMarginMm] = useState<number>(4);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [photoCountOverride, setPhotoCountOverride] = useState<number | null>(initialPhotoCount || null);
  const [exportFormat, setExportFormat] = useState<"jpeg" | "png">("jpeg");

  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Active configurations
  const currentPaper = PAPER_SIZES.find((p) => p.id === paperSizeId) || PAPER_SIZES[0];
  const currentPhoto = PHOTO_STANDARDS.find((p) => p.id === photoStandardId) || PHOTO_STANDARDS[0];

  const photoWidthMm = photoStandardId === "custom" ? customPhotoWidth : currentPhoto.widthMm;
  const photoHeightMm = photoStandardId === "custom" ? customPhotoHeight : currentPhoto.heightMm;

  // Compute paper dimensions based on orientation
  const rawPaperWidth = currentPaper.widthMm;
  const rawPaperHeight = currentPaper.heightMm;
  const paperWidthMm =
    orientation === "landscape"
      ? Math.max(rawPaperWidth, rawPaperHeight)
      : Math.min(rawPaperWidth, rawPaperHeight);
  const paperHeightMm =
    orientation === "landscape"
      ? Math.min(rawPaperWidth, rawPaperHeight)
      : Math.max(rawPaperWidth, rawPaperHeight);

  // Compute grid calculation (300 DPI)
  const DPI = 300;
  const mmToPx = (mm: number) => (mm * DPI) / 25.4;

  const paperWidthPx = Math.round(mmToPx(paperWidthMm));
  const paperHeightPx = Math.round(mmToPx(paperHeightMm));
  const photoWidthPx = Math.round(mmToPx(photoWidthMm));
  const photoHeightPx = Math.round(mmToPx(photoHeightMm));
  const gapPx = Math.round(mmToPx(gapMm));
  const marginPx = Math.round(mmToPx(marginMm));

  // Calculate maximum columns and rows that fit comfortably
  const availableWidth = paperWidthPx - 2 * marginPx;
  const availableHeight = paperHeightPx - 2 * marginPx;

  const maxCols = Math.max(1, Math.floor((availableWidth + gapPx) / (photoWidthPx + gapPx)));
  const maxRows = Math.max(1, Math.floor((availableHeight + gapPx) / (photoHeightPx + gapPx)));
  const maxCapacity = maxCols * maxRows;

  const activePhotoCount = photoCountOverride
    ? Math.min(photoCountOverride, maxCapacity)
    : maxCapacity;

  // Main Canvas Rendering Function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high-resolution internal dimensions
    canvas.width = paperWidthPx;
    canvas.height = paperHeightPx;

    // 1. Fill background (pure photo-paper white)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, paperWidthPx, paperHeightPx);

    // 2. Determine grid distribution
    let cols = maxCols;
    let rows = Math.ceil(activePhotoCount / cols);
    if (rows > maxRows) {
      rows = maxRows;
      cols = Math.ceil(activePhotoCount / rows);
    }

    const gridWidth = cols * photoWidthPx + (cols - 1) * gapPx;
    const gridHeight = rows * photoHeightPx + (rows - 1) * gapPx;

    // Center grid on sheet
    const startX = Math.round((paperWidthPx - gridWidth) / 2);
    const startY = Math.round((paperHeightPx - gridHeight) / 2);

    const img = imageElementRef.current;

    let placed = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (placed >= activePhotoCount) break;

        const x = startX + c * (photoWidthPx + gapPx);
        const y = startY + r * (photoHeightPx + gapPx);

        // Draw Photo Slot
        if (img) {
          ctx.save();
          // Clip to photo box
          ctx.beginPath();
          ctx.rect(x, y, photoWidthPx, photoHeightPx);
          ctx.clip();

          // Calculate aspect-fill scaling
          const imgAspect = img.width / img.height;
          const targetAspect = photoWidthPx / photoHeightPx;
          let drawW = photoWidthPx;
          let drawH = photoHeightPx;
          let drawX = x;
          let drawY = y;

          if (imgAspect > targetAspect) {
            drawW = photoHeightPx * imgAspect;
            drawX = x - (drawW - photoWidthPx) / 2;
          } else {
            drawH = photoWidthPx / imgAspect;
            drawY = y - (drawH - photoHeightPx) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();
        } else {
          // Empty slot placeholder
          ctx.fillStyle = "#F8FAFC";
          ctx.fillRect(x, y, photoWidthPx, photoHeightPx);
          ctx.strokeStyle = "#CBD5E1";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
        }

        // Draw Cutting Guides
        if (guideStyle === "solid") {
          ctx.strokeStyle = "#CBD5E1";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
        } else if (guideStyle === "dashed") {
          ctx.save();
          ctx.strokeStyle = "#94A3B8";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
          ctx.restore();
        } else if (guideStyle === "corner") {
          // Precise L-shaped corner crop marks
          const markLen = Math.round(mmToPx(3.5)); // 3.5mm mark
          ctx.save();
          ctx.strokeStyle = "#64748B";
          ctx.lineWidth = 1.5;

          // Top-Left
          ctx.beginPath();
          ctx.moveTo(x, y + markLen);
          ctx.lineTo(x, y);
          ctx.lineTo(x + markLen, y);
          ctx.stroke();

          // Top-Right
          ctx.beginPath();
          ctx.moveTo(x + photoWidthPx - markLen, y);
          ctx.lineTo(x + photoWidthPx, y);
          ctx.lineTo(x + photoWidthPx, y + markLen);
          ctx.stroke();

          // Bottom-Left
          ctx.beginPath();
          ctx.moveTo(x, y + photoHeightPx - markLen);
          ctx.lineTo(x, y + photoHeightPx);
          ctx.lineTo(x + markLen, y + photoHeightPx);
          ctx.stroke();

          // Bottom-Right
          ctx.beginPath();
          ctx.moveTo(x + photoWidthPx - markLen, y + photoHeightPx);
          ctx.lineTo(x + photoWidthPx, y + photoHeightPx);
          ctx.lineTo(x + photoWidthPx, y + photoHeightPx - markLen);
          ctx.stroke();

          ctx.restore();
        }

        placed++;
      }
    }

    // Metric Calibration Footer Label
    ctx.save();
    ctx.fillStyle = "#94A3B8";
    ctx.font = `${Math.round(mmToPx(2.2))}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    const labelText = `${SITE_DOMAIN} · ${currentPaper.name} (300 DPI) · ${photoWidthMm}×${photoHeightMm} mm (${activePhotoCount} Photos) · Print at 100% Scale`;
    ctx.fillText(labelText, paperWidthPx / 2, paperHeightPx - Math.round(mmToPx(2)));
    ctx.restore();
  }, [
    paperWidthPx,
    paperHeightPx,
    photoWidthPx,
    photoHeightPx,
    gapPx,
    maxCols,
    maxRows,
    activePhotoCount,
    guideStyle,
    currentPaper.name,
    photoWidthMm,
    photoHeightMm,
  ]);

  // Load image object whenever source changes
  useEffect(() => {
    if (!imageSrc) {
      imageElementRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageElementRef.current = img;
      renderCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc, renderCanvas]);

  useEffect(() => {
    if (imageSrc) {
      renderCanvas();
    }
  }, [renderCanvas, imageSrc]);

  // File Upload Handlers
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPEG, PNG, or WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);
    };
    reader.readAsDataURL(file);
  };

  // Export & Download
  const handleDownload = (format: "jpeg" | "png" = exportFormat) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);

    setTimeout(() => {
      const mime = format === "jpeg" ? "image/jpeg" : "image/png";
      const quality = format === "jpeg" ? 0.98 : undefined;
      const dataUrl = canvas.toDataURL(mime, quality);

      const link = document.createElement("a");
      const filename = `passport-photo-print-sheet-${photoWidthMm}x${photoHeightMm}mm-${currentPaper.id}-${activePhotoCount}pcs.${format === "jpeg" ? "jpg" : "png"}`;
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
    }, 150);
  };

  // Direct Browser Print
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to open the print dialog.");
      return;
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 1.0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Passport Photo Sheet - ${SITE_NAME}</title>
          <style>
            @page {
              size: ${paperWidthMm}mm ${paperHeightMm}mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
            }
            img {
              width: ${paperWidthMm}mm;
              height: ${paperHeightMm}mm;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }, "image/png");
    } catch {
      alert("Copying image directly is not supported in this browser. Please use the Download button.");
    }
  };

  // Reset to initial state
  const handleReset = () => {
    setImageSrc(null);
    setPhotoCountOverride(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================================
  // VIEW 1: UPLOAD ONLY HERO (Zero scroll, high clarity)
  // =========================================================================
  if (!imageSrc) {
    return (
      <div className={`w-full max-w-3xl mx-auto ${className}`}>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-lift">
          {/* Tool header */}
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/70 px-5 py-3 sm:px-6">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            </div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
              <Printer className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              Print sheet studio · 300 DPI
            </p>
          </div>

          <div className="p-5 sm:p-7">
            {/* Step label */}
            <div className="mb-2.5 flex items-center gap-2 text-sm font-bold text-ink-950">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-950 text-[11px] font-bold text-white" aria-hidden="true">
                1
              </span>
              <span className="sr-only">Step 1: </span>
              <span>Upload Your Passport Photo</span>
              <Sparkles className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            </div>

            {/* Big Interactive Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-all sm:p-10 ${
                isDragging
                  ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/15"
                  : "border-ink-200 bg-ink-50/60 hover:border-brand-400 hover:bg-brand-50/50"
              }`}
            >
              {/* Central Upload Graphic */}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white transition-transform group-hover:-translate-y-0.5 sm:h-16 sm:w-16">
                <Upload className="h-7 w-7" />
              </div>

              <h3 className="mb-2 text-xl font-extrabold text-ink-950 sm:text-2xl">
                Click or Drag &amp; Drop to Upload
              </h3>
              <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-ink-600">
                Upload your cropped passport photo. We will instantly tile it onto a 300 DPI printable 4×6″ or A4 sheet with cut lines.
              </p>

              {/* Primary Upload CTA Button */}
              <div className="mx-auto flex max-w-xs items-center justify-center">
                <button
                  type="button"
                  className="btn-brand btn-lg w-full"
                >
                  <Upload className="h-5 w-5" />
                  <span>Choose Photo from Device</span>
                </button>
              </div>

              <div className="mt-4 text-xs font-medium text-ink-500">
                Supports JPG, PNG, WebP · 100% In-Browser &amp; Private · No Image Sent to Any Server
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="surface flex items-start gap-3 p-4 sm:p-5">
            <div className="icon-tile h-10 w-10 rounded-xl">
              <Printer className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-ink-950">True 300 DPI Sizing</h4>
              <p className="mt-1 text-xs leading-snug text-ink-600">
                Millimeter-perfect 35×45 mm, US 2×2″ &amp; other common photo sizes.
              </p>
            </div>
          </div>

          <div className="surface flex items-start gap-3 p-4 sm:p-5">
            <div className="icon-tile h-10 w-10 rounded-xl">
              <Scissors className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-ink-950">Corner Crop Marks</h4>
              <p className="mt-1 text-xs leading-snug text-ink-600">
                Subtle corner guides make cutting with scissors clean and easy.
              </p>
            </div>
          </div>

          <div className="surface flex items-start gap-3 p-4 sm:p-5">
            <div className="icon-tile h-10 w-10 rounded-xl">
              <Sparkles className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-ink-950">Print Cheaply Anywhere</h4>
              <p className="mt-1 text-xs leading-snug text-ink-600">
                Order a standard 4×6″ photo print instead of a pricier passport photo service.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Shared option-card styles (selected = brand-50 + brand-600 ring)
  const optionSelected = "border-brand-600 bg-brand-50 ring-1 ring-brand-600";
  const optionIdle = "border-ink-200 bg-white hover:border-brand-300";
  const tabSelected = "bg-brand-600 text-white";
  const tabIdle = "text-ink-600 hover:bg-white hover:text-ink-950";

  // =========================================================================
  // VIEW 2: COMPACT, LOW-SCROLL STUDIO WORKSPACE (After upload)
  // =========================================================================
  return (
    <div className={`w-full ${className}`}>
      {/* Hidden File Input for Image Replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-lift">
        {/* Tool header */}
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/70 px-5 py-3 sm:px-6">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          </div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <Printer className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            Print sheet studio · 300 DPI
          </p>
        </div>

        {/* Main Studio Grid (Side-by-Side on desktop for LOW SCROLL) */}
        <div className="grid items-stretch lg:grid-cols-12">
          {/* =========================================================================
              STAGE 1: LIVE CANVAS PREVIEW (Sticky, compact, responsive)
             ========================================================================= */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-ink-950 p-3 sm:p-5 lg:col-span-7">

            {/* Canvas Top Status Bar */}
            <div className="relative mb-3 flex flex-col justify-between gap-2.5 border-b border-white/10 pb-3 text-xs text-ink-300 sm:flex-row sm:items-center">
              {/* Sheet & DPI info */}
              <div className="flex w-full items-center justify-between gap-2 font-mono text-[11px] sm:w-auto sm:justify-start">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />
                  <span className="whitespace-nowrap font-semibold text-white">300 DPI Live</span>
                  <span className="text-ink-600">|</span>
                  <span className="truncate text-ink-300">
                    {currentPaper.id === "4x6" ? "4×6″" : currentPaper.name.split("(")[0]}
                  </span>
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-bold text-brand-200 sm:hidden">
                  {activePhotoCount} Photos
                </span>
              </div>

              {/* Quick Canvas & Photo Action Controls */}
              <div className="flex w-full items-center justify-between gap-1.5 sm:w-auto sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOrientation(orientation === "landscape" ? "portrait" : "landscape")}
                  className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-ink-100 transition-colors hover:bg-white/10 sm:min-h-9 sm:flex-initial"
                  title="Rotate Sheet Orientation"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="capitalize">{orientation}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-brand-400/40 bg-brand-500/15 px-3 text-xs font-bold text-brand-200 transition-colors hover:bg-brand-500/25 sm:min-h-9 sm:flex-initial"
                  title="Upload another photo"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Change Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-ink-300 transition-colors hover:bg-white/10 hover:text-white sm:min-h-9 sm:min-w-9"
                  title="Reset back to upload screen"
                  aria-label="Reset back to upload screen"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Live Canvas Area */}
            <div className="relative flex max-h-[380px] min-h-[220px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 p-2 sm:max-h-[520px] sm:min-h-[320px] sm:p-4">
              <div className="relative flex max-h-[460px] max-w-full items-center justify-center shadow-2xl transition-all">
                <canvas
                  ref={canvasRef}
                  className="h-auto max-h-[360px] w-auto max-w-full rounded-sm bg-white object-contain shadow-xl ring-1 ring-white/20 sm:max-h-[440px]"
                  style={{ imageRendering: "crisp-edges" }}
                />
              </div>
            </div>

            {/* Canvas Footer Legend */}
            <div className="relative mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-ink-300 sm:text-xs">
              <span className="truncate">
                Fits <strong className="text-white">{activePhotoCount}</strong> {photoWidthMm}×{photoHeightMm}mm photos
              </span>
              <span className="ml-2 shrink-0 font-mono text-ink-400">
                Margin: {marginMm}mm · Gap: {gapMm}mm
              </span>
            </div>
          </div>

          {/* =========================================================================
              STAGE 2: COMPACT TABBED CONTROL PANEL (Zero-scroll editing)
             ========================================================================= */}
          <div className="border-t border-ink-100 p-4 sm:p-6 lg:col-span-5 lg:border-l lg:border-t-0">
            {/* Segmented Tab Navigation */}
            <div className="mb-5 flex gap-1 rounded-2xl border border-ink-200 bg-ink-50 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("preset")}
                className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-bold transition-all ${
                  activeTab === "preset" ? tabSelected : tabIdle
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>1. Paper</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("grid")}
                className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-bold transition-all ${
                  activeTab === "grid" ? tabSelected : tabIdle
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>2. Layout</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("guides")}
                className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-bold transition-all ${
                  activeTab === "guides" ? tabSelected : tabIdle
                }`}
              >
                <Scissors className="h-3.5 w-3.5" />
                <span>3. Guides</span>
              </button>
            </div>

            {/* TAB 1: PAPER & STANDARD */}
            {activeTab === "preset" && (
              <div className="space-y-5 animate-fade-in">
                {/* Paper Format Selection */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-500">
                    Paper Format (Sheet Size)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAPER_SIZES.map((paper) => (
                      <button
                        key={paper.id}
                        type="button"
                        onClick={() => setPaperSizeId(paper.id)}
                        className={`min-h-11 cursor-pointer rounded-xl border p-2.5 text-left transition-all ${
                          paperSizeId === paper.id ? optionSelected : optionIdle
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-ink-950">
                            {paper.id === "4x6" ? "4 × 6″ (Kiosk)" : paper.name.split("(")[0]}
                          </span>
                          {paper.popular && (
                            <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white">
                              Popular
                            </span>
                          )}
                        </div>
                        <span className="mt-0.5 block font-mono text-[10px] text-ink-500">
                          {paper.widthMm} × {paper.heightMm} mm
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo Standard */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-500">
                    Passport Standard
                  </label>
                  <div className="space-y-1.5">
                    {PHOTO_STANDARDS.map((std) => (
                      <button
                        key={std.id}
                        type="button"
                        onClick={() => setPhotoStandardId(std.id)}
                        className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border p-2 transition-all ${
                          photoStandardId === std.id ? optionSelected : optionIdle
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-base leading-none">{std.flag}</span>
                          <div className="min-w-0 text-left">
                            <span className="block truncate text-xs font-bold text-ink-950">
                              {std.name}
                            </span>
                            <span className="block truncate text-[10px] text-ink-500">
                              {std.country}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-md bg-ink-100 px-2 py-0.5 font-mono text-[11px] font-bold text-ink-700">
                          {std.spec}
                        </span>
                      </button>
                    ))}

                    {/* Custom Option */}
                    <button
                      type="button"
                      onClick={() => setPhotoStandardId("custom")}
                      className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border p-2 pl-3 transition-all ${
                        photoStandardId === "custom" ? optionSelected : optionIdle
                      }`}
                    >
                      <span className="text-xs font-bold text-ink-900">Custom Dimensions (mm)</span>
                      <span className="font-mono text-[11px] text-ink-500">
                        {customPhotoWidth} × {customPhotoHeight} mm
                      </span>
                    </button>
                  </div>

                  {/* Custom Width / Height Inputs if active */}
                  {photoStandardId === "custom" && (
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-ink-200 bg-ink-50 p-3">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-bold text-ink-600">Width (mm)</span>
                        <input
                          type="number"
                          min="20"
                          max="100"
                          value={customPhotoWidth}
                          onChange={(e) => setCustomPhotoWidth(Number(e.target.value))}
                          className="field min-h-11 px-3 py-2 font-mono text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-bold text-ink-600">Height (mm)</span>
                        <input
                          type="number"
                          min="20"
                          max="100"
                          value={customPhotoHeight}
                          onChange={(e) => setCustomPhotoHeight(Number(e.target.value))}
                          className="field min-h-11 px-3 py-2 font-mono text-sm"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Next Tab Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab("grid")}
                  className="btn-outline-brand w-full text-sm"
                >
                  <span>Next: Adjust Layout &amp; Copies</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* TAB 2: GRID & SPACING */}
            {activeTab === "grid" && (
              <div className="space-y-5 animate-fade-in">
                {/* Photo Count Override */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink-500">
                      Number of Photos
                    </label>
                    <span className="rounded-full bg-ink-100 px-2 py-0.5 font-mono text-xs font-bold text-ink-900">
                      {activePhotoCount} / {maxCapacity} Max
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[2, 4, 6, maxCapacity].filter((v, i, a) => a.indexOf(v) === i && v <= maxCapacity).map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setPhotoCountOverride(count === maxCapacity ? null : count)}
                        className={`min-h-11 flex-1 cursor-pointer rounded-xl border text-xs font-bold transition-all ${
                          activePhotoCount === count
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-ink-200 bg-white text-ink-700 hover:border-brand-300"
                        }`}
                      >
                        {count} {count === maxCapacity ? "(Max)" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trim Gap between photos */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold text-ink-800">
                      Gap between photos (Cut space)
                    </label>
                    <span className="font-mono text-xs font-bold text-brand-700">{gapMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    value={gapMm}
                    onChange={(e) => setGapMm(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-brand-600"
                  />
                  <div className="flex justify-between font-mono text-[10px] text-ink-500">
                    <span>0 mm (Edge-to-edge)</span>
                    <span>2.5 mm (Standard)</span>
                    <span>8 mm</span>
                  </div>
                </div>

                {/* Safe Print Margins */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold text-ink-800">
                      Safe Print Margins (Outer edge)
                    </label>
                    <span className="font-mono text-xs font-bold text-brand-700">{marginMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    value={marginMm}
                    onChange={(e) => setMarginMm(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-brand-600"
                  />
                  <div className="flex justify-between font-mono text-[10px] text-ink-500">
                    <span>1 mm (Tight)</span>
                    <span>4 mm (Recommended)</span>
                    <span>12 mm</span>
                  </div>
                </div>

                {/* Next Tab Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab("guides")}
                  className="btn-outline-brand w-full text-sm"
                >
                  <span>Next: Cutting Guides &amp; Export</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* TAB 3: GUIDES & EXPORT */}
            {activeTab === "guides" && (
              <div className="space-y-5 animate-fade-in">
                {/* Cutting Guide Style */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-500">
                    Cutting Guide Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "corner", label: "Corner Marks", desc: "Subtle L-crop marks" },
                      { id: "dashed", label: "Dashed Lines", desc: "Scissor cut lines" },
                      { id: "solid", label: "Solid Border", desc: "Thin 1px border" },
                      { id: "none", label: "None", desc: "Clean borderless" },
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setGuideStyle(style.id as typeof guideStyle)}
                        className={`min-h-11 cursor-pointer rounded-xl border p-2.5 text-left transition-all ${
                          guideStyle === style.id ? optionSelected : optionIdle
                        }`}
                      >
                        <span className="block text-xs font-bold text-ink-950">
                          {style.label}
                        </span>
                        <span className="block text-[10px] text-ink-500">
                          {style.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export Format (JPEG vs PNG) */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-500">
                    File Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExportFormat("jpeg")}
                      className={`min-h-11 cursor-pointer rounded-xl border p-2.5 text-left transition-all ${
                        exportFormat === "jpeg" ? optionSelected : optionIdle
                      }`}
                    >
                      <span className="block text-xs font-bold text-ink-950">JPEG (300 DPI)</span>
                      <span className="block text-[10px] text-ink-500">Best for photo kiosks</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExportFormat("png")}
                      className={`min-h-11 cursor-pointer rounded-xl border p-2.5 text-left transition-all ${
                        exportFormat === "png" ? optionSelected : optionIdle
                      }`}
                    >
                      <span className="block text-xs font-bold text-ink-950">PNG (Lossless)</span>
                      <span className="block text-[10px] text-ink-500">Maximum clarity</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 border-t border-ink-100 pt-4">
                  <button
                    type="button"
                    onClick={() => handleDownload(exportFormat)}
                    disabled={isExporting}
                    className="btn-brand btn-lg w-full"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download {exportFormat.toUpperCase()} Sheet (300 DPI)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="btn-outline-brand px-3 text-sm"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print 1:1 Scale</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="btn-outline-brand px-3 text-sm"
                    >
                      {copied ? (
                        <>
                          <CheckCheck className="h-4 w-4 text-emerald-600" />
                          <span className="font-bold text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy Image</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
