import type { Metadata } from "next";
import Link from "next/link";
import {
  Lock,
  EyeOff,
  Trash2,
  KeyRound,
  CreditCard,
  UserCheck,
  CheckCircle,
  Mail,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  ListOrdered,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, SUPPORT_EMAIL, LOGO_URL } from "@/lib/site";

const PAGE_DESCRIPTION = `How ${SITE_NAME} protects your photos and payments: TLS encryption, in-browser compression, server-side API keys and limited data collection.`;

export const metadata: Metadata = {
  title: "Data Security & Privacy Safeguards",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/data-security-privacy-safeguards`,
  },
  openGraph: {
    title: `Data Security & Privacy Safeguards — ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/data-security-privacy-safeguards`,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_URL,
        width: 640,
        height: 640,
        alt: `${SITE_NAME} Data Security & Privacy Safeguards`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `Data Security & Privacy Safeguards — ${SITE_NAME}`,
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

export default function DataSecurityPrivacySafeguardsPage() {
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
        name: "Data Security & Privacy Safeguards",
        item: `${SITE_URL}/data-security-privacy-safeguards`,
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
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-ink-100" aria-label="Data security and safeguards overview">

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
                  Data Security &amp; Privacy Safeguards
                </li>
              </ol>
            </nav>

            <div className="mt-4 max-w-3xl">
              <span className="eyebrow">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                PRIVACY-FIRST ARCHITECTURE
              </span>

              <h1 className="display-1 mt-5 text-ink-950">
                Data Security &amp; Privacy Safeguards
              </h1>
              <p className="lead mt-5 max-w-2xl">
                {SITE_NAME} is built from the ground up to protect your personal photographs and privacy. This document outlines our actual technical safeguards, transmission security, and data handling practices.
              </p>
            </div>
          </div>
        </section>

        <div className="container-narrow py-12 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
            <aside>
              <PageToc
                items={[
                  { id: "client-side-heading", label: "1. In-Browser Image Processing" },
                  { id: "encryption-heading", label: "2. Encrypted Transmission (TLS 1.3 / HTTPS)" },
                  { id: "retention-heading", label: "3. Limited Storage & Expiring Download Links" },
                  { id: "isolation-heading", label: "4. Server-Side Security Isolation" },
                  { id: "payment-heading", label: "5. Payment Processing Security" },
                  { id: "rights-heading", label: "6. User Privacy Rights & Client Storage Control" },
                  { id: "contact-sec-heading", label: "Security Contacts & Inquiries" },
                ]}
              />
            </aside>

            {/* Content Article */}
            <article className="min-w-0 max-w-[72ch] text-base leading-relaxed text-ink-600 sm:text-[1.0625rem]">
              {/* Summary Box */}
              <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
                <div className="relative">
                  <h2 className="flex items-center gap-3 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white" aria-hidden="true">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <span>Core Security Principles</span>
                  </h2>
                  <div className="mt-5 grid gap-3 text-sm font-medium text-ink-800 sm:grid-cols-2">
                    <div className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-white p-4">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                      <span>No facial-recognition database or biometric profiling</span>
                    </div>
                    <div className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-white p-4">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                      <span>Client-side in-browser image optimization</span>
                    </div>
                    <div className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-white p-4">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                      <span>End-to-end TLS 1.3 encrypted data transmission</span>
                    </div>
                    <div className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-white p-4">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                      <span>No user account creation required</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 divide-y divide-ink-100 [&>section]:py-10 [&>section:first-child]:pt-0">
                {/* 1. Client-Side Processing & Memory Handling */}
                <section aria-labelledby="client-side-heading" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="icon-tile" aria-hidden="true">
                      <EyeOff className="h-5 w-5" />
                    </span>
                    <h2 id="client-side-heading" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                      1. In-Browser Image Processing
                    </h2>
                  </div>
                  <p>
                    Whenever you upload a photograph to {SITE_NAME}, initial image inspection, local previews, and size pre-compression (down to &le; 3 MB) occur directly inside your browser via standard HTML5 Canvas and Web APIs.
                  </p>
                  <p>
                    This ensures your uncompressed high-resolution original file never leaves your computer or phone unnecessarily, minimizing bandwidth and exposure.
                  </p>
                </section>

                {/* 2. Encryption in Transit */}
                <section aria-labelledby="encryption-heading" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="icon-tile" aria-hidden="true">
                      <Lock className="h-5 w-5" />
                    </span>
                    <h2 id="encryption-heading" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                      2. Encrypted Transmission (TLS 1.3 / HTTPS)
                    </h2>
                  </div>
                  <p>
                    When processing requires automated biometric alignment and background formatting, your image payload is transmitted over an encrypted HTTPS connection utilizing modern Transport Layer Security (TLS 1.3) protocols.
                  </p>
                  <p>
                    HTTP Strict Transport Security (HSTS) is enforced to ensure man-in-the-middle attacks and protocol downgrades are prevented.
                  </p>
                </section>

                {/* 3. Zero Permanent Storage & Ephemeral Processing */}
                <section aria-labelledby="retention-heading" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="icon-tile" aria-hidden="true">
                      <Trash2 className="h-5 w-5" />
                    </span>
                    <h2 id="retention-heading" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                      3. Limited Storage &amp; Expiring Download Links
                    </h2>
                  </div>
                  <p>
                    {SITE_NAME} does not maintain a facial-recognition database, biometric repository, or public photo gallery of uploaded images.
                  </p>
                  <p>
                    Your processed photo, and the original photo you uploaded when you place an order, are stored with our secure cloud image-hosting provider only so we can deliver your files, carry out Expert Edit reviews, and handle support and refund requests. Download links are private and expire 72 hours after they are issued. See our{" "}
                    <Link href="/privacy-policy" className="font-semibold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 transition-colors hover:text-brand-800 hover:decoration-brand-600">Privacy Policy</Link>{" "}
                    for full retention details.
                  </p>
                </section>

                {/* 4. API Key Isolation & Server-Side Proxies */}
                <section aria-labelledby="isolation-heading" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="icon-tile" aria-hidden="true">
                      <KeyRound className="h-5 w-5" />
                    </span>
                    <h2 id="isolation-heading" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                      4. Server-Side Security Isolation
                    </h2>
                  </div>
                  <p>
                    All interactions with backend processing services are isolated inside Next.js server-side route handlers (<code className="rounded-md border border-brand-100 bg-brand-50 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-brand-800">/api/passport-photo</code>).
                  </p>
                  <p>
                    Secret API keys, credentials, and internal endpoints are never exposed to client browsers or visible in network inspection tools.
                  </p>
                </section>

                {/* 5. Payment Security */}
                <section aria-labelledby="payment-heading" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="icon-tile" aria-hidden="true">
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <h2 id="payment-heading" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                      5. Payment Processing Security
                    </h2>
                  </div>
                  <p>
                    Payment transactions are processed by Razorpay, a PCI-DSS compliant payment gateway.
                  </p>
                  <p>
                    {SITE_NAME} never handles, processes, or stores your raw credit or debit card numbers, CVVs, or banking credentials on our web servers.
                  </p>
                </section>

                {/* 6. User Privacy Rights & Local Control */}
                <section aria-labelledby="rights-heading" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="icon-tile" aria-hidden="true">
                      <UserCheck className="h-5 w-5" />
                    </span>
                    <h2 id="rights-heading" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                      6. User Privacy Rights &amp; Client Storage Control
                    </h2>
                  </div>
                  <p>
                    Result previews and session references are kept in your browser&rsquo;s temporary <code className="rounded-md border border-brand-100 bg-brand-50 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-brand-800">sessionStorage</code> and <code className="rounded-md border border-brand-100 bg-brand-50 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-brand-800">localStorage</code>.
                  </p>
                  <p>
                    You can instantly purge all locally stored references at any time simply by closing your browser tab or clearing your browser site data. Depending on applicable data-protection laws (including the GDPR where it applies), you may also have the right to request confirmation, a copy, or deletion of any data we hold about you.
                  </p>
                </section>
              </div>

              {/* 7. Incident Response & Security Contact */}
              <section aria-labelledby="contact-sec-heading" className="relative mt-6 overflow-hidden rounded-3xl bg-ink-950 p-7 text-white sm:p-10">
                <div className="relative space-y-4">
                  <h2 id="contact-sec-heading" className="scroll-mt-24 text-xl font-extrabold text-white sm:text-2xl">
                    Security Contacts &amp; Inquiries
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-ink-300 sm:text-base">
                    If you have any questions about our data security architecture or wish to report a security inquiry, please contact our technical team directly:
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
