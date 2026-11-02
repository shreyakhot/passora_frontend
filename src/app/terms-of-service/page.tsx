import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileText,
  ListOrdered,
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

type TocItem = { id: string; label: string };

/** "On this page" navigation built from the section headings below. */
function PageToc({ items }: { items: TocItem[] }) {
  const links = (linkClassName: string) => (
    <ol className="m-0 list-none p-0">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className={linkClassName}>
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      {/* Mobile / tablet: collapsible */}
      <details className="surface group overflow-hidden lg:hidden [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex min-h-12 cursor-pointer select-none list-none items-center justify-between gap-3 px-5 py-3 text-sm font-bold text-ink-950 focus-ring">
          <span className="flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-brand-600" aria-hidden="true" />
            On this page
          </span>
          <ChevronDown
            className="h-4 w-4 text-ink-500 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <nav aria-label="On this page" className="border-t border-ink-100 px-2 py-2">
          {links(
            "flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
          )}
        </nav>
      </details>

      {/* Desktop: sticky sidebar */}
      <nav aria-label="On this page" className="hidden lg:sticky lg:top-24 lg:block">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">On this page</p>
        <div className="border-l border-ink-200">
          {links(
            "-ml-px block border-l-2 border-transparent py-2 pl-4 pr-2 text-sm font-medium leading-snug text-ink-600 transition-colors hover:border-brand-600 hover:text-ink-950"
          )}
        </div>
      </nav>
    </>
  );
}

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

      <main className="flex-1 bg-white text-ink-950" id="main-content">
        {/* Header */}
        <section className="relative overflow-hidden border-b border-ink-100" aria-label="Terms of Service header">

          <div className="container-narrow relative pb-14 pt-8 sm:pb-20 sm:pt-12">
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
                  Terms of Service
                </li>
              </ol>
            </nav>

            <div className="mt-4 max-w-3xl">
              <span className="eyebrow">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                LEGAL AGREEMENT
              </span>

              <h1 className="display-1 mt-5 text-ink-950">
                Terms of Service
              </h1>
              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-ink-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 shadow-soft">
                  <CalendarDays className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                  Last Updated: 14 October 2026
                </span>
                <span>
                  <span className="sr-only">· </span>
                  Please read these Terms carefully before using our service
                </span>
              </p>
            </div>
          </div>
        </section>

        <div className="container-narrow py-12 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
            <aside>
              <PageToc
                items={[
                  { id: "terms-acceptance", label: "1. Acceptance of Terms" },
                  { id: "terms-service", label: "2. Description of Service" },
                  { id: "terms-user-resp", label: "3. User Responsibilities & Content Rights" },
                  { id: "terms-prohibited", label: "4. Permitted and Prohibited Uses" },
                  { id: "terms-pricing", label: "5. Fees and Payment" },
                  { id: "terms-disclaimer", label: "6. Service Functionality & Government Acceptance Disclaimer" },
                  { id: "terms-refunds", label: "7. Refunds & Guarantee" },
                  { id: "terms-ip", label: "8. Intellectual Property Rights" },
                  { id: "terms-liability", label: "9. Limitation of Liability" },
                  { id: "terms-governing", label: "10. Governing Law and Jurisdiction" },
                  { id: "terms-contact", label: "11. Contact Us Regarding Terms" },
                ]}
              />
            </aside>

            {/* Content Article */}
            <article className="min-w-0 max-w-[72ch] text-base leading-relaxed text-ink-600 sm:text-[1.0625rem]">
              <div className="divide-y divide-ink-100 [&>section]:py-10 [&>section:first-child]:pt-0">
                {/* 1. Acceptance */}
                <section aria-labelledby="terms-acceptance" className="space-y-4">
                  <h2 id="terms-acceptance" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    1. Acceptance of Terms
                  </h2>
                  <p>
                    These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;) and the operator of {SITE_NAME} (&ldquo;{SITE_NAME}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), governing your access to and use of the website located at <Link href="/" className="font-semibold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 transition-colors hover:text-brand-800 hover:decoration-brand-600">{SITE_URL}</Link> and associated photo formatting services.
                  </p>
                  <p>
                    By accessing the website, uploading photos, or using any of our services, you confirm that you have read, understood, and agreed to be bound by these Terms. If you do not agree, you must cease using our website immediately.
                  </p>
                </section>

                {/* 2. Description of Service */}
                <section aria-labelledby="terms-service" className="space-y-4">
                  <h2 id="terms-service" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    2. Description of Service
                  </h2>
                  <p>
                    {SITE_NAME} provides a web-based digital passport, visa and ID photo creation tool for 50+ countries. Our software assists users in cropping, aligning, sizing, checking dimensional parameters, and preparing high-resolution digital photos and 6×4″ printable sheets to the published photo specifications of the country and document selected by the user.
                  </p>
                </section>

                {/* 3. User Responsibilities & Image Uploads */}
                <section aria-labelledby="terms-user-resp" className="space-y-4">
                  <h2 id="terms-user-resp" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    3. User Responsibilities &amp; Content Rights
                  </h2>
                  <p>
                    When using {SITE_NAME}, you represent, warrant, and agree that:
                  </p>
                  <ul className="list-disc space-y-2.5 pl-5 marker:text-brand-600">
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
                <section aria-labelledby="terms-prohibited" className="space-y-4">
                  <h2 id="terms-prohibited" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    4. Permitted and Prohibited Uses
                  </h2>
                  <p>
                    You agree not to use {SITE_NAME} for any unlawful purpose or in any way that could impair the operation of the service. You may not:
                  </p>
                  <ul className="list-disc space-y-2.5 pl-5 marker:text-brand-600">
                    <li>Upload fraudulent, defamatory, obscene, harassing, or unlawful imagery.</li>
                    <li>Attempt to reverse-engineer, decompile, scrape, or extract source code from the website.</li>
                    <li>Use automated scripts, bots, or scrapers to access the service without express written consent.</li>
                    <li>Bypass security controls, rate limits, or server isolation measures.</li>
                  </ul>
                </section>

                {/* 5. Pricing and Payments */}
                <section aria-labelledby="terms-pricing" className="space-y-4">
                  <h2 id="terms-pricing" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
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
                <section aria-labelledby="terms-disclaimer" className="space-y-4">
                  <h2 id="terms-disclaimer" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    6. Service Functionality &amp; Government Acceptance Disclaimer
                  </h2>
                  <p>
                    {SITE_DISCLAIMER} {SITE_NAME} is a technical photo formatting utility and does not process, submit, or decide any passport, visa, or ID application.
                  </p>
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-950 sm:text-base">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
                    <p>
                      <strong>Important Notice:</strong> While {SITE_NAME} algorithms adjust your photo to official dimensional specifications (photo size, head size, eye level, top clearance), final acceptance of any passport or visa application remains solely at the discretion of the issuing passport authority or consular examiner.
                    </p>
                  </div>
                </section>

                {/* 7. Refund Policy Reference */}
                <section aria-labelledby="terms-refunds" className="space-y-4">
                  <h2 id="terms-refunds" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    7. Refunds &amp; Guarantee
                  </h2>
                  <p>
                    Our refund policy and dimensional acceptance guarantee are governed by our dedicated <Link href="/refund-policy" className="font-semibold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 transition-colors hover:text-brand-800 hover:decoration-brand-600">Refund Policy</Link>, which forms an integral part of these Terms.
                  </p>
                </section>

                {/* 8. Intellectual Property */}
                <section aria-labelledby="terms-ip" className="space-y-4">
                  <h2 id="terms-ip" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
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
                <section aria-labelledby="terms-liability" className="space-y-4">
                  <h2 id="terms-liability" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
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
                <section aria-labelledby="terms-governing" className="space-y-4">
                  <h2 id="terms-governing" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    10. Governing Law and Jurisdiction
                  </h2>
                  <p>
                    These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of the jurisdiction in which the operator of {SITE_NAME} is established, and the courts of that jurisdiction shall have jurisdiction. This does not affect any mandatory consumer-protection rights you may have under the laws of your country of residence.
                  </p>
                </section>
              </div>

              {/* 11. Contact Information */}
              <section aria-labelledby="terms-contact" className="relative mt-6 overflow-hidden rounded-3xl bg-ink-950 p-7 text-white sm:p-10">
                <div className="relative space-y-4">
                  <h2 id="terms-contact" className="scroll-mt-24 text-xl font-extrabold text-white sm:text-2xl">
                    11. Contact Us Regarding Terms
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-ink-300 sm:text-base">
                    If you have any questions or clarifications regarding these Terms of Service, please contact our support team:
                  </p>
                  <div className="pt-2">
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="btn-brand max-w-full"
                    >
                      <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="break-all">{SUPPORT_EMAIL}</span>
                    </a>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
