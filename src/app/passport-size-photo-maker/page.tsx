import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import PhotoMakerStudio from "@/components/PhotoMakerStudio";
import OfficialPhotoNotice from "@/components/OfficialPhotoNotice";
import { LOGO_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import { PRICING, getPlanPricing } from "@/lib/config/pricing";

const standardPlan = getPlanPricing("standard");

const PAGE_URL = `${SITE_URL}/passport-size-photo-maker`;
const SOCIAL_TITLE = `Passport Size Photo Maker Online — ${SITE_NAME}`;
const SOCIAL_DESCRIPTION =
  "Create biometric passport and visa photos online for the US, UK, Canada, India, the Schengen Area and 50+ countries. Automatic cropping, AI verification, and instant download.";

export const metadata: Metadata = {
  title: "Passport Size Photo Maker Online: US, UK, Schengen & 50+ Countries",
  description:
    "Make passport and visa photos online for the US (2×2″), UK and Schengen Area (35×45 mm), Canada, India and 50+ countries. Automatic cropping and sizing, then download or print.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_URL,
        width: 640,
        height: 640,
        alt: SOCIAL_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [LOGO_URL],
  },
};

export default function PassportSizePhotoMakerPage() {
  return (
    <>
      <JsonLd
        siteUrl={SITE_URL}
        siteName={SITE_NAME}
        price={standardPlan.amount.toFixed(2)}
        priceCurrency={PRICING.currency}
        appUrl={PAGE_URL}
        appId={`${SITE_URL}/#webapp`}
        description="Create official biometric passport size photos online with instant verification and printable 6x4 inch sheet."
        breadcrumbs={[
          { name: "Home", url: SITE_URL },
          {
            name: "Passport Size Photo Maker",
            url: PAGE_URL,
          },
        ]}
        includeOrganization={false}
        includeWebsite={false}
        includeWebApp={true}
      />

      <Navbar ctaText="Home" ctaHref="/" />

      <main
        className="flex-1 bg-slate-50 min-h-screen py-6 sm:py-12 text-slate-900"
        id="main-content"
      >
        <div className="container-narrow max-w-3xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb & Header */}
          <div className="text-center mb-5 sm:mb-7">
            <nav
              className="text-xs text-slate-600 mb-2 flex justify-center"
              aria-label="Breadcrumb"
            >
              <ol className="flex items-center gap-1.5 list-none p-0 m-0">
                <li>
                  <Link
                    href="/"
                    className="text-slate-600 hover:text-lime-800 transition-colors font-medium"
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li
                  className="text-slate-900 font-semibold"
                  aria-current="page"
                >
                  Passport Size Photo Maker
                </li>
              </ol>
            </nav>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Passport Photo Maker
            </h1>
            <p className="text-slate-700 text-xs sm:text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
              Select your country, upload your photo, and let AI automatically size and verify biometrics in 10 seconds.
            </p>
          </div>

          {/* Unified Photo Maker Studio Component */}
          <PhotoMakerStudio defaultDocumentType="passport" />
          <OfficialPhotoNotice className="mt-5" />

          {/* Print Template Generator Feature Card */}
          <div className="mt-8 bg-gradient-to-br from-lime-900 via-slate-900 to-slate-900 border border-lime-600/40 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-lime-500/20 text-lime-300 font-mono text-[11px] font-bold uppercase tracking-wider mb-2 border border-lime-500/30">
                  Free 4×6″ &amp; A4 Print Sheets
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Need to print on 4×6″ (10×15 cm) paper?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
                  Tile multiple passport photos onto standard 4×6″ or A4 sheets with cutting guides. Print them at a local pharmacy, photo shop, or on your home printer.
                </p>
              </div>
              <Link
                href="/passport-photo-print-template-generator"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shrink-0 shadow-sm"
              >
                <span>Open Print Generator</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}