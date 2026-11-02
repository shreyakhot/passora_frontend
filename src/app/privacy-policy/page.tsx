import type { Metadata } from "next";
import Link from "next/link";
import { Mail, CalendarDays, ChevronDown, ChevronRight, ListOrdered, Scale } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  SITE_URL,
  SITE_NAME,
  SUPPORT_EMAIL,
  LOGO_URL,
  SITE_DISCLAIMER,
} from "@/lib/site";

const PAGE_DESCRIPTION = `Read the ${SITE_NAME} Privacy Policy. Understand what data we collect, how we use and protect it, our cookie practices, and your data-protection rights.`;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/privacy-policy`,
  },
  openGraph: {
    title: `Privacy Policy — ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/privacy-policy`,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_URL,
        width: 640,
        height: 640,
        alt: `${SITE_NAME} Privacy Policy`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `Privacy Policy — ${SITE_NAME}`,
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

export default function PrivacyPolicyPage() {
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
        name: "Privacy Policy",
        item: `${SITE_URL}/privacy-policy`,
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
        <section className="relative overflow-hidden border-b border-ink-100" aria-label="Privacy Policy header">
          <div className="pointer-events-none absolute inset-0 bg-dots [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-[440px] w-[440px] rounded-full bg-brand-200/50 blur-3xl" aria-hidden="true" />

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
                  Privacy Policy
                </li>
              </ol>
            </nav>

            <div className="mt-4 max-w-3xl">
              <span className="eyebrow">
                <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                LEGAL &amp; COMPLIANCE
              </span>

              <h1 className="display-1 mt-5 text-ink-950">
                Privacy Policy
              </h1>
              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-ink-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 shadow-soft">
                  <CalendarDays className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                  Last Updated: 14 October 2026
                </span>
                <span>
                  <span className="sr-only">· </span>
                  Applicable data-protection laws, including the GDPR where it applies
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
                  { id: "section-intro", label: "1. Introduction & Scope" },
                  { id: "section-collection", label: "2. Information We Collect" },
                  { id: "section-basis", label: "3. Purpose and Legal Basis for Processing" },
                  { id: "section-cookies", label: "4. Cookies, Local Storage and Analytics" },
                  { id: "section-payment", label: "5. Payment Processing" },
                  { id: "section-retention", label: "6. Data Retention and Deletion" },
                  { id: "section-transfers", label: "7. Third-Party Service Providers & Data Transfers" },
                  { id: "section-children", label: "8. Children’s Privacy" },
                  { id: "section-rights", label: "9. Your Privacy Rights" },
                  { id: "section-contact", label: "10. Contact & Privacy Requests" },
                ]}
              />
            </aside>

            {/* Content Article */}
            <article className="min-w-0 max-w-[72ch] text-base leading-relaxed text-ink-600 sm:text-[1.0625rem]">
              <div className="divide-y divide-ink-100 [&>section]:py-10 [&>section:first-child]:pt-0">
                {/* 1. Introduction */}
                <section aria-labelledby="section-intro" className="space-y-4">
                  <h2 id="section-intro" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    1. Introduction &amp; Scope
                  </h2>
                  <p>
                    {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), accessible at <Link href="/" className="font-semibold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 transition-colors hover:text-brand-800 hover:decoration-brand-600">{SITE_URL}</Link>, provides an online passport, visa and ID photo formatting platform for customers worldwide. {SITE_DISCLAIMER}
                  </p>
                  <p>
                    We are committed to safeguarding the privacy and personal data of our website visitors and service users. This Privacy Policy explains what personal information we collect, how we process it, the legal bases we rely on where the EU General Data Protection Regulation (GDPR) or similar laws apply, and the rights you may have under applicable data-protection laws.
                  </p>
                  <p>
                    The operator of {SITE_NAME} is responsible for your personal data as data controller and can be contacted at <a href={`mailto:${SUPPORT_EMAIL}`} className="break-all font-semibold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 transition-colors hover:text-brand-800 hover:decoration-brand-600">{SUPPORT_EMAIL}</a>.
                  </p>
                </section>

                {/* 2. Information We Collect */}
                <section aria-labelledby="section-collection" className="space-y-4">
                  <h2 id="section-collection" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    2. Information We Collect
                  </h2>
                  <p>
                    We adhere strictly to the principle of data minimisation. We only collect or process data required to deliver our photo creation and customer support services:
                  </p>
                  <ul className="list-disc space-y-2.5 pl-5 marker:text-brand-600 [&_strong]:text-ink-950">
                    <li>
                      <strong>User-Uploaded Photographs:</strong> Image files (JPEG, PNG, WebP) uploaded to format, crop, and verify passport dimensions, and the processed passport or visa photo we generate from them.
                    </li>
                    <li>
                      <strong>Order Information:</strong> The email address you enter at checkout (used to deliver your photo, download link and invoice), the country and document type you selected, the plan purchased, the amount and currency, and payment status and transaction references returned by our payment processor.
                    </li>
                    <li>
                      <strong>Customer Support Data:</strong> Information provided voluntarily when contacting us (your name, email address, subject, result ID, and message content).
                    </li>
                    <li>
                      <strong>Technical &amp; Usage Data:</strong> Your browser user-agent and a one-way hashed (never raw) IP address recorded with your order, order-related activity events (such as checkout started, payment completed, or file downloaded), and standard server logs used for system security, troubleshooting and anti-fraud monitoring.
                    </li>
                  </ul>
                </section>

                {/* 3. Purpose and Legal Basis for Processing */}
                <section aria-labelledby="section-basis" className="space-y-4">
                  <h2 id="section-basis" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    3. Purpose and Legal Basis for Processing
                  </h2>
                  <p>
                    Where the GDPR applies, we process your personal data under the following legal bases set out in Article 6:
                  </p>
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-ink-200 bg-ink-50 p-5">
                      <strong className="mb-1 block font-bold text-ink-950">Performance of a Contract (Article 6(1)(b)):</strong>
                      <span className="text-sm text-ink-600 sm:text-base">Processing uploaded images to generate compliant digital passport photos and 6×4″ printable sheets requested by you, taking payment, and emailing your files and invoice.</span>
                    </div>
                    <div className="rounded-2xl border border-ink-200 bg-ink-50 p-5">
                      <strong className="mb-1 block font-bold text-ink-950">Legitimate Interests (Article 6(1)(f)):</strong>
                      <span className="text-sm text-ink-600 sm:text-base">Responding to customer inquiries, preventing abuse and fraud, ensuring server security, understanding how the website is used, and maintaining website stability.</span>
                    </div>
                    <div className="rounded-2xl border border-ink-200 bg-ink-50 p-5">
                      <strong className="mb-1 block font-bold text-ink-950">Legal Obligation (Article 6(1)(c)):</strong>
                      <span className="text-sm text-ink-600 sm:text-base">Retaining financial transaction records and invoices for statutory accounting and tax compliance where applicable.</span>
                    </div>
                  </div>
                </section>

                {/* 4. Cookies and Client Storage */}
                <section aria-labelledby="section-cookies" className="space-y-4">
                  <h2 id="section-cookies" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    4. Cookies, Local Storage and Analytics
                  </h2>
                  <p>
                    {SITE_NAME} does not use advertising cookies or sell data to advertising networks. We use the following browser storage and analytics tools:
                  </p>
                  <ul className="list-disc space-y-2.5 pl-5 marker:text-brand-600 [&_strong]:text-ink-950">
                    <li>
                      <strong>Session &amp; Local Storage (<code className="rounded-md border border-brand-100 bg-brand-50 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-brand-800">sessionStorage</code> / <code className="rounded-md border border-brand-100 bg-brand-50 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-brand-800">localStorage</code>):</strong> Used to preserve your active photo processing result across browser navigation so you can view, purchase and download your generated photo.
                    </li>
                    <li>
                      <strong>Website Analytics:</strong> Where enabled, we use Google Analytics and Microsoft Clarity to understand how visitors use the website (for example pages visited, device type, and on-page interactions such as clicks and scrolling). These services may set their own cookies and process data under their own privacy policies.
                    </li>
                    <li>
                      You can clear locally stored session data at any time by clearing your browser site data, and you can block or delete cookies through your browser settings.
                    </li>
                  </ul>
                </section>

                {/* 5. Payment Processing */}
                <section aria-labelledby="section-payment" className="space-y-4">
                  <h2 id="section-payment" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    5. Payment Processing
                  </h2>
                  <p>
                    When you purchase a digital passport photo package, payment is handled by Razorpay, our third-party payment processor. We never collect, store, or view full payment card numbers or banking credentials; we receive only the payment status and transaction references needed to fulfil and support your order.
                  </p>
                </section>

                {/* 6. Data Retention & Deletion */}
                <section aria-labelledby="section-retention" className="space-y-4">
                  <h2 id="section-retention" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    6. Data Retention and Deletion
                  </h2>
                  <p>
                    Processed passport photos, and the original photo you uploaded when you place an order, are stored with our cloud image-hosting provider so we can deliver your files, provide Expert Edit review where purchased, and handle support and refund requests. They are kept only for as long as needed for those purposes, and you can ask us to delete them at any time.
                  </p>
                  <p>
                    Download links sent by email expire 72 hours after they are issued. Order activity logs are automatically deleted after 90 days. Order, payment and invoice records are retained for as long as required for accounting and tax purposes.
                  </p>
                  <p>
                    Customer support correspondence is retained for up to 12 months solely for auditing, resolving refund requests, and customer service continuity, after which it is securely deleted.
                  </p>
                </section>

                {/* 7. Third-Party Services & International Transfers */}
                <section aria-labelledby="section-transfers" className="space-y-4">
                  <h2 id="section-transfers" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    7. Third-Party Service Providers &amp; Data Transfers
                  </h2>
                  <p>
                    We do not sell, rent, or trade your personal information. We share data only with service providers that help us run the platform: Razorpay (payment processing), Cloudinary (photo and invoice storage), Resend (transactional email), our hosted MongoDB database, our photo-processing service, cloud hosting and content-delivery providers, and the analytics providers described above.
                  </p>
                  <p>
                    Because we serve customers worldwide, these providers may process your data in countries other than your own. Where applicable law requires it (for example the GDPR), such transfers are protected by appropriate safeguards such as the European Commission&rsquo;s Standard Contractual Clauses (SCCs).
                  </p>
                </section>

                {/* 8. Children's Privacy */}
                <section aria-labelledby="section-children" className="space-y-4">
                  <h2 id="section-children" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    8. Children&rsquo;s Privacy
                  </h2>
                  <p>
                    {SITE_NAME} allows parents and legal guardians to format passport photos for infants, toddlers, and children under 16 for official travel documents. We do not knowingly create user accounts or profile children. Any child photograph is processed strictly at the direction and consent of the parent or legal guardian.
                  </p>
                </section>

                {/* 9. Your Privacy Rights */}
                <section aria-labelledby="section-rights" className="space-y-4">
                  <h2 id="section-rights" className="scroll-mt-24 text-xl font-extrabold text-ink-950 sm:text-2xl">
                    9. Your Privacy Rights
                  </h2>
                  <p>
                    Depending on where you live, applicable data-protection laws (including the GDPR where it applies) may give you the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc space-y-2.5 pl-5 marker:text-brand-600 [&_strong]:text-ink-950">
                    <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
                    <li><strong>Right to Rectification:</strong> Request correction of inaccurate personal data.</li>
                    <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request deletion of your personal data where retention is no longer necessary.</li>
                    <li><strong>Right to Restrict Processing:</strong> Request suspension of processing under certain circumstances.</li>
                    <li><strong>Right to Data Portability:</strong> Request transfer of your data in a structured, commonly used format.</li>
                    <li><strong>Right to Object:</strong> Object to processing based on legitimate interests.</li>
                    <li><strong>Right to Complain:</strong> You may lodge a complaint with the data-protection supervisory authority in the country where you live or work.</li>
                  </ul>
                </section>
              </div>

              {/* 10. Contact Us & Exercising Rights */}
              <section aria-labelledby="section-contact" className="relative mt-6 overflow-hidden rounded-3xl bg-ink-950 p-7 text-white sm:p-10">
                <div className="pointer-events-none absolute inset-0 bg-dots-dark" aria-hidden="true" />
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl" aria-hidden="true" />
                <div className="relative space-y-4">
                  <h2 id="section-contact" className="scroll-mt-24 text-xl font-extrabold text-white sm:text-2xl">
                    10. Contact &amp; Privacy Requests
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-ink-300 sm:text-base">
                    To exercise any of your privacy rights, request data deletion, or ask questions about this policy, please contact our privacy team:
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
