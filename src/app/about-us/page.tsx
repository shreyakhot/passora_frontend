import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Check,
  ChevronRight,
  Eye,
  Globe,
  Info,
  Lock,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  Wallet,
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

      <main className="flex-1 bg-white text-ink-950" id="main-content">
        {/* Header & Hero */}
        <section className="relative overflow-hidden border-b border-ink-100" aria-label={`About ${SITE_NAME} header`}>
          <div className="pointer-events-none absolute inset-0 bg-dots [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand-200/50 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-32 top-1/2 h-[340px] w-[340px] rounded-full bg-violet-200/40 blur-3xl" aria-hidden="true" />

          <div className="container-narrow relative pb-16 pt-8 sm:pb-20 sm:pt-12 lg:pb-24">
            {/* Breadcrumb */}
            <nav className="text-sm" aria-label="Breadcrumb">
              <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-ink-500">
                <li>
                  <Link href="/" className="inline-flex min-h-11 items-center font-medium text-ink-500 transition-colors hover:text-brand-700">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
                </li>
                <li className="font-semibold text-ink-950" aria-current="page">
                  About Us
                </li>
              </ol>
            </nav>

            <div className="mt-4 max-w-3xl">
              <span className="eyebrow">
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                PASSPORT &amp; VISA PHOTO SPECIALISTS
              </span>

              <h1 className="display-1 mt-5 text-ink-950">
                About <span className="marker">{SITE_NAME}</span>
              </h1>
              <p className="lead mt-6 max-w-2xl">
                {SITE_NAME} is an independent, privacy-focused online photo formatting and compliance tool for passport, visa and ID applicants in 50+ countries worldwide.
              </p>
              <p className="mt-6 flex max-w-2xl items-start gap-2.5 rounded-2xl border border-ink-200 bg-white/80 p-4 text-sm font-medium leading-relaxed text-ink-600 shadow-soft backdrop-blur">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span>{SITE_DISCLAIMER}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Article */}
        <article>
          {/* 1. Our Mission & Story */}
          <section aria-labelledby="mission-heading" className="section-padding">
            <div className="container-narrow">
              <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-brand" aria-hidden="true">
                    <Award className="h-6 w-6" />
                  </span>
                  <h2 id="mission-heading" className="display-2 mt-6 text-ink-950">
                    Our Mission &amp; Purpose
                  </h2>
                </div>
                <div className="space-y-5 lg:col-span-7 lg:pt-2">
                  <p className="lead">
                    Applying for or renewing a passport should not require searching for a coin-operated photo booth, paying extortionate studio fees, or risking application delays due to minor formatting errors.
                  </p>
                  <p className="text-base leading-relaxed text-ink-600 sm:text-lg">
                    Our mission is to give applicants everywhere the tools to transform a clear photo taken at home on a modern smartphone into a compliant biometric passport or visa picture in under 10 seconds — with zero data harvesting, transparent pricing, and sizing built around each country&rsquo;s official specifications.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Problems We Solve */}
          <section aria-labelledby="problems-heading" className="border-y border-ink-100 bg-ink-50 section-padding">
            <div className="container-narrow">
              <div className="mx-auto max-w-2xl text-center">
                <h2 id="problems-heading" className="display-2 text-ink-950">
                  The Challenges We Solve
                </h2>
              </div>
              <div className="mt-12 grid gap-5 sm:grid-cols-2">
                <div className="surface surface-hover p-7">
                  <span className="icon-tile" aria-hidden="true">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-ink-950 sm:text-xl">
                    <span>Preventing Photo Rejections</span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">
                    Many passport and visa photos are rejected because head size, eye level, or crown clearance falls outside the issuing authority&rsquo;s specifications. {SITE_NAME} calculates biometric ratios automatically for the country you select.
                  </p>
                </div>

                <div className="surface surface-hover p-7">
                  <span className="icon-tile" aria-hidden="true">
                    <Wallet className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-ink-950 sm:text-xl">
                    <span>Eliminating Booth Costs</span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">
                    Photo booths and studios often charge more for printed photos that cannot be uploaded digitally, offering no retakes or lighting adjustments. We provide both digital and printable files for a flat {standardPlan.amountFormatted}.
                  </p>
                </div>

                <div className="surface surface-hover p-7">
                  <span className="icon-tile" aria-hidden="true">
                    <Lock className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-ink-950 sm:text-xl">
                    <span>Privacy First</span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">
                    Unlike platforms that catalogue personal faces to train AI models or sell contact data, we use your photo only to create the files you ordered. Our privacy policy explains what we keep and for how long.
                  </p>
                </div>

                <div className="surface surface-hover p-7">
                  <span className="icon-tile" aria-hidden="true">
                    <MonitorSmartphone className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-ink-950 sm:text-xl">
                    <span>Zero Software Needed</span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">
                    No Photoshop, no image editors, and no technical skills required. Everything works in your browser on iOS, Android, macOS, and Windows.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Core Features & What We Provide */}
          <section aria-labelledby="features-heading" className="section-padding">
            <div className="container-narrow">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-4">
                  <h2 id="features-heading" className="display-2 text-ink-950 lg:sticky lg:top-28">
                    Core Capabilities &amp; Services
                  </h2>
                </div>
                <div className="lg:col-span-8">
                  <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
                    <li className="surface flex items-start gap-4 p-6">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700" aria-hidden="true">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <div>
                        <strong className="block font-display text-base font-extrabold text-ink-950">ICAO-Based Biometric Sizing:</strong>
                        <span className="mt-1.5 block text-sm leading-relaxed text-ink-600">Country-specific photo dimensions (such as 35 × 45 mm or 2 × 2 in) with head size, eye line and top clearance aligned to each country&rsquo;s published rules.</span>
                      </div>
                    </li>
                    <li className="surface flex items-start gap-4 p-6">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700" aria-hidden="true">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <div>
                        <strong className="block font-display text-base font-extrabold text-ink-950">50+ Global Country Document Standards:</strong>
                        <span className="mt-1.5 block text-sm leading-relaxed text-ink-600">Preset dimensions and rules for the United States (2×2″), the Schengen Area (35×45 mm), Australia, Canada, India, and many more — pick your country in the <Link href="/passport-size-photo-maker" className="font-semibold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 transition-colors hover:text-brand-800 hover:decoration-brand-600">photo maker</Link>.</span>
                      </div>
                    </li>
                    <li className="surface flex items-start gap-4 p-6">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700" aria-hidden="true">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <div>
                        <strong className="block font-display text-base font-extrabold text-ink-950">Standard 6×4″ (10×15 cm) Printable Grid:</strong>
                        <span className="mt-1.5 block text-sm leading-relaxed text-ink-600">Generates a 4-up or 6-up printable sheet ready for standard photo kiosks, print shops, or home photo printing.</span>
                      </div>
                    </li>
                    <li className="surface flex items-start gap-4 p-6">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700" aria-hidden="true">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <div>
                        <strong className="block font-display text-base font-extrabold text-ink-950">Smart In-Browser Compression:</strong>
                        <span className="mt-1.5 block text-sm leading-relaxed text-ink-600">Large uploads are compressed in your browser to 3 MB or less before processing, without sacrificing biometric facial clarity.</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Commitment to Accessibility & Privacy */}
          <section aria-labelledby="commitment-heading" className="border-t border-ink-100 bg-ink-50 section-padding">
            <div className="container-narrow">
              <div className="mx-auto max-w-2xl text-center">
                <h2 id="commitment-heading" className="display-2 text-ink-950">
                  Commitment to Accessibility &amp; Data Ethics
                </h2>
              </div>
              <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
                <div className="surface surface-hover p-7 sm:p-8">
                  <span className="icon-tile" aria-hidden="true">
                    <Eye className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold text-ink-950">WCAG 2.2 AA Accessibility</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">
                    We believe preparing photos for official applications should be accessible to everyone. {SITE_NAME} is engineered to meet WCAG 2.2 Level AA accessibility standards, featuring complete keyboard navigation, high-contrast visual elements, screen-reader landmarks, and reduced-motion preferences.
                  </p>
                </div>

                <div className="surface surface-hover p-7 sm:p-8">
                  <span className="icon-tile" aria-hidden="true">
                    <Lock className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold text-ink-950">Data Protection &amp; Privacy First</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">
                    We handle personal data in line with applicable data-protection laws, including the GDPR where it applies. We do not require account creation, do not sell user data, and keep your photos only as long as needed to deliver and support your order — see our{" "}
                    <Link href="/privacy-policy" className="font-semibold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 transition-colors hover:text-brand-800 hover:decoration-brand-600">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Contact & Support Information */}
          <section aria-labelledby="contact-summary-heading" className="relative overflow-hidden bg-ink-950 section-padding">
            <div className="pointer-events-none absolute inset-0 bg-dots-dark" aria-hidden="true" />
            <div className="pointer-events-none absolute -top-48 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl" aria-hidden="true" />
            <div className="container-narrow relative">
              <div className="mx-auto max-w-2xl text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-400/30" aria-hidden="true">
                  <Mail className="h-6 w-6" />
                </span>
                <h2 id="contact-summary-heading" className="display-2 mt-6 text-white">
                  Questions or Feedback?
                </h2>
                <p className="lead mt-4 text-ink-300">
                  Our support team is available to assist with any questions regarding passport and visa photo requirements, orders, or technical queries.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="btn-brand btn-lg max-w-full"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="break-all">{SUPPORT_EMAIL}</span>
                  </a>
                  <Link
                    href="/contact-us"
                    className="btn-dark btn-lg border border-white/15 hover:border-white/30"
                  >
                    <span>Contact Form</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}
