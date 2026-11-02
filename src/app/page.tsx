import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
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
  AlertCircle,
  Baby,
  FileText,
  Check,
  Plus,
  Sparkles,
  ScanFace,
  UserCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import PhotoMakerStudio from "@/components/PhotoMakerStudio";
import OfficialPhotoNotice from "@/components/OfficialPhotoNotice";
import { LOGO_URL, SITE_DISCLAIMER, SITE_NAME, SITE_URL } from "@/lib/site";
import { PRICING, getPlanPricing } from "@/lib/config/pricing";
import { COUNTRIES, countryFlag, getCountryByCode } from "@/config/countries";

const standardPlan = getPlanPricing("standard");
const expertPlan = getPlanPricing("expert_edit");

const PAGE_TITLE = "Passport & Visa Photo Online for 50+ Countries";
const PAGE_DESCRIPTION = `Make passport and visa photos online for the US, UK, Canada, India, the Schengen Area and 50+ countries. Upload a phone photo, get it sized and checked, and download for ${standardPlan.amountFormatted}.`;
const OG_DESCRIPTION =
  "Turn a phone photo into a passport or visa photo for 50+ countries. Sized and checked against published photo rules, ready to upload or print.";

/** Pixel size for a country from config, e.g. "600×600", so copy never drifts from the spec. */
function pixelSize(code: string): string {
  return getCountryByCode(code)?.dimensions.replace("x", "×") ?? "";
}

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

const SHOWCASE_COUNTRY_CODES = ["US", "GB", "CA", "AU", "IN", "EU", "DE", "FR", "AE", "SG", "NZ", "JP"];
const showcaseCountries = SHOWCASE_COUNTRY_CODES.map((code) => getCountryByCode(code)).filter(
  (c): c is NonNullable<typeof c> => Boolean(c)
);

const heroStats = [
  { value: `${COUNTRIES.length}+`, label: "countries & regions" },
  { value: "~10s", label: "to process a photo" },
  { value: standardPlan.amountFormatted, label: "one-off, no subscription" },
];

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

const standardBenefits = [
  "Official photo dimensions for 50+ countries",
  "Automatic passport picture cropping and resizing",
  "Smart in-browser compression to ≤ 3 MB",
  "High-resolution single digital passport photo",
  "Standard 6×4″ (10×15 cm) multi-photo print sheet",
  "Instant download with no registration or subscriptions needed",
];

const expertBenefits = [
  "Everything in the Standard photo",
  "Manual review of your photo by a person",
  "Hand fixes for shadows, tilt, glare and background",
  "Updated photo delivered to your email",
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

const qualityRules = [
  "clear and in focus",
  "in colour",
  "not retouched or filtered to change your appearance",
  "the pixel size your country requires",
  "within the file-size limits of the service you are uploading to",
];

const showRules = [
  "contain no other objects or people",
  "be taken against a plain background in the colour your country requires (usually white or light-coloured)",
  "be in clear contrast to the background",
  "not have ‘red eye’",
];

const poseRules = [
  "be facing forwards and looking straight at the camera",
  "have a plain expression and your mouth closed",
  "have your eyes open and visible",
  "not have hair in front of your eyes",
  "not have a head covering (unless it’s for religious or medical reasons)",
  "not have anything covering your face",
  "not have any shadows on your face or behind you",
];

const childRules = [
  "Children must be on their own in the picture. Babies must not be holding toys or using pacifiers (dummies).",
  "Many countries relax the expression and eye-line rules for young children. Check the age limits that apply in your country.",
  "Some countries allow babies to have their eyes closed. If you support their head with your hand, your hand must not be visible in the photo.",
  "For a baby, an easy option is to lay them on a plain white or light-coloured sheet and take the photo from above.",
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

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  dark?: boolean;
  id?: string;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className={`eyebrow ${dark ? "eyebrow-dark" : ""}`}>{eyebrow}</span>
      <h2 id={id} className={`display-2 mt-4 ${dark ? "text-white" : "text-ink-950"}`}>
        {title}
      </h2>
      {description && <p className={`lead mt-4 ${dark ? "text-ink-300" : ""}`}>{description}</p>}
    </div>
  );
}

function CheckItem({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "dark" }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          tone === "dark" ? "bg-white/10 text-brand-300" : "bg-brand-100 text-brand-700"
        }`}
        aria-hidden="true"
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span>{children}</span>
    </li>
  );
}

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

      <main className="flex-1 bg-white text-ink-950" id="main-content">
        {/* ================================================================
            1. HERO
           ================================================================ */}
        <section
          className="relative overflow-hidden border-b border-ink-100"
          id="hero"
          aria-label="Introduction and photo maker overview"
        >

          <div className="container-narrow relative pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pb-28 lg:pt-20">
            <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
              {/* Copy */}
              <div className="lg:col-span-7">
                <Link
                  href="#studio"
                  className="group inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white py-1 pl-1 pr-3 text-xs font-semibold text-ink-700 shadow-soft transition-colors hover:border-brand-300 sm:text-sm"
                >
                  <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                    Global
                  </span>
                  Passport &amp; visa photos for 50+ countries
                  <ArrowRight className="h-3.5 w-3.5 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>

                <h1 className="display-1 mt-6 text-ink-950">
                  Passport &amp; Visa Photos <span className="marker">Online</span>, in seconds.
                </h1>

                <p className="lead mt-6 max-w-xl">
                  Take a photo on your phone, upload it, and get a passport or visa photo sized and checked against
                  your country&apos;s published photo rules in under 10 seconds. Use it for an online application, or
                  print it for a paper form, for new applications and renewals.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href="#studio" className="btn-brand btn-lg">
                    <Upload className="h-5 w-5" aria-hidden="true" />
                    Create My Passport Photo
                  </a>
                  <a href="#how-it-works" className="btn-outline-brand btn-lg">
                    See how it works
                  </a>
                </div>

                <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-ink-200 pt-6">
                  {heroStats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="sr-only">{stat.label}</dt>
                      <dd className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
                        {stat.value}
                      </dd>
                      <dd className="mt-0.5 text-xs font-medium text-ink-500 sm:text-sm">{stat.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Product visual */}
              <div className="relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
                <div className="relative rounded-[2rem] border border-ink-200 bg-white p-3 shadow-lift">
                  <div className="flex items-center justify-between px-2 pb-3 pt-1">
                    <span className="flex items-center gap-2 text-xs font-bold text-ink-700">
                      <span className="text-base leading-none" aria-hidden="true">
                        {countryFlag("US")}
                      </span>
                      US Passport
                    </span>
                    <span className="rounded-full bg-ink-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-600">
                      {pixelSize("US")} px
                    </span>
                  </div>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-ink-50">
                    <Image
                      src="/images/digital-passport-photo_example.webp"
                      alt="Example passport photo with a plain light grey background"
                      fill
                      priority
                      sizes="(max-width: 1024px) 384px, 460px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Floating chips */}
                <div className="absolute -left-4 top-24 hidden items-center gap-2.5 rounded-2xl border border-ink-200 bg-white px-3.5 py-2.5 shadow-lift animate-float sm:flex lg:-left-10">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700" aria-hidden="true">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <span className="text-xs">
                    <span className="block font-bold text-ink-950">Background replaced</span>
                    <span className="text-ink-500">Plain &amp; even</span>
                  </span>
                </div>
                <div className="absolute -right-3 bottom-20 hidden items-center gap-2.5 rounded-2xl border border-ink-200 bg-white px-3.5 py-2.5 shadow-lift animate-float [animation-delay:1.5s] sm:flex lg:-right-8">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100 text-brand-700" aria-hidden="true">
                    <ScanFace className="h-4 w-4" />
                  </span>
                  <span className="text-xs">
                    <span className="block font-bold text-ink-950">Face centred</span>
                    <span className="text-ink-500">Head size checked</span>
                  </span>
                </div>
                <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink-950 px-4 py-2 text-xs font-semibold text-white shadow-lift">
                  <Sparkles className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
                  Ready in ~10 seconds
                </div>
              </div>
            </div>
          </div>

          {/* Country strip */}
          <div className="relative border-t border-ink-100 bg-white">
            <div className="container-narrow flex flex-col items-center gap-4 py-6 lg:flex-row lg:gap-8">
              <p className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">Sized for</p>
              <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-2 p-0 lg:justify-start">
                {showcaseCountries.map((c) => (
                  <li
                    key={c.country_code}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700"
                  >
                    <span aria-hidden="true">{countryFlag(c.country_code)}</span>
                    {c.country_name}
                  </li>
                ))}
                <li className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
                  +{Math.max(COUNTRIES.length - showcaseCountries.length, 0)} more
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ================================================================
            2. PHOTO STUDIO
           ================================================================ */}
        <section className="relative bg-ink-50 section-padding" id="studio" aria-labelledby="studio-heading">
          <div className="container-narrow">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-5 lg:pt-6">
                <span className="eyebrow">Photo studio</span>
                <h2 id="studio-heading" className="display-2 mt-4 text-ink-950">
                  Create your passport or visa photo
                </h2>
                <p className="lead mt-4">
                  Upload a recent photo and we will size it and check it against the photo rules for your country.
                  Check the country matches the passport or visa you are applying for.
                </p>
                <ul className="m-0 mt-8 list-none space-y-4 p-0 text-sm text-ink-700 sm:text-base">
                  <CheckItem>Preview the finished photo before you pay</CheckItem>
                  <CheckItem>Digital file plus a 6×4″ print sheet</CheckItem>
                  <CheckItem>Your upload is used only to make your photo</CheckItem>
                </ul>
                <OfficialPhotoNotice className="mt-8 hidden bg-white lg:block" />
              </div>
              <div className="lg:col-span-7">
                <PhotoMakerStudio defaultDocumentType="passport" />
                <OfficialPhotoNotice className="mt-5 bg-white lg:hidden" />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            3. HOW IT WORKS
           ================================================================ */}
        <section className="section-padding" id="how-it-works" aria-labelledby="how-heading">
          <div className="container-narrow">
            <SectionHeader
              id="how-heading"
              eyebrow="3 simple steps"
              title="How to Make a Passport Photo Online"
              description="Three steps take you from a regular phone photo to a correctly sized, checked passport or visa photo for 50+ countries."
            />

            <div className="relative mt-14">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-14 hidden h-px border-t-2 border-dashed border-ink-200 md:block" aria-hidden="true" />
            <ol className="relative m-0 grid list-none gap-6 p-0 md:grid-cols-3 lg:gap-8">
              {steps.map(({ icon: Icon, step, title, description }) => (
                <li key={step} className="surface surface-hover relative p-7 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white" aria-hidden="true">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-5xl font-extrabold tracking-tighter text-ink-100" aria-hidden="true">
                      0{step}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-extrabold text-ink-950">
                    <span className="sr-only">Step {step}: </span>
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">{description}</p>
                </li>
              ))}
            </ol>
            </div>

            <div className="mt-12 text-center">
              <a href="#studio" className="btn-dark btn-lg">
                <Upload className="h-5 w-5" aria-hidden="true" />
                Upload &amp; Create Photo Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* ================================================================
            4. FEATURES (bento)
           ================================================================ */}
        <section className="border-y border-ink-100 bg-ink-50 section-padding" id="features" aria-labelledby="features-heading">
          <div className="container-narrow">
            <SectionHeader
              id="features-heading"
              eyebrow="Engineered for acceptance"
              title="Everything You Need From a Passport Photo Maker"
              description="Create, crop, verify, and print biometric passport photos from any device, for a first application or a renewal."
            />

            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }, i) => (
                <div
                  key={title}
                  className={`surface surface-hover flex flex-col p-7 ${
                    i === 0 ? "border-ink-950 bg-ink-950 text-white hover:border-ink-950 lg:row-span-3" : ""
                  } ${i === features.length - 1 ? "lg:col-span-2" : ""}`}
                >
                  <span
                    className={
                      i === 0
                        ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white"
                        : "icon-tile"
                    }
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className={`mt-5 text-lg font-extrabold sm:text-xl ${i === 0 ? "text-white" : "text-ink-950"}`}>
                    {title}
                  </h3>
                  <p className={`mt-2 text-sm leading-relaxed sm:text-base ${i === 0 ? "text-ink-300" : "text-ink-600"}`}>
                    {description}
                  </p>
                  {i === 0 && (
                    <ul className="m-0 mt-auto grid list-none grid-cols-2 gap-2 p-0 pt-8">
                      {showcaseCountries.slice(0, 6).map((c) => (
                        <li
                          key={c.country_code}
                          className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                        >
                          <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-white">
                            <span aria-hidden="true">{countryFlag(c.country_code)}</span>
                            <span className="truncate">{c.country_code}</span>
                          </span>
                          <span className="font-mono text-[11px] text-ink-300">{pixelSize(c.country_code)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            5. TRUST (dark band)
           ================================================================ */}
        <section className="relative overflow-hidden bg-ink-950 section-padding" id="trust" aria-labelledby="trust-heading">
          <div className="container-narrow relative">
            <SectionHeader
              id="trust-heading"
              dark
              eyebrow={`Why trust ${SITE_NAME}`}
              title="Photo Rules You Can Verify, Not Just Trust"
              description={`${SITE_NAME} is built around published passport and visa photo specifications, and we keep every country profile under review. We are independent and not affiliated with any government.`}
            />

            <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2">
              {trustPoints.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-7 transition-colors hover:border-brand-400/40 hover:bg-white/[0.07]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-400/30" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-white sm:text-xl">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-300 sm:text-base">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            6. PHOTO RULES
           ================================================================ */}
        <section className="section-padding" id="photo-rules" aria-labelledby="rules-heading">
          <div className="container-narrow">
            <SectionHeader
              id="rules-heading"
              eyebrow="Common photo rules"
              title="Rules & Guidance for Digital Passport Photos"
              description="Most countries follow similar biometric photo standards. These are the common rules for online applications, phone photos, and child photos. Always confirm the exact requirements with your country's issuing authority."
            />

            <div className="mt-14 grid gap-5 lg:grid-cols-12">
              {/* Digital photos overview */}
              <div className="surface p-7 sm:p-8 lg:col-span-5">
                <span className="icon-tile" aria-hidden="true">
                  <FileText className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold text-ink-950">Digital photos</h3>
                <p className="mt-2 text-base font-medium text-ink-800">
                  Many countries accept or require a digital photo when you apply for a passport or visa online.
                </p>
                <ul className="m-0 mt-5 list-none space-y-3 p-0 text-sm text-ink-700 sm:text-base">
                  <CheckItem>
                    Most passport offices ask for a new photo when you get a new passport, even if your appearance has
                    not changed.
                  </CheckItem>
                  <CheckItem>Your photo must be recent. Check how recently your country requires it to have been taken.</CheckItem>
                </ul>
                <p className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-950">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                  Your application may be delayed or refused if your photos do not meet the rules.
                </p>
                <p className="mt-5 border-t border-ink-100 pt-5 text-sm text-ink-600">
                  If a disability or medical condition makes these rules hard to meet, contact the authority that
                  issues your document. Many offer help or exceptions.
                </p>
              </div>

              {/* Quality + what it must show */}
              <div className="surface p-7 sm:p-8 lg:col-span-7">
                <span className="icon-tile" aria-hidden="true">
                  <Shield className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold text-ink-950">Rules for digital photos</h3>

                <h4 className="mt-6 text-base font-bold text-ink-950 sm:text-lg">The quality of your digital photo</h4>
                <p className="mt-1 text-sm text-ink-600">Your photo must be:</p>
                <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
                  {qualityRules.map((rule) => (
                    <li
                      key={rule}
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-sm text-ink-800"
                    >
                      <Check className="h-3.5 w-3.5 text-brand-600" strokeWidth={3} aria-hidden="true" />
                      {rule}
                    </li>
                  ))}
                </ul>

                <h4 className="mt-7 text-base font-bold text-ink-950 sm:text-lg">What your digital photo must show</h4>
                <p className="mt-1 text-sm text-ink-600">The digital photo must:</p>
                <ul className="m-0 mt-3 list-none space-y-2.5 p-0 text-sm text-ink-700 sm:text-base">
                  {showRules.map((rule) => (
                    <CheckItem key={rule}>{rule}</CheckItem>
                  ))}
                </ul>

                <p className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm font-medium text-brand-900">
                  If you’re using a photo taken on your own device, include your head, shoulders and upper body. Do not
                  crop your photo - it will be done for you. Choose your country in our{" "}
                  <Link
                    href="/passport-size-photo-maker"
                    className="font-bold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 hover:text-brand-800"
                  >
                    passport size photo maker
                  </Link>{" "}
                  and it applies that country’s photo size automatically.
                </p>
              </div>

              {/* Pose */}
              <div className="surface p-7 sm:p-8 lg:col-span-7">
                <span className="icon-tile" aria-hidden="true">
                  <UserCheck className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold text-ink-950">In your photo you must</h3>
                <ul className="m-0 mt-5 grid list-none gap-3 p-0 text-sm text-ink-700 sm:grid-cols-2 sm:text-base">
                  {poseRules.map((rule) => (
                    <CheckItem key={rule}>{rule}</CheckItem>
                  ))}
                </ul>
                <div className="mt-6 rounded-2xl bg-ink-50 p-4 text-sm text-ink-800">
                  <strong className="text-ink-950">Glasses:</strong> Many countries do not allow glasses in passport
                  photos, so remove them unless your country permits them. Where glasses are allowed, they cannot be
                  sunglasses or tinted glasses, and you must make sure your eyes are not covered by the frames or any
                  glare, reflection or shadow.
                </div>
              </div>

              {/* Babies & children */}
              <div className="surface p-7 sm:p-8 lg:col-span-5">
                <span className="icon-tile" aria-hidden="true">
                  <Baby className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold text-ink-950">Photos of babies and children</h3>
                <ul className="m-0 mt-5 list-none space-y-3 p-0 text-sm text-ink-700 sm:text-base">
                  {childRules.map((rule) => (
                    <CheckItem key={rule}>{rule}</CheckItem>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            7. PRICING
           ================================================================ */}
        <section className="border-y border-ink-100 bg-ink-50 section-padding" id="pricing" aria-labelledby="pricing-heading">
          <div className="container-narrow">
            <SectionHeader
              id="pricing-heading"
              eyebrow="Transparent pricing"
              title="Passport Photo Maker Package"
              description="One-off payment for your complete digital photo and printable sheet. See your photo first, pay only if you like it."
            />

            <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
              {/* Standard */}
              <div className="relative flex flex-col rounded-[1.5rem] bg-ink-950 p-8 text-white shadow-lift ring-1 ring-ink-950">
                <span className="absolute -top-3 left-8 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
                <h3 className="text-lg font-extrabold text-white">{standardPlan.title}</h3>
                <p className="mt-1 text-sm text-ink-300">Ready-to-submit digital photo and 6×4″ printable sheet</p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-extrabold tracking-tight">{standardPlan.amountFormatted}</span>
                  <span className="text-sm font-medium text-ink-300">/photo</span>
                </p>
                <ul className="m-0 mt-8 list-none space-y-3 p-0 text-sm text-ink-200">
                  {standardBenefits.map((benefit) => (
                    <CheckItem key={benefit} tone="dark">
                      {benefit}
                    </CheckItem>
                  ))}
                </ul>
                <a href="#studio" className="btn-brand btn-lg mt-8 w-full">
                  Create Your Passport Photo Now
                </a>
              </div>

              {/* Expert */}
              <div className="flex flex-col rounded-[1.5rem] border border-ink-200 bg-white p-8">
                <h3 className="text-lg font-extrabold text-ink-950">{expertPlan.title}</h3>
                <p className="mt-1 text-sm text-ink-600">Your photo, plus a careful check by a person</p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-extrabold tracking-tight text-ink-950">
                    {expertPlan.amountFormatted}
                  </span>
                  <span className="text-sm font-medium text-ink-500">/photo</span>
                </p>
                <ul className="m-0 mt-8 list-none space-y-3 p-0 text-sm text-ink-700">
                  {expertBenefits.map((benefit) => (
                    <CheckItem key={benefit}>{benefit}</CheckItem>
                  ))}
                </ul>
                <p className="mt-6 text-xs text-ink-500">Choose Expert Edit on the preview page after your photo is processed.</p>
                <a href="#studio" className="btn-outline-brand btn-lg mt-auto w-full">
                  Start with my photo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            8. FAQ
           ================================================================ */}
        <section className="section-padding" id="faq" aria-labelledby="faq-heading">
          <div className="container-narrow">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <SectionHeader
                    id="faq-heading"
                    align="left"
                    eyebrow="Got questions?"
                    title="Frequently Asked Questions"
                    description="Common questions about country rules, renewals, cropping, and printing."
                  />
                  <Link href="/contact-us" className="btn-outline-brand mt-8">
                    Still stuck? Contact us
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="space-y-3 lg:col-span-8">
                {faqs.map(({ question, answer }, index) => (
                  <details
                    key={index}
                    className="group overflow-hidden rounded-2xl border border-ink-200 bg-white transition-colors open:border-brand-200 open:bg-brand-50/40 [&_summary::-webkit-details-marker]:hidden"
                    open={index === 0}
                  >
                    <summary className="flex cursor-pointer select-none items-center justify-between gap-4 p-5 font-display text-base font-bold text-ink-950 focus-ring sm:text-lg">
                      <span>{question}</span>
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-700 transition-all duration-200 group-open:rotate-45 group-open:bg-brand-600 group-open:text-white"
                        aria-hidden="true"
                      >
                        <Plus className="h-4 w-4" />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-sm leading-relaxed text-ink-700 sm:text-base">{answer}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
