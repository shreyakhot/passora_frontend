import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  CheckCircle,
  Check,
  Eye,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  SITE_URL,
  SITE_NAME,
  SUPPORT_EMAIL,
  LOGO_URL,
  SITE_DISCLAIMER,
} from "@/lib/site";
import { getPlanPricing } from "@/lib/config/pricing";

const PAGE_DESCRIPTION = `Learn about ${SITE_NAME} — our mission, privacy-first technology, official photo-size standards for 50+ countries, and commitment to accessible passport and visa photo creation.`;

export const metadata: Metadata = {
  title: "About Us — Passport & Visa Photo Maker for 50+ Countries",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/about-us`,
  },
  openGraph: {
    title: `About Us — ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/about-us`,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_URL,
        width: 640,
        height: 640,
        alt: `About ${SITE_NAME} — Passport & Visa Photo Maker`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `About Us — ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: [LOGO_URL],
  },
};

export default function AboutUsPage() {
  const standardPlan = getPlanPricing("standard");

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About Us",
        item: `${SITE_URL}/about-us`,
      },
    ],
  };

  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE_NAME}`,
    description: `${SITE_NAME} is an independent, privacy-focused online passport, visa and ID photo formatting tool for 50+ countries.`,
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
        width: 512,
        height: 512,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />

      <Navbar ctaText="Create Photo" ctaHref="/passport-size-photo-maker" />

      <main className="flex-1 bg-white text-slate-900" id="main-content">
        {/* Header & Hero */}
        <section className="bg-slate-50/80 py-10 sm:py-16 border-b border-slate-200/80" aria-label={`About ${SITE_NAME} header`}>
          <div className="container-narrow max-w-4xl">
            {/* Breadcrumb */}
            <nav className="text-xs text-slate-600 mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 list-none p-0 m-0">
                <li>
                  <Link href="/" className="text-slate-600 hover:text-lime-800 transition-colors font-medium">
                    Home 1234
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-slate-900 font-semibold" aria-current="page">
                  About Us
                </li>
              </ol>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-[#365314] text-xs font-bold mb-4">
              <span>🌍 PASSPORT &amp; VISA PHOTO SPECIALISTS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-4">
              About {SITE_NAME}
            </h1>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              {SITE_NAME} is an independent, privacy-focused online photo formatting and compliance tool for passport, visa and ID applicants in 50+ countries worldwide.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed font-medium mt-3">
              {SITE_DISCLAIMER}
            </p>
          </div>
        </section>

        {/* Main Content Article */}
        <article className="container-narrow max-w-4xl py-12 sm:py-16 space-y-12">
          {/* 1. Our Mission & Story */}
          <section aria-labelledby="mission-heading" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-50 border border-lime-200 flex items-center justify-center text-[#4D7C0F]" aria-hidden="true">
                <Award className="w-5 h-5" />
              </div>
              <h2 id="mission-heading" className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                Our Mission &amp; Purpose
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-base">
              Applying for or renewing a passport should not require searching for a coin-operated photo booth, paying extortionate studio fees, or risking application delays due to minor formatting errors.
            </p>
            <p className="text-slate-700 leading-relaxed text-base">
              Our mission is to give applicants everywhere the tools to transform a clear photo taken at home on a modern smartphone into a compliant biometric passport or visa picture in under 10 seconds — with zero data harvesting, transparent pricing, and sizing built around each country&rsquo;s official specifications.
            </p>
          </section>

          {/* 2. Problems We Solve */}
          <section aria-labelledby="problems-heading" className="space-y-6">
            <h2 id="problems-heading" className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              The Challenges We Solve
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                  <span>Preventing Photo Rejections</span>
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Many passport and visa photos are rejected because head size, eye level, or crown clearance falls outside the issuing authority&rsquo;s specifications. {SITE_NAME} calculates biometric ratios automatically for the country you select.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                  <span>Eliminating Booth Costs</span>
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Photo booths and studios often charge more for printed photos that cannot be uploaded digitally, offering no retakes or lighting adjustments. We provide both digital and printable files for a flat {standardPlan.amountFormatted}.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                  <span>Privacy First</span>
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Unlike platforms that catalogue personal faces to train AI models or sell contact data, we use your photo only to create the files you ordered. Our privacy policy explains what we keep and for how long.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#4D7C0F] shrink-0" aria-hidden="true" />
                  <span>Zero Software Needed</span>
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  No Photoshop, no image editors, and no technical skills required. Everything works in your browser on iOS, Android, macOS, and Windows.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Core Features & What We Provide */}
          <section aria-labelledby="features-heading" className="space-y-6">
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Core Capabilities &amp; Services
            </h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
              <ul className="space-y-3.5 list-none p-0 m-0">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 block">ICAO-Based Biometric Sizing:</strong>
                    <span className="text-slate-700 text-sm">Country-specific photo dimensions (such as 35 × 45 mm or 2 × 2 in) with head size, eye line and top clearance aligned to each country&rsquo;s published rules.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 block">50+ Global Country Document Standards:</strong>
                    <span className="text-slate-700 text-sm">Preset dimensions and rules for the United States (2×2″), the Schengen Area (35×45 mm), Australia, Canada, India, and many more — see the full <Link href="/tool" className="text-[#365314] font-semibold underline">country list</Link>.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 block">Standard 6×4″ (10×15 cm) Printable Grid:</strong>
                    <span className="text-slate-700 text-sm">Generates a 4-up or 6-up printable sheet ready for standard photo kiosks, print shops, or home photo printing.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 block">Smart In-Browser Compression:</strong>
                    <span className="text-slate-700 text-sm">Large uploads are compressed in your browser to 3 MB or less before processing, without sacrificing biometric facial clarity.</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Commitment to Accessibility & Privacy */}
          <section aria-labelledby="commitment-heading" className="space-y-6">
            <h2 id="commitment-heading" className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Commitment to Accessibility &amp; Data Ethics
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/70">
                <div className="w-10 h-10 rounded-xl bg-lime-50 border border-lime-200 text-[#4D7C0F] flex items-center justify-center mb-4" aria-hidden="true">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">WCAG 2.2 AA Accessibility</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  We believe preparing photos for official applications should be accessible to everyone. {SITE_NAME} is engineered to meet WCAG 2.2 Level AA accessibility standards, featuring complete keyboard navigation, high-contrast visual elements, screen-reader landmarks, and reduced-motion preferences.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/70">
                <div className="w-10 h-10 rounded-xl bg-lime-50 border border-lime-200 text-[#4D7C0F] flex items-center justify-center mb-4" aria-hidden="true">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Data Protection &amp; Privacy First</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  We handle personal data in line with applicable data-protection laws, including the GDPR where it applies. We do not require account creation, do not sell user data, and keep your photos only as long as needed to deliver and support your order — see our{" "}
                  <Link href="/privacy-policy" className="text-[#365314] font-semibold underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Contact & Support Information */}
          <section aria-labelledby="contact-summary-heading" className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 id="contact-summary-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Questions or Feedback?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Our support team is available to assist with any questions regarding passport and visa photo requirements, orders, or technical queries.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-2 bg-[#4D7C0F] hover:bg-[#3F650C] text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors focus-ring"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span>{SUPPORT_EMAIL}</span>
              </a>
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm px-5 py-3 rounded-xl border border-slate-700 transition-colors focus-ring"
              >
                <span>Contact Form</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}
