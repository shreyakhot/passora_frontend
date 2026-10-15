import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  CheckCircle,
  Shield,
  Printer,
  Zap,
  Lock,
  Globe,
  ArrowRight,
  Crop,
  RefreshCw,
  BookOpenCheck,
  Users,
  ChevronRight,
  AlertCircle,
  Baby,
  FileText,
  Check,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import PhotoMakerStudio from "@/components/PhotoMakerStudio";
import OfficialPhotoNotice from "@/components/OfficialPhotoNotice";
import { LOGO_URL, SITE_DISCLAIMER, SITE_NAME, SITE_URL } from "@/lib/site";
import { PRICING, getPlanPricing } from "@/lib/config/pricing";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  DEFAULT_COUNTRY_CODE,
  countryPagePath,
  documentLabel,
  getCountryByCode,
} from "@/config/countries";
import { POPULAR_TOOLS, type ToolDirectoryEntry } from "@/lib/tool-directory";

const standardPlan = getPlanPricing("standard");

const PAGE_TITLE = "Passport & Visa Photo Online for 50+ Countries";
const PAGE_DESCRIPTION = `Make passport and visa photos online for the US, UK, Canada, India, the Schengen Area and 50+ countries. Upload a phone photo, get it sized and checked, and download for ${standardPlan.amountFormatted}.`;
const OG_DESCRIPTION =
  "Turn a phone photo into a passport or visa photo for 50+ countries. Sized and checked against published photo rules, ready to upload or print.";

/** Pixel size for a country from config, e.g. "600×600", so copy never drifts from the spec. */
function pixelSize(code: string): string {
  return getCountryByCode(code)?.dimensions.replace("x", "×") ?? "";
}

/** Featured country cards, then the remaining popular countries as quick-link pills. */
const FEATURED_TOOLS = POPULAR_TOOLS.slice(0, 6);
const MORE_TOOLS = POPULAR_TOOLS.slice(6);

/** Card copy for a featured country, built from config so it stays accurate for every country. */
function featuredDescription(tool: ToolDirectoryEntry): string {
  const countryName = getCountryByCode(tool.countryCode)?.country_name ?? tool.title;
  const use =
    tool.group === "Visa Photos" ? "visa applications" : "passport applications and renewals";
  return `Auto-cropped to the published photo size for ${countryName} ${use}, with a digital file and a 6×4″ print sheet.`;
}

const defaultCountryDoc = documentLabel(DEFAULT_COUNTRY);

export const metadata: Metadata = {
  title: {
    absolute: `${PAGE_TITLE} | ${SITE_NAME}`,
  },
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: `${PAGE_TITLE} — ${SITE_NAME}`,
    description: OG_DESCRIPTION,
    url: `${SITE_URL}/`,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_URL,
        width: 640,
        height: 640,
        alt: `${SITE_NAME} — passport and visa photo maker`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${PAGE_TITLE} — ${SITE_NAME}`,
    description: OG_DESCRIPTION,
    images: [LOGO_URL],
  },
};

const steps = [
  {
    icon: Globe,
    step: 1,
    title: "Select Your Country",
    description:
      "Pick the US, UK, Canada, Australia, India, the Schengen Area, or one of 50+ countries. We load the photo size for that passport or visa automatically.",
  },
  {
    icon: Crop,
    step: 2,
    title: "Upload and Auto-Crop",
    description:
      "Upload any digital photo for your passport application. Our passport picture cropping tool centres your face, straightens your head position, and resizes the image to the exact pixel dimensions required.",
  },
  {
    icon: Zap,
    step: 3,
    title: "Preview and Download",
    description:
      "In under 10 seconds you get a digital photo plus a print-ready 6×4″ sheet, ready to upload or take to a photo shop for professional printing.",
  },
];

const features = [
  {
    icon: Globe,
    title: "50+ Global Passport Formats",
    description: `Create a passport picture online for the US (${pixelSize("US")}), UK (${pixelSize("GB")}), Australia (${pixelSize("AU")}), Schengen Area (${pixelSize("EU")}), and dozens more country formats.`,
  },
  {
    icon: Crop,
    title: "Passport Picture Cropping Tool",
    description:
      "Our built-in cropping tool detects your face and eye line, then aligns and trims your photo to match strict head-size and centring rules automatically.",
  },
  {
    icon: Shield,
    title: "Biometric AI Verification",
    description:
      "Every upload is checked for head height, eye position, background colour, and lighting, so you can fix problems before you submit your application.",
  },
  {
    icon: RefreshCw,
    title: "Built for Passport Renewal",
    description:
      "Renewing a passport or visa? Generate a fresh digital photo for passport renewal that meets the same rules as a first-time application, without a studio visit.",
  },
  {
    icon: Printer,
    title: "Print Passport Photo Online",
    description:
      "Download a high-resolution file, then take the ready-made 6×4″ sheet to a pharmacy or photo shop. Many passport offices require prints on professional-quality photo paper, so check your country's rules before printing.",
  },
  {
    icon: Lock,
    title: "Instant Download & Complete Privacy",
    description:
      "No subscriptions, instant high-resolution download, and no watermark. Create compliant photos for the whole family safely and securely.",
  },
];

const pricingBenefits = [
  "Official photo dimensions for 50+ countries",
  "Automatic passport picture cropping and resizing",
  "Smart in-browser compression to ≤ 3 MB",
  "High-resolution single digital passport photo",
  "Standard 6×4″ (10×15 cm) multi-photo print sheet",
  "Instant download with no registration or subscriptions needed",
];

const trustPoints = [
  {
    icon: Users,
    title: "Built Around Real Applications",
    description:
      "Head size, spacing, and background checks are tuned to the published photo specifications for US, UK, Canadian, Indian, Schengen and other passport and visa applications.",
  },
  {
    icon: BookOpenCheck,
    title: "Rules Sourced From Official Guidance",
    description:
      "Every country profile is based on published government passport office and visa authority specifications, and we review them when an issuing authority updates its rules.",
  },
  {
    icon: Shield,
    title: "Automated Compliance Checks",
    description:
      "Each photo runs through automated biometric checks before download, so you can see exactly why a photo passes or fails instead of guessing.",
  },
  {
    icon: Lock,
    title: "Your Photo Stays Private",
    description:
      "Photos are processed for your session only and are never sold, shared, or used to train other tools. You control the download, start to finish.",
  },
];

const faqs = [
  {
    question: "How do I make a passport photo online?",
    answer:
      "Ask someone to take a photo of you facing a window, in front of a plain light-coloured wall. Choose your country, upload the photo, and the tool sizes it and checks it against that country's published photo rules in about 10 seconds. You get a digital photo plus a 6×4″ print sheet for paper forms.",
  },
  {
    question: "Can I take my passport photo on my phone?",
    answer:
      "Yes, for most countries. Ask someone to take the photo for you rather than taking a selfie, and include your head, shoulders and upper body so the tool has room to crop. Some passport offices and online application services have their own upload rules, so check with your issuing authority before you apply.",
  },
  {
    question: "What size is a passport photo?",
    answer:
      "It depends on the country. For example, US passport photos are 2×2 inches (51×51 mm), the UK and Schengen Area use 35×45 mm, and Canada uses 50×70 mm. When you choose a country, the tool loads the pixel dimensions for that document automatically.",
  },
  {
    question: "Can I use this for a passport renewal photo?",
    answer:
      "Yes. Most passport offices require a new, recent photo for every renewal, even if your appearance has not changed. Our tool creates a fresh digital photo for passport renewal that meets the same rules as a first-time application. Check how recent your country requires the photo to be.",
  },
  {
    question: "How does the passport picture cropping tool work?",
    answer:
      "The cropping tool detects your face, eyes, and shoulders, then aligns your head to the correct height and position before trimming the image to your chosen country's exact dimensions, so nothing is cropped by hand.",
  },
  {
    question: "How do I get my passport photo printed?",
    answer:
      "Download the print-ready 6×4″ sheet and take it to a pharmacy or photo shop, or upload it to an online print service. Many countries require printed photos to be in colour, on professional-quality photo paper, with no border, so confirm the print rules with your issuing authority.",
  },
  {
    question: "Which countries do you support?",
    answer: `${SITE_NAME} supports ${COUNTRIES.length} countries and regions, including the US, UK, Canada, Australia, India and the Schengen Area, for passport and visa photos.`,
  },
  {
    question: `Is ${SITE_NAME} an official government service?`,
    answer: `No. ${SITE_DISCLAIMER} We size and check your photo against published rules, but your issuing authority makes the final decision on whether a photo is accepted.`,
  },
  {
    question: "What file formats can I upload?",
    answer:
      "JPEG, PNG, and WebP files up to 20 MB are accepted, including high-resolution photos straight from a modern smartphone camera.",
  },
  {
    question: "How long does processing take?",
    answer:
      "Around 10 seconds. The tool checks eye level, face centring, and background uniformity before producing your high-resolution digital photo and printable sheet.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        siteUrl={SITE_URL}
        siteName={SITE_NAME}
        price={standardPlan.amount.toFixed(2)}
        priceCurrency={PRICING.currency}
        faqItems={faqs}
        pageUrl={`${SITE_URL}/`}
        pageName={PAGE_TITLE}
        pageDescription={PAGE_DESCRIPTION}
      />

      <Navbar ctaText="Upload Photo" ctaHref="#studio" />

      <main className="flex-1 bg-white text-slate-900" id="main-content">
        {/* =========================================================================
            1. HERO SECTION (Clean, responsive, standardized)
           ========================================================================= */}
        <section className="bg-white py-10 sm:py-16 lg:py-20 border-b border-slate-200/80" id="hero" aria-label="Introduction and photo maker overview">
          <div className="container-narrow">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left copy column */}
              <div className="lg:col-span-7 max-w-2xl">
                {/* Official Biometric Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-50 border border-lime-300 text-xs font-bold text-[#365314] tracking-wide mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#4D7C0F]" aria-hidden="true" />
                  <span>PASSPORT &amp; VISA PHOTOS · 50+ COUNTRIES</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0F172A] tracking-tight leading-[1.18] mb-3">
                  Passport &amp; Visa Photos Online
                </h1>

                {/* Sub-heading */}
                <p className="text-lg sm:text-xl text-[#334155] font-semibold mb-4 leading-snug">
                  Digital and printed photos for new applications and renewals in 50+ countries
                </p>

                {/* Body description */}
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-7 max-w-xl">
                  Take a photo on your phone, upload it, and get a passport or
                  visa photo sized and checked against your country&apos;s
                  published photo rules in under 10 seconds. Use it for an
                  online application, or print it for a paper form. Supports
                  the US, UK, Canada, Australia, India, the Schengen Area and
                  50+ other countries.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 mb-7">
                  <a
                    href="#studio"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#4D7C0F] hover:bg-[#3F650C] active:bg-[#365314] !text-white text-white font-bold text-base px-7 py-3.5 sm:py-4 rounded-xl transition-colors text-center shadow-xs focus-ring"
                  >
                    <span>Create My Passport Photo</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" aria-hidden="true" />
                  </a>
                  <a
                    href="#how-it-works"
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base px-6 py-3.5 sm:py-4 rounded-xl border border-slate-300 transition-colors text-center focus-ring"
                  >
                    How It Works
                  </a>
                </div>

                {/* Features Badges Row */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5">
                  <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 text-center">
                    <span aria-hidden="true">🔒</span> Secure &amp; Private
                  </span>
                  <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 text-center">
                    <span className="text-amber-600" aria-hidden="true">⚡</span> Results in 10s
                  </span>
                  <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 text-center">
                    <span aria-hidden="true">🌍</span> 50+ Countries
                  </span>
                  <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 text-center">
                    <span aria-hidden="true">🪪</span> Biometric Validation
                  </span>
                </div>
              </div>

              {/* Visual preview column */}
              <div className="lg:col-span-5 flex justify-center w-full">
                <div className="w-full max-w-sm lg:max-w-md">
                  <div className="relative overflow-hidden aspect-[4/5]">
                    <Image
                      src="/images/digital-passport-photo_example.webp"
                      alt="Example passport photo with a plain light grey background"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                      className="object-cover rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            1b. PHOTO MAKER STUDIO (country auto-detected from the visitor's locale)
           ========================================================================= */}
        <section className="bg-slate-50 py-10 sm:py-16 border-b border-slate-200/80" id="studio" aria-labelledby="studio-heading">
          <div className="container-narrow max-w-2xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-5 sm:mb-7">
              <h2 id="studio-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create Your Passport or Visa Photo
              </h2>
              <p className="text-slate-700 text-xs sm:text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
                Upload a recent photo and we will size it and check it against the photo rules for your country.
                Check the country below matches the passport or visa you are applying for.
              </p>
            </div>
            <PhotoMakerStudio defaultDocumentType="passport" />
            <OfficialPhotoNotice className="mt-5" />
          </div>
        </section>

        {/* =========================================================================
            2. HOW IT WORKS SECTION (Clean connected layout, no heavy boxy cards)
           ========================================================================= */}
        <section className="bg-slate-50/70 py-14 sm:py-20 border-b border-slate-200/80" id="how-it-works">
          <div className="container-narrow">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-[#4D7C0F] text-xs font-bold mb-3">
                Simple 3-Step Process
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
                How to Make a Passport Photo Online
              </h2>
              <p className="text-slate-700 text-sm sm:text-base">
                Three steps take you from a regular phone photo to a correctly
                sized, checked passport or visa photo for 50+ countries.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {steps.map(({ icon: Icon, step, title, description }) => (
                <div
                  key={step}
                  className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-lime-600 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between w-full mb-6">
                      <div className="w-12 h-12 rounded-xl bg-lime-50 border border-lime-200 flex items-center justify-center text-[#4D7C0F]" aria-hidden="true">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        Step 0{step}
                      </span>
                    </div>

                    <h3 className="text-slate-900 text-lg sm:text-xl font-bold mb-2">
                      {title}
                    </h3>

                    <p className="text-slate-700 text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10 sm:mt-12">
              <a
                href="#studio"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#4D7C0F] hover:bg-[#3F650C] !text-white text-white font-bold text-base px-8 py-3.5 sm:py-4 rounded-xl transition-colors text-center shadow-xs"
              >
                <Upload className="w-5 h-5" aria-hidden="true" />
                <span>Upload &amp; Create Photo Now</span>
                <ArrowRight className="w-4 h-4 ml-0.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. FEATURES SECTION (Unified border-divided layout, no individual heavy card clutter)
           ========================================================================= */}
        <section className="bg-white py-14 sm:py-20 border-b border-slate-200/80" id="features" aria-label="Core features and capabilities">
          <div className="container-narrow">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-3">
                Engineered for Acceptance
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
                Everything You Need From a Passport Photo Maker
              </h2>
              <p className="text-slate-700 text-sm sm:text-base">
                Create, crop, verify, and print official biometric passport
                photos from any device, for a first application or a renewal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-start hover:border-lime-600 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-lime-50 border border-lime-200 text-[#4D7C0F] flex items-center justify-center shrink-0 mb-4" aria-hidden="true">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-bold text-[#0F172A] text-base sm:text-lg mb-2">
                    {title}
                  </h3>

                  <p className="text-slate-700 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. TRUST / E-E-A-T SECTION (Clean 2x2 grid, no shadows)
           ========================================================================= */}
        <section className="bg-slate-50/70 py-14 sm:py-20 border-b border-slate-200/80" id="trust" aria-label="Trust and compliance verification">
          <div className="container-narrow">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-3">
                Why Trust {SITE_NAME}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
                Photo Rules You Can Verify, Not Just Trust
              </h2>
              <p className="text-slate-700 text-sm sm:text-base">
                {SITE_NAME} is built around published passport and visa photo
                specifications, and we keep every country profile under review.
                We are independent and not affiliated with any government.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {trustPoints.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-lime-50 border border-lime-200 text-[#4D7C0F] flex items-center justify-center shrink-0" aria-hidden="true">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-[#0F172A] text-base sm:text-lg">
                        {title}
                      </h3>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. COMMON DIGITAL PASSPORT PHOTO RULES & GUIDANCE
           ========================================================================= */}
        <section className="bg-white py-14 sm:py-20 border-b border-slate-200/80" id="photo-rules" aria-label="Common passport photo rules and guidelines">
          <div className="container-narrow">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-[#365314] text-xs font-bold mb-3">
                Common Photo Rules
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
                Rules &amp; Guidance for Digital Passport Photos
              </h2>
              <p className="text-slate-700 text-sm sm:text-base">
                Most countries follow similar biometric photo standards. These are the common rules for
                online applications, phone photos, and child photos. Always confirm the exact requirements
                with your country&apos;s issuing authority.
              </p>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
              {/* 1. Digital Photos Overview */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-3 flex items-center gap-2.5">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#4D7C0F]" aria-hidden="true" />
                  Digital photos
                </h3>
                <p className="text-slate-800 text-sm sm:text-base font-medium mb-4">
                  Many countries accept or require a digital photo when you apply for a passport or visa online.
                </p>
                <ul className="space-y-2.5 text-slate-700 text-sm sm:text-base mb-5">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-1" aria-hidden="true" />
                    <span>Most passport offices ask for a new photo when you get a new passport, even if your appearance has not changed.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-1" aria-hidden="true" />
                    <span>Your photo must be recent. Check how recently your country requires it to have been taken.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-1" aria-hidden="true" />
                    <span className="text-amber-950 font-semibold">Your application may be delayed or refused if your photos do not meet the rules.</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-800">
                  If a disability or medical condition makes these rules hard to meet, contact the authority that
                  issues your document. Many offer help or exceptions.
                </div>
              </div>

              {/* 3. Rules for digital photos */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-5 flex items-center gap-2.5">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#4D7C0F]" aria-hidden="true" />
                  Rules for digital photos
                </h3>

                <div className="space-y-6">
                  {/* The quality of your digital photo */}
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-base sm:text-lg mb-2">
                      The quality of your digital photo
                    </h4>
                    <p className="text-slate-700 text-sm mb-3">Your photo must be:</p>
                    <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-800">
                      <li className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                        <span>clear and in focus</span>
                      </li>
                      <li className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                        <span>in colour</span>
                      </li>
                      <li className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                        <span>not retouched or filtered to change your appearance</span>
                      </li>
                      <li className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                        <span>the pixel size your country requires</span>
                      </li>
                      <li className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg sm:col-span-2">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                        <span>within the file-size limits of the service you are uploading to</span>
                      </li>
                    </ul>
                  </div>

                  {/* What your digital photo must show */}
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="font-bold text-[#0F172A] text-base sm:text-lg mb-2">
                      What your digital photo must show
                    </h4>
                    <p className="text-slate-700 text-sm mb-3">The digital photo must:</p>
                    <ul className="space-y-2 text-sm text-slate-800 mb-4">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>contain no other objects or people</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>be taken against a plain background in the colour your country requires (usually white or light-coloured)</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>be in clear contrast to the background</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>not have ‘red eye’</span>
                      </li>
                    </ul>

                    <p className="text-sm bg-lime-50/80 border border-lime-200 text-[#365314] font-medium rounded-xl p-3.5 mb-5">
                      If you’re using a photo taken on your own device, include your head, shoulders and upper body. Do not crop your photo - it will be done for you. Find the size and rules for your country in our{" "}
                      <Link
                        href="/tool"
                        className="font-bold underline text-[#365314] hover:text-[#4D7C0F] transition-colors"
                      >
                        photo guides for 50+ countries
                      </Link>
                      , read the{" "}
                      <Link
                        href={countryPagePath(DEFAULT_COUNTRY_CODE)}
                        className="font-bold underline text-[#365314] hover:text-[#4D7C0F] transition-colors"
                      >
                        {DEFAULT_COUNTRY.country_name} {defaultCountryDoc} photo requirements
                      </Link>
                      , or use the{" "}
                      <Link
                        href="/passport-size-photo-maker"
                        className="font-bold underline text-[#365314] hover:text-[#4D7C0F] transition-colors"
                      >
                        passport size photo maker
                      </Link>
                      .
                    </p>

                    <p className="text-slate-800 text-sm mb-3 font-semibold">In your photo you must:</p>
                    <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-800 mb-4">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>be facing forwards and looking straight at the camera</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>have a plain expression and your mouth closed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>have your eyes open and visible</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>not have hair in front of your eyes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>not have a head covering (unless it’s for religious or medical reasons)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>not have anything covering your face</span>
                      </li>
                      <li className="flex items-start gap-2 sm:col-span-2">
                        <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>not have any shadows on your face or behind you</span>
                      </li>
                    </ul>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800">
                      <strong>Glasses:</strong> Many countries do not allow glasses in passport photos, so remove them unless your country permits them. Where glasses are allowed, they cannot be sunglasses or tinted glasses, and you must make sure your eyes are not covered by the frames or any glare, reflection or shadow.
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Photos of babies and children */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-4 flex items-center gap-2.5">
                  <Baby className="w-5 h-5 sm:w-6 sm:h-6 text-[#4D7C0F]" aria-hidden="true" />
                  Photos of babies and children
                </h3>
                <ul className="space-y-3 text-sm sm:text-base text-slate-800">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-1" aria-hidden="true" />
                    <span>Children must be on their own in the picture. Babies must not be holding toys or using pacifiers (dummies).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-1" aria-hidden="true" />
                    <span>Many countries relax the expression and eye-line rules for young children. Check the age limits that apply in your country.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-1" aria-hidden="true" />
                    <span>Some countries allow babies to have their eyes closed. If you support their head with your hand, your hand must not be visible in the photo.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-1" aria-hidden="true" />
                    <span>For a baby, an easy option is to lay them on a plain white or light-coloured sheet and take the photo from above.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. PRICING SECTION (Flat Fee from pricing config, No Shadows)
           ========================================================================= */}
        <section className="bg-white py-14 sm:py-20 border-b border-slate-200/80" id="pricing" aria-label="Transparent pricing details">
          <div className="container-narrow">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-[#365314] text-xs font-bold mb-3">
                Transparent Pricing
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
                Passport Photo Maker Package
              </h2>
              <p className="text-slate-700 text-sm sm:text-base">
                One-off payment for your complete compliant digital photo and printable sheet.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="bg-white border-2 border-[#4D7C0F] rounded-2xl overflow-hidden p-6 sm:p-8">
                <div className="text-center pb-6 border-b border-slate-200">
                  <div className="inline-block px-3 py-1 rounded-md bg-lime-100 text-[#365314] mb-3 font-bold text-xs uppercase tracking-wide">
                    Complete Photo Package
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-extrabold text-[#0F172A] tracking-tight">
                      {standardPlan.amountFormatted}
                    </span>
                    <span className="text-slate-700 text-base font-medium">
                      /photo
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm mt-2">
                    Includes ready-to-submit digital photo and 6×4″ printable sheet
                  </p>
                </div>

                <ul className="py-6 space-y-3 list-none p-0 m-0">
                  {pricingBenefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2.5 text-slate-800 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#studio"
                  className="inline-flex items-center justify-center w-full text-center bg-[#4D7C0F] hover:bg-[#3F650C] !text-white text-white font-bold text-base py-3.5 sm:py-4 rounded-xl transition-colors shadow-xs"
                >
                  Create Your Passport Photo Now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. POPULAR COUNTRY & DOCUMENT FORMATS (Internal Linking SEO Grid)
           ========================================================================= */}
        <section className="bg-white py-14 sm:py-20 border-b border-slate-200/80" id="popular-tools" aria-label="Popular country and document photo formats">
          <div className="container-narrow">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-[#365314] text-xs font-bold mb-3">
                Global Standards
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
                Popular Passport &amp; Visa Photo Formats
              </h2>
              <p className="text-slate-700 text-sm sm:text-base">
                Explore dedicated specifications and automated photo makers for top destinations.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {FEATURED_TOOLS.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tool/${tool.slug}`}
                  className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-lime-600 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all group shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl" role="img" aria-hidden="true">{tool.flag}</span>
                      <span className="font-mono text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {tool.spec}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#0F172A] text-base sm:text-lg mb-1.5 group-hover:text-[#365314] transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                      {featuredDescription(tool)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4D7C0F] group-hover:text-[#365314]">
                    <span>View Specifications &amp; Create</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>

            {/* Quick Link Pills to Specialized Converters & Photo Tools */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 mr-1">
                  More Tools:
                </span>
                <Link
                  href="/passport-photo-print-template-generator"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-100 hover:bg-lime-200 border border-lime-300 text-xs font-bold text-lime-950 transition-colors shadow-2xs"
                >
                  <span className="text-lime-700">🖨️</span>
                  <span>Print Template Generator (4×6″)</span>
                  <ArrowRight className="w-3 h-3 text-lime-800" />
                </Link>
                {[
                  { href: "/passport-size-photo-maker", label: "Passport Size Photo Maker" },
                  ...MORE_TOOLS.map((tool) => ({ href: `/tool/${tool.slug}`, label: tool.title })),
                  { href: "/tool", label: "All 50+ Countries" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-lime-50 border border-slate-200 hover:border-lime-300 text-xs font-semibold text-slate-800 hover:text-lime-900 transition-colors"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. FAQ SECTION (Clean accordion, no shadows)
           ========================================================================= */}
        <section className="bg-slate-50/70 py-14 sm:py-20 border-b border-slate-200/80" id="faq" aria-label="Frequently Asked Questions">
          <div className="container-narrow">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-3">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-700 text-sm sm:text-base">
                Common questions about country rules, renewals, cropping, and printing.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map(({ question, answer }, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                >
                  <details className="group [&_summary::-webkit-details-marker]:hidden" open={index === 0}>
                    <summary className="flex items-center justify-between p-5 cursor-pointer select-none font-semibold text-slate-900 text-base sm:text-lg hover:text-[#365314] focus-ring transition-colors rounded-xl">
                      <span>{question}</span>
                      <span className="ml-4 shrink-0 text-slate-700 group-open:rotate-90 transition-transform" aria-hidden="true">
                        <ChevronRight className="w-5 h-5" />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-slate-700 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-3">
                      {answer}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}