import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
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

const PAGE_DESCRIPTION = `Review the ${SITE_NAME} Terms of Service governing the use of our passport and visa photo maker, digital formatting tools, and download services.`;

export const metadata: Metadata = {
  title: "Terms of Service",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/terms-of-service`,
  },
  openGraph: {
    title: `Terms of Service — ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/terms-of-service`,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_URL,
        width: 640,
        height: 640,
        alt: `${SITE_NAME} Terms of Service`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `Terms of Service — ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: [LOGO_URL],
  },
};

export default function TermsOfServicePage() {
  const standardPlan = getPlanPricing("standard");
  const expertPlan = getPlanPricing("expert_edit");

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
        name: "Terms of Service",
        item: `${SITE_URL}/terms-of-service`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar ctaText="Create Photo" ctaHref="/passport-size-photo-maker" />

      <main className="flex-1 bg-white text-slate-900" id="main-content">
        {/* Header */}
        <section className="bg-slate-50/80 py-10 sm:py-16 border-b border-slate-200/80" aria-label="Terms of Service header">
          <div className="container-narrow max-w-4xl">
            {/* Breadcrumb */}
            <nav className="text-xs text-slate-600 mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 list-none p-0 m-0">
                <li>
                  <Link href="/" className="text-slate-600 hover:text-lime-800 transition-colors font-medium">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-slate-900 font-semibold" aria-current="page">
                  Terms of Service
                </li>
              </ol>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-[#365314] text-xs font-bold mb-4">
              <span>LEGAL AGREEMENT</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-3">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Last Updated: 14 October 2026 · Please read these Terms carefully before using our service
            </p>
          </div>
        </section>

        {/* Content Article */}
        <article className="container-narrow max-w-4xl py-12 sm:py-16 space-y-10 text-slate-700 leading-relaxed text-base">
          {/* 1. Acceptance */}
          <section aria-labelledby="terms-acceptance" className="space-y-3">
            <h2 id="terms-acceptance" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              1. Acceptance of Terms
            </h2>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;) and the operator of {SITE_NAME} (&ldquo;{SITE_NAME}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), governing your access to and use of the website located at <Link href="/" className="text-[#365314] font-semibold underline">{SITE_URL}</Link> and associated photo formatting services.
            </p>
            <p>
              By accessing the website, uploading photos, or using any of our services, you confirm that you have read, understood, and agreed to be bound by these Terms. If you do not agree, you must cease using our website immediately.
            </p>
          </section>

          {/* 2. Description of Service */}
          <section aria-labelledby="terms-service" className="space-y-3">
            <h2 id="terms-service" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              2. Description of Service
            </h2>
            <p>
              {SITE_NAME} provides a web-based digital passport, visa and ID photo creation tool for 50+ countries. Our software assists users in cropping, aligning, sizing, checking dimensional parameters, and preparing high-resolution digital photos and 6×4″ printable sheets to the published photo specifications of the country and document selected by the user.
            </p>
          </section>

          {/* 3. User Responsibilities & Image Uploads */}
          <section aria-labelledby="terms-user-resp" className="space-y-3">
            <h2 id="terms-user-resp" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              3. User Responsibilities &amp; Content Rights
            </h2>
            <p>
              When using {SITE_NAME}, you represent, warrant, and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You are at least 18 years old or are accessing the service with the supervision and consent of a parent or legal guardian.
              </li>
              <li>
                You own the rights to the photograph you upload, or have explicit authorization from the subject (or the subject&rsquo;s parent/guardian) to process their photograph.
              </li>
              <li>
                The uploaded photograph is genuine, unmanipulated by deepfake or impersonation technology, and represents the true appearance of the applicant.
              </li>
              <li>
                You remain responsible for adhering to basic photography requirements (e.g. looking straight ahead, eyes open, neutral facial expression, clear lighting without heavy shadows, no tinted eyewear).
              </li>
            </ul>
          </section>

          {/* 4. Prohibited Usage */}
          <section aria-labelledby="terms-prohibited" className="space-y-3">
            <h2 id="terms-prohibited" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              4. Permitted and Prohibited Uses
            </h2>
            <p>
              You agree not to use {SITE_NAME} for any unlawful purpose or in any way that could impair the operation of the service. You may not:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Upload fraudulent, defamatory, obscene, harassing, or unlawful imagery.</li>
              <li>Attempt to reverse-engineer, decompile, scrape, or extract source code from the website.</li>
              <li>Use automated scripts, bots, or scrapers to access the service without express written consent.</li>
              <li>Bypass security controls, rate limits, or server isolation measures.</li>
            </ul>
          </section>

          {/* 5. Pricing and Payments */}
          <section aria-labelledby="terms-pricing" className="space-y-3">
            <h2 id="terms-pricing" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              5. Fees and Payment
            </h2>
            <p>
              Digital photo packages are offered at the prices shown on the website at the time of purchase — currently {standardPlan.amountFormatted} for the {standardPlan.title} and {expertPlan.amountFormatted} for {expertPlan.title} per completed photo result. Payment is processed securely by our third-party payment processor, Razorpay. Prices are charged in {standardPlan.currency} and are inclusive of applicable taxes. Your bank or card issuer may apply its own currency-conversion or foreign-transaction fees.
            </p>
            <p>
              Upon successful payment processing, the user is provided with immediate access to download the full high-resolution digital passport photo and printable 6×4″ sheet.
            </p>
          </section>

          {/* 6. Acceptance Disclaimer & Limitations */}
          <section aria-labelledby="terms-disclaimer" className="space-y-3">
            <h2 id="terms-disclaimer" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              6. Service Functionality &amp; Government Acceptance Disclaimer
            </h2>
            <p>
              {SITE_DISCLAIMER} {SITE_NAME} is a technical photo formatting utility and does not process, submit, or decide any passport, visa, or ID application.
            </p>
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 text-sm text-slate-800 font-medium">
              <p>
                <strong>Important Notice:</strong> While {SITE_NAME} algorithms adjust your photo to official dimensional specifications (photo size, head size, eye level, top clearance), final acceptance of any passport or visa application remains solely at the discretion of the issuing passport authority or consular examiner.
              </p>
            </div>
          </section>

          {/* 7. Refund Policy Reference */}
          <section aria-labelledby="terms-refunds" className="space-y-3">
            <h2 id="terms-refunds" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              7. Refunds &amp; Guarantee
            </h2>
            <p>
              Our refund policy and dimensional acceptance guarantee are governed by our dedicated <Link href="/refund-policy" className="text-[#365314] font-semibold underline">Refund Policy</Link>, which forms an integral part of these Terms.
            </p>
          </section>

          {/* 8. Intellectual Property */}
          <section aria-labelledby="terms-ip" className="space-y-3">
            <h2 id="terms-ip" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              8. Intellectual Property Rights
            </h2>
            <p>
              All website content, interfaces, logos, code, software, algorithms, and design assets on {SITE_NAME} are the exclusive property of the operator of {SITE_NAME} and are protected by applicable copyright, trademark, and database laws.
            </p>
            <p>
              You retain full copyright and ownership of any photograph you upload to our platform.
            </p>
          </section>

          {/* 9. Limitation of Liability */}
          <section aria-labelledby="terms-liability" className="space-y-3">
            <h2 id="terms-liability" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              9. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, {SITE_NAME} shall not be liable for any indirect, incidental, consequential, special, or punitive damages, including missed travel, application rescheduling fees, or lost profits arising from the use of or inability to use the service.
            </p>
            <p>
              Nothing in these Terms limits or excludes liability for death or personal injury caused by negligence, fraud, or any liability that cannot be excluded under applicable law, including any mandatory consumer rights you have in your country of residence.
            </p>
          </section>

          {/* 10. Governing Law */}
          <section aria-labelledby="terms-governing" className="space-y-3">
            <h2 id="terms-governing" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              10. Governing Law and Jurisdiction
            </h2>
            <p>
              These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of the jurisdiction in which the operator of {SITE_NAME} is established, and the courts of that jurisdiction shall have jurisdiction. This does not affect any mandatory consumer-protection rights you may have under the laws of your country of residence.
            </p>
          </section>

          {/* 11. Contact Information */}
          <section aria-labelledby="terms-contact" className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 id="terms-contact" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              11. Contact Us Regarding Terms
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              If you have any questions or clarifications regarding these Terms of Service, please contact our support team:
            </p>
            <div className="pt-2">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-2 bg-[#4D7C0F] hover:bg-[#3F650C] text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors focus-ring"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span>{SUPPORT_EMAIL}</span>
              </a>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}
