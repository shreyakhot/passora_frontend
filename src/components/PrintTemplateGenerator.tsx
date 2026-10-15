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

        {/* Big Interactive Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-white shadow-sm hover:shadow-md ${
            isDragging
              ? "border-[#4D7C0F] bg-lime-50/60 ring-4 ring-lime-100"
              : "border-slate-300 hover:border-lime-500 hover:bg-slate-50/70"
          }`}
        >
          {/* Top subtle badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-xs font-bold mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#4D7C0F]" />
            <span>Step 1: Upload Your Passport Photo</span>
          </div>

          {/* Central Upload Graphic */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-lime-100 to-lime-50 text-[#4D7C0F] border border-lime-200/80 flex items-center justify-center mx-auto mb-5 shadow-xs transition-transform group-hover:scale-105">
            <Upload className="w-9 h-9 stroke-[2.2]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Click or Drag &amp; Drop to Upload
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
            Upload your cropped passport photo. We will instantly tile it onto a 300 DPI printable 4×6″ or A4 sheet with cut lines.
          </p>

          {/* Primary Upload CTA Button */}
          <div className="flex items-center justify-center max-w-xs mx-auto">
            <button
              type="button"
              className="w-full px-7 py-3.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Choose Photo from Device</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 mt-4">
            Supports JPG, PNG, WebP · 100% In-Browser &amp; Private · No Image Sent to Any Server
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-lime-100 text-[#4D7C0F] flex items-center justify-center shrink-0 mt-0.5">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">True 300 DPI Sizing</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Millimeter-perfect 35×45 mm, US 2×2″ &amp; other common photo sizes.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-lime-100 text-[#4D7C0F] flex items-center justify-center shrink-0 mt-0.5">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Corner Crop Marks</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Subtle corner guides make cutting with scissors clean and easy.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-lime-100 text-[#4D7C0F] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Print Cheaply Anywhere</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Order a standard 4×6″ photo print instead of a pricier passport photo service.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Main Studio Grid (Side-by-Side on desktop for LOW SCROLL) */}
      <div className="grid lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* =========================================================================
            STAGE 1: LIVE CANVAS PREVIEW (Sticky, compact, responsive)
           ========================================================================= */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
          {/* Canvas Top Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-slate-300 text-xs mb-3 pb-2.5 border-b border-slate-800">
            {/* Sheet & DPI info */}
            <div className="flex items-center justify-between sm:justify-start gap-2 font-mono text-[11px] w-full sm:w-auto">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="inline-block w-2 h-2 rounded-full bg-lime-400 animate-pulse shrink-0" />
                <span className="text-slate-200 font-semibold whitespace-nowrap">300 DPI Live</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 truncate">
                  {currentPaper.id === "4x6" ? "4×6″" : currentPaper.name.split("(")[0]}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-lime-400 border border-slate-700 sm:hidden">
                {activePhotoCount} Photos
              </span>
            </div>

            {/* Quick Canvas & Photo Action Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setOrientation(orientation === "landscape" ? "portrait" : "landscape")}
                className="flex-1 sm:flex-initial px-2.5 py-1.5 sm:py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
                title="Rotate Sheet Orientation"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="capitalize">{orientation}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-initial px-2.5 py-1.5 sm:py-1 rounded-md bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-lime-500/30"
                title="Upload another photo"
              >
                <Upload className="w-3 h-3" />
                <span>Change Photo</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 sm:py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] transition-colors cursor-pointer border border-slate-700 flex items-center justify-center"
                title="Reset back to upload screen"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Interactive Live Canvas Area */}
          <div className="w-full flex items-center justify-center p-2 sm:p-4 min-h-[220px] max-h-[380px] sm:min-h-[320px] sm:max-h-[520px] overflow-hidden bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="relative shadow-2xl transition-all max-w-full max-h-[460px] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[360px] sm:max-h-[440px] w-auto h-auto rounded-sm object-contain bg-white shadow-xl ring-1 ring-white/20"
                style={{ imageRendering: "crisp-edges" }}
              />
            </div>
          </div>

          {/* Canvas Footer Legend */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-800">
            <span className="truncate">
              Fits <strong>{activePhotoCount}</strong> {photoWidthMm}×{photoHeightMm}mm photos
            </span>
            <span className="text-slate-500 font-mono shrink-0 ml-2">
              Margin: {marginMm}mm · Gap: {gapMm}mm
            </span>
          </div>
        </div>

        {/* =========================================================================
            STAGE 2: COMPACT TABBED CONTROL PANEL (Zero-scroll editing)
           ========================================================================= */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          {/* Segmented Tab Navigation */}
          <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("preset")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "preset"
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-lime-700" />
              <span>1. Paper</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("grid")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "grid"
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-lime-700" />
              <span>2. Layout</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("guides")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "guides"
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-lime-700" />
              <span>3. Guides</span>
            </button>
          </div>

          {/* TAB 1: PAPER & STANDARD */}
          {activeTab === "preset" && (
            <div className="space-y-4">
              {/* Paper Format Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Paper Format (Sheet Size)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAPER_SIZES.map((paper) => (
                    <button
                      key={paper.id}
                      type="button"
                      onClick={() => setPaperSizeId(paper.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        paperSizeId === paper.id
                          ? "border-[#4D7C0F] bg-lime-50/60 ring-1 ring-[#4D7C0F]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">
                          {paper.id === "4x6" ? "4 × 6″ (Kiosk)" : paper.name.split("(")[0]}
                        </span>
                        {paper.popular && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-lime-200 text-[#365314]">
                            Popular
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {paper.widthMm} × {paper.heightMm} mm
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Standard */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Passport Standard
                </label>
                <div className="space-y-1.5">
                  {PHOTO_STANDARDS.map((std) => (
                    <button
                      key={std.id}
                      type="button"
                      onClick={() => setPhotoStandardId(std.id)}
                      className={`w-full p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        photoStandardId === std.id
                          ? "border-[#4D7C0F] bg-lime-50/60 ring-1 ring-[#4D7C0F]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{std.flag}</span>
                        <div className="text-left min-w-0">
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {std.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {std.country}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {std.spec}
                      </span>
                    </button>
                  ))}

                  {/* Custom Option */}
                  <button
                    type="button"
                    onClick={() => setPhotoStandardId("custom")}
                    className={`w-full p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      photoStandardId === "custom"
                        ? "border-[#4D7C0F] bg-lime-50/60 ring-1 ring-[#4D7C0F]"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-800">Custom Dimensions (mm)</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {customPhotoWidth} × {customPhotoHeight} mm
                    </span>
                  </button>
                </div>

                {/* Custom Width / Height Inputs if active */}
                {photoStandardId === "custom" && (
                  <div className="grid grid-cols-2 gap-2 mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 block mb-1">Width (mm)</span>
                      <input
                        type="number"
                        min="20"
                        max="100"
                        value={customPhotoWidth}
                        onChange={(e) => setCustomPhotoWidth(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 block mb-1">Height (mm)</span>
                      <input
                        type="number"
                        min="20"
                        max="100"
                        value={customPhotoHeight}
                        onChange={(e) => setCustomPhotoHeight(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Next Tab Button */}
              <button
                type="button"
                onClick={() => setActiveTab("grid")}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Next: Adjust Layout &amp; Copies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 2: GRID & SPACING */}
          {activeTab === "grid" && (
            <div className="space-y-4">
              {/* Photo Count Override */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Number of Photos
                  </label>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {activePhotoCount} / {maxCapacity} Max
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[2, 4, 6, maxCapacity].filter((v, i, a) => a.indexOf(v) === i && v <= maxCapacity).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPhotoCountOverride(count === maxCapacity ? null : count)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        activePhotoCount === count
                          ? "bg-lime-600 text-white border-lime-600"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {count} {count === maxCapacity ? "(Max)" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trim Gap between photos */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Gap between photos (Cut space)
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-900">{gapMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={gapMm}
                  onChange={(e) => setGapMm(parseFloat(e.target.value))}
                  className="w-full accent-lime-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 mm (Edge-to-edge)</span>
                  <span>2.5 mm (Standard)</span>
                  <span>8 mm</span>
                </div>
              </div>

              {/* Safe Print Margins */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Safe Print Margins (Outer edge)
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-900">{marginMm} mm</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={marginMm}
                  onChange={(e) => setMarginMm(parseFloat(e.target.value))}
                  className="w-full accent-lime-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1 mm (Tight)</span>
                  <span>4 mm (Recommended)</span>
                  <span>12 mm</span>
                </div>
              </div>

              {/* Next Tab Button */}
              <button
                type="button"
                onClick={() => setActiveTab("guides")}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Next: Cutting Guides &amp; Export</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 3: GUIDES & EXPORT */}
          {activeTab === "guides" && (
            <div className="space-y-4">
              {/* Cutting Guide Style */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
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
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        guideStyle === style.id
                          ? "border-[#4D7C0F] bg-lime-50/60 ring-1 ring-[#4D7C0F]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-900 block">
                        {style.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {style.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Format (JPEG vs PNG) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  File Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat("jpeg")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      exportFormat === "jpeg"
                        ? "border-[#4D7C0F] bg-lime-50/60 ring-1 ring-[#4D7C0F]"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">JPEG (300 DPI)</span>
                    <span className="text-[10px] text-slate-500 block">Best for photo kiosks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat("png")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      exportFormat === "png"
                        ? "border-[#4D7C0F] bg-lime-50/60 ring-1 ring-[#4D7C0F]"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">PNG (Lossless)</span>
                    <span className="text-[10px] text-slate-500 block">Maximum clarity</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => handleDownload(exportFormat)}
                  disabled={isExporting}
                  className="w-full py-3 rounded-xl bg-lime-600 hover:bg-lime-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {exportFormat.toUpperCase()} Sheet (300 DPI)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print 1:1 Scale</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-lime-600" />
                        <span className="text-lime-800 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
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
  );
}
