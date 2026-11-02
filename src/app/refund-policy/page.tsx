import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
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

const PAGE_DESCRIPTION = `Review ${SITE_NAME}'s transparent refund policy, official dimensional acceptance guarantee, eligible refund scenarios, and claims procedure.`;

export const metadata: Metadata = {
  title: "Refund Policy & Acceptance Guarantee",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/refund-policy`,
  },
  openGraph: {
    title: `Refund Policy & Acceptance Guarantee — ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/refund-policy`,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_URL,
        width: 640,
        height: 640,
        alt: `${SITE_NAME} Refund Policy & Acceptance Guarantee`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `Refund Policy & Acceptance Guarantee — ${SITE_NAME}`,
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

export default function RefundPolicyPage() {
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
        name: "Refund Policy",
        item: `${SITE_URL}/refund-policy`,
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
        <section className="relative overflow-hidden border-b border-ink-100" aria-label="Refund Policy header">

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
                  Refund Policy
                </li>
              </ol>
            </nav>

            <div className="mt-4 max-w-3xl">
              <span className="eyebrow">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                ACCEPTANCE GUARANTEE
              </span>

              <h1 className="display-1 mt-5 text-ink-950">
                Refund Policy &amp; Acceptance Guarantee
              </h1>
              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-ink-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 shadow-soft">
                  <CalendarDays className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                  Last Updated: 14 October 2026
                </span>
                <span>
                  <span className="sr-only">· </span>
                  Fair, transparent terms for every customer
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
                  { id: "refund-eligible", label: "1. Eligible Refund Scenarios" },
                  { id: "refund-ineligible", label: "2. Ineligible Refund Scenarios" },
                  { id: "refund-procedure", label: "3. How to Request a Refund" },
                  { id: "refund-timelines", label: "4. Processing Timelines" },
                  { id: "refund-contact", label: "5. Contact Support for Assistance" },
                ]}
              />
            </aside>

            {/* Content Article */}
            <article className="min-w-0 max-w-[72ch] text-base leading-relaxed text-ink-600 sm:text-[1.0625rem]">
              {/* Guarantee Summary Box */}
              <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
                <div className="relative">
                  <h2 className="flex items-center gap-3 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white" aria-hidden="true">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <span>Our Dimensional Acceptance Promise</span>
                  </h2>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-ink-800 sm:text-base">
                    We stand behind our automated cropping and biometric alignment engine. If a photo generated by {SITE_NAME} meeting our input guidelines is rejected by the issuing authority (such as a passport office, embassy, consulate or visa authority) for technical dimensional reasons, we will promptly re-process your photo for free or issue a 100% refund.
                  </p>
                  <p className="mt-4 border-t border-brand-200 pt-4 text-xs font-medium leading-relaxed text-ink-600 sm:text-sm">
                    {SITE_DISCLAIMER}
                  </p>
                </div>
              </div>

              <div className="mt-10 divide-y divide-ink-100 [&>section]:py-10 [&>section:first-child]:pt-0">
                {/* 1. Eligible Scenarios */}
                <section aria-labelledby="refund-eligible" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700" aria-hidden="true">
                      <CheckCircle className="h-5 w-5" />
                    </span>
                    <h2 id="refund-eligible" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                      1. Eligible Refund Scenarios
                    </h2>
                  </div>
                  <p>
                    You are entitled to a full refund under any of the following circumstances:
                  </p>
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-ink-200 bg-ink-50 p-5">
                      <strong className="mb-1 block font-bold text-ink-950">Official Government Rejection:</strong>
                      <span className="text-sm text-ink-600 sm:text-base">Your photo was rejected by the issuing authority for the passport, visa or ID document you selected specifically due to incorrect dimensions, cropping ratio, or technical sizing created by our tool (accompanied by proof of rejection).</span>
                    </div>
                    <div className="rounded-2xl border border-ink-200 bg-ink-50 p-5">
                      <strong className="mb-1 block font-bold text-ink-950">Technical System Delivery Failure:</strong>
                      <span className="text-sm text-ink-600 sm:text-base">You were charged, but technical server errors prevented generation or download of your final digital photo and print sheet, and our support team was unable to provide the files within 24 hours.</span>
                    </div>
                    <div className="rounded-2xl border border-ink-200 bg-ink-50 p-5">
                      <strong className="mb-1 block font-bold text-ink-950">Accidental Duplicate Charges:</strong>
                      <span className="text-sm text-ink-600 sm:text-base">You were billed more than once for the same photo processing session due to network or gateway glitches.</span>
                    </div>
                  </div>
                </section>

                {/* 2. Ineligible Scenarios */}
                <section aria-labelledby="refund-ineligible" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600" aria-hidden="true">
                      <XCircle className="h-5 w-5" />
                    </span>
                    <h2 id="refund-ineligible" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                      2. Ineligible Refund Scenarios
                    </h2>
                  </div>
                  <p>
                    Refunds cannot be granted in the following scenarios, as they depend on the user&rsquo;s original photograph and adherence to basic photography guidance:
                  </p>
                  <ul className="list-disc space-y-2.5 pl-5 marker:text-brand-600 [&_strong]:text-ink-950">
                    <li>
                      <strong>User Guideline Violations:</strong> Rejection caused by factors clearly warned against in our guidance checklist (e.g. subject smiling broadly, eyes closed, wearing dark sunglasses or thick frames covering eyes, severe blur, low-resolution original images, or obstructed face).
                    </li>
                    <li>
                      <strong>Change of Mind:</strong> Requesting a refund after successful generation and download of a technically compliant photo simply because you chose not to apply for the passport or changed plans.
                    </li>
                    <li>
                      <strong>Incorrect Country Selection:</strong> Sizing formatted correctly for the country selected by the user (e.g. you selected a 2×2″ photo when your application required 35×45 mm).
                    </li>
                    <li>
                      <strong>Failure to Provide Verification:</strong> Claiming rejection without providing the official rejection notice or email from the issuing authority.
                    </li>
                  </ul>
                </section>

                {/* 3. Refund Request Procedure */}
                <section aria-labelledby="refund-procedure" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="icon-tile h-10 w-10" aria-hidden="true">
                      <ClipboardList className="h-5 w-5" />
                    </span>
                    <h2 id="refund-procedure" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                      3. How to Request a Refund
                    </h2>
                  </div>
                  <p>
                    To submit a refund claim, please email our support team at <a href={`mailto:${SUPPORT_EMAIL}`} className="break-all font-bold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 transition-colors hover:text-brand-800 hover:decoration-brand-600">{SUPPORT_EMAIL}</a> within 30 days of your purchase date, including the following information:
                  </p>
                  <ol className="list-decimal space-y-2.5 pl-5 marker:font-bold marker:text-brand-600 [&_strong]:text-ink-950">
                    <li><strong>Your Full Name &amp; Email Address</strong> used during the transaction.</li>
                    <li><strong>Result ID or Transaction Reference</strong> (found on your preview page or bank statement).</li>
                    <li><strong>Reason for Request</strong> (explanation of the issue).</li>
                    <li><strong>Proof of Rejection</strong> (a screenshot or copy of the rejection email/letter from the issuing authority, if applicable).</li>
                  </ol>
                </section>

                {/* 4. Processing Timelines */}
                <section aria-labelledby="refund-timelines" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-ink-700" aria-hidden="true">
                      <Clock className="h-5 w-5" />
                    </span>
                    <h2 id="refund-timelines" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                      4. Processing Timelines
                    </h2>
                  </div>
                  <p>
                    Our support team reviews refund requests within <strong className="text-ink-950">2 business days</strong>. Once approved:
                  </p>
                  <ul className="list-disc space-y-2.5 pl-5 marker:text-brand-600 [&_strong]:text-ink-950">
                    <li>
                      Refunds are credited back directly to the original payment method (card or digital wallet).
                    </li>
                    <li>
                      Funds typically appear in your account within <strong>3 to 5 business days</strong>, depending on your bank or card issuer&rsquo;s processing schedule.
                    </li>
                  </ul>
                </section>
              </div>

              {/* 5. Contact Section */}
              <section aria-labelledby="refund-contact" className="relative mt-6 overflow-hidden rounded-3xl bg-ink-950 p-7 text-white sm:p-10">
                <div className="relative space-y-4">
                  <h2 id="refund-contact" className="scroll-mt-24 text-xl font-extrabold text-white sm:text-2xl">
                    5. Contact Support for Assistance
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-ink-300 sm:text-base">
                    If you have any difficulty with your photo download or have questions about a refund request, we are here to help:
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="btn-brand max-w-full"
                    >
                      <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="break-all">{SUPPORT_EMAIL}</span>
                    </a>
                    <Link
                      href="/contact-us"
                      className="btn-dark border border-white/15 hover:border-white/30"
                    >
                      <span>Contact Form</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
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
