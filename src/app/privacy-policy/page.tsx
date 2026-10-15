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

      <main className="flex-1 bg-white text-slate-900" id="main-content">
        {/* Header */}
        <section className="bg-slate-50/80 py-10 sm:py-16 border-b border-slate-200/80" aria-label="Privacy Policy header">
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
                  Privacy Policy
                </li>
              </ol>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-[#365314] text-xs font-bold mb-4">
              <span>LEGAL &amp; COMPLIANCE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Last Updated: 14 October 2026 · Applicable data-protection laws, including the GDPR where it applies
            </p>
          </div>
        </section>

        {/* Content Article */}
        <article className="container-narrow max-w-4xl py-12 sm:py-16 space-y-10 text-slate-700 leading-relaxed text-base">
          {/* 1. Introduction */}
          <section aria-labelledby="section-intro" className="space-y-3">
            <h2 id="section-intro" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              1. Introduction &amp; Scope
            </h2>
            <p>
              {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), accessible at <Link href="/" className="text-[#365314] font-semibold underline">{SITE_URL}</Link>, provides an online passport, visa and ID photo formatting platform for customers worldwide. {SITE_DISCLAIMER}
            </p>
            <p>
              We are committed to safeguarding the privacy and personal data of our website visitors and service users. This Privacy Policy explains what personal information we collect, how we process it, the legal bases we rely on where the EU General Data Protection Regulation (GDPR) or similar laws apply, and the rights you may have under applicable data-protection laws.
            </p>
            <p>
              The operator of {SITE_NAME} is responsible for your personal data as data controller and can be contacted at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#365314] font-semibold underline">{SUPPORT_EMAIL}</a>.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section aria-labelledby="section-collection" className="space-y-3">
            <h2 id="section-collection" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              2. Information We Collect
            </h2>
            <p>
              We adhere strictly to the principle of data minimisation. We only collect or process data required to deliver our photo creation and customer support services:
            </p>
            <ul className="list-disc pl-5 space-y-2">
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
          <section aria-labelledby="section-basis" className="space-y-3">
            <h2 id="section-basis" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              3. Purpose and Legal Basis for Processing
            </h2>
            <p>
              Where the GDPR applies, we process your personal data under the following legal bases set out in Article 6:
            </p>
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <strong className="text-slate-900 block font-bold mb-1">Performance of a Contract (Article 6(1)(b)):</strong>
                <span className="text-sm">Processing uploaded images to generate compliant digital passport photos and 6×4″ printable sheets requested by you, taking payment, and emailing your files and invoice.</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <strong className="text-slate-900 block font-bold mb-1">Legitimate Interests (Article 6(1)(f)):</strong>
                <span className="text-sm">Responding to customer inquiries, preventing abuse and fraud, ensuring server security, understanding how the website is used, and maintaining website stability.</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <strong className="text-slate-900 block font-bold mb-1">Legal Obligation (Article 6(1)(c)):</strong>
                <span className="text-sm">Retaining financial transaction records and invoices for statutory accounting and tax compliance where applicable.</span>
              </div>
            </div>
          </section>

          {/* 4. Cookies and Client Storage */}
          <section aria-labelledby="section-cookies" className="space-y-3">
            <h2 id="section-cookies" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              4. Cookies, Local Storage and Analytics
            </h2>
            <p>
              {SITE_NAME} does not use advertising cookies or sell data to advertising networks. We use the following browser storage and analytics tools:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              <li>
                <strong>Session &amp; Local Storage (<code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">sessionStorage</code> / <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">localStorage</code>):</strong> Used to preserve your active photo processing result across browser navigation so you can view, purchase and download your generated photo.
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
          <section aria-labelledby="section-payment" className="space-y-3">
            <h2 id="section-payment" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              5. Payment Processing
            </h2>
            <p>
              When you purchase a digital passport photo package, payment is handled by Razorpay, our third-party payment processor. We never collect, store, or view full payment card numbers or banking credentials; we receive only the payment status and transaction references needed to fulfil and support your order.
            </p>
          </section>

          {/* 6. Data Retention & Deletion */}
          <section aria-labelledby="section-retention" className="space-y-3">
            <h2 id="section-retention" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
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
          <section aria-labelledby="section-transfers" className="space-y-3">
            <h2 id="section-transfers" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
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
          <section aria-labelledby="section-children" className="space-y-3">
            <h2 id="section-children" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              8. Children&rsquo;s Privacy
            </h2>
            <p>
              {SITE_NAME} allows parents and legal guardians to format passport photos for infants, toddlers, and children under 16 for official travel documents. We do not knowingly create user accounts or profile children. Any child photograph is processed strictly at the direction and consent of the parent or legal guardian.
            </p>
          </section>

          {/* 9. Your Privacy Rights */}
          <section aria-labelledby="section-rights" className="space-y-3">
            <h2 id="section-rights" className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              9. Your Privacy Rights
            </h2>
            <p>
              Depending on where you live, applicable data-protection laws (including the GDPR where it applies) may give you the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate personal data.</li>
              <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request deletion of your personal data where retention is no longer necessary.</li>
              <li><strong>Right to Restrict Processing:</strong> Request suspension of processing under certain circumstances.</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data in a structured, commonly used format.</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests.</li>
              <li><strong>Right to Complain:</strong> You may lodge a complaint with the data-protection supervisory authority in the country where you live or work.</li>
            </ul>
          </section>

          {/* 10. Contact Us & Exercising Rights */}
          <section aria-labelledby="section-contact" className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 id="section-contact" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              10. Contact &amp; Privacy Requests
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              To exercise any of your privacy rights, request data deletion, or ask questions about this policy, please contact our privacy team:
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
