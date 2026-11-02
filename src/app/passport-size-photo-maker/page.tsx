import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Printer } from "lucide-react";
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

      <main className="flex-1 bg-white text-ink-950" id="main-content">
        <section
          className="relative overflow-hidden border-b border-ink-100 bg-ink-50"
          aria-labelledby="maker-heading"
        >

          <div className="container-narrow relative pb-14 pt-8 sm:pb-20 sm:pt-12 lg:pb-24">
            {/* Breadcrumb */}
            <nav className="text-xs text-ink-500 sm:text-sm" aria-label="Breadcrumb">
              <ol className="m-0 flex list-none items-center gap-1.5 p-0">
                <li>
                  <Link
                    href="/"
                    className="font-medium text-ink-500 transition-colors hover:text-brand-700"
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
                </li>
                <li className="font-semibold text-ink-950" aria-current="page">
                  Passport Size Photo Maker
                </li>
              </ol>
            </nav>

            <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
              {/* Copy column */}
              <div className="lg:col-span-5 lg:pt-4">
                <span className="eyebrow">Photo studio</span>
                <h1 id="maker-heading" className="display-2 mt-4 text-ink-950">
                  Passport Photo <span className="marker">Maker</span>
                </h1>
                <p className="lead mt-4 max-w-xl">
                  Select your country, upload your photo, and let AI automatically size and verify biometrics in 10 seconds.
                </p>
                <ul className="m-0 mt-8 list-none space-y-4 p-0 text-sm text-ink-700 sm:text-base">
                  {[
                    "Preview the finished photo before you pay",
                    "Digital file plus a 6×4″ print sheet",
                    "Your upload is used only to make your photo",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700"
                        aria-hidden="true"
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Unified Photo Maker Studio Component */}
              <div className="lg:col-span-7">
                <PhotoMakerStudio defaultDocumentType="passport" />
                <OfficialPhotoNotice className="mt-5 bg-white" />
              </div>
            </div>
          </div>
        </section>

        {/* Print Template Generator Feature Card */}
        <section className="section-padding" aria-labelledby="print-heading">
          <div className="container-narrow">
            <div className="relative overflow-hidden rounded-[1.5rem] bg-ink-950 p-7 text-white shadow-lift sm:p-10">
              <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-start gap-5">
                  <span
                    className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-400/30 sm:flex"
                    aria-hidden="true"
                  >
                    <Printer className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="eyebrow eyebrow-dark">Free 4×6″ &amp; A4 Print Sheets</span>
                    <h2 id="print-heading" className="mt-3 text-xl font-extrabold text-white sm:text-2xl">
                      Need to print on 4×6″ (10×15 cm) paper?
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-300 sm:text-base">
                      Tile multiple passport photos onto standard 4×6″ or A4 sheets with cutting guides. Print them at a local pharmacy, photo shop, or on your home printer.
                    </p>
                  </div>
                </div>
                <Link
                  href="/passport-photo-print-template-generator"
                  className="btn-light btn-lg shrink-0"
                >
                  <span>Open Print Generator</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}