import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Clock, Shield, ArrowRight, ChevronRight, LifeBuoy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import {
  SITE_URL,
  SITE_NAME,
  SUPPORT_EMAIL,
  LOGO_URL,
  SITE_DISCLAIMER,
} from "@/lib/site";

const PAGE_DESCRIPTION = `Contact ${SITE_NAME} customer support for help with passport and visa photos, biometric compliance queries, refund requests, or order inquiries.`;

export const metadata: Metadata = {
  title: "Contact Us — Customer Support & Inquiries",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/contact-us`,
  },
  openGraph: {
    title: `Contact ${SITE_NAME} Support`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/contact-us`,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_URL,
        width: 640,
        height: 640,
        alt: `${SITE_NAME} Customer Support`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `Contact ${SITE_NAME} Support`,
    description: PAGE_DESCRIPTION,
    images: [LOGO_URL],
  },
};

export default function ContactUsPage() {
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
        name: "Contact Us",
        item: `${SITE_URL}/contact-us`,
      },
    ],
  };

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SITE_NAME}`,
    description: `Contact ${SITE_NAME} customer support for help with passport and visa photo requirements, downloads, or technical assistance.`,
    url: `${SITE_URL}/contact-us`,
    mainEntity: {
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
      contactPoint: {
        "@type": "ContactPoint",
        email: SUPPORT_EMAIL,
        contactType: "customer support",
        areaServed: "Worldwide",
        availableLanguage: ["English"],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />

      <Navbar ctaText="Create Photo" ctaHref="/passport-size-photo-maker" />

      <main className="flex-1 bg-white text-ink-950" id="main-content">
        {/* Page Heading */}
        <section
          className="relative overflow-hidden border-b border-ink-100"
          aria-labelledby="contact-page-heading"
        >

          <div className="container-narrow relative pb-14 pt-8 sm:pb-20 sm:pt-12">
            {/* Breadcrumb */}
            <nav className="text-sm" aria-label="Breadcrumb">
              <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-ink-500">
                <li>
                  <Link
                    href="/"
                    className="inline-flex min-h-11 items-center font-medium text-ink-500 transition-colors hover:text-brand-700"
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
                </li>
                <li className="font-semibold text-ink-950" aria-current="page">
                  Contact Us
                </li>
              </ol>
            </nav>

            <div className="mt-4 max-w-3xl">
              <span className="eyebrow">
                <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
                SUPPORT &amp; INQUIRIES
              </span>
              <h1 id="contact-page-heading" className="display-1 mt-5 text-ink-950">
                Contact {SITE_NAME} Support
              </h1>
              <p className="lead mt-5 max-w-2xl">
                Have questions about passport or visa photo requirements, an existing
                download session, or need assistance? Fill out the form below or
                email us directly.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-ink-50 py-12 sm:py-16 lg:py-20" aria-label="Contact form and support details">
          <div className="container-narrow">
            <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Form Column */}
              <div className="lg:col-span-7">
                <ContactForm />
              </div>

              {/* Sidebar Information Column */}
              <div className="space-y-5 lg:sticky lg:top-24 lg:col-span-5">
                {/* Direct Contact Card */}
                <div className="surface p-6 sm:p-7">
                  <h2 className="flex items-center gap-3 text-lg font-extrabold text-ink-950">
                    <span className="icon-tile" aria-hidden="true">
                      <Mail className="h-5 w-5" />
                    </span>
                    <span>Direct Support</span>
                  </h2>
                  <div className="mt-5 space-y-4 text-sm text-ink-700">
                    <div>
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">
                        Email Address
                      </span>
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="inline-flex min-h-11 items-center break-all text-base font-bold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-4 transition-colors hover:text-brand-800 hover:decoration-brand-600"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                    </div>

                    <div className="border-t border-ink-100 pt-4">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">
                        Operating Hours
                      </span>
                      <p className="font-medium text-ink-800">
                        Monday – Friday: 9:00 AM – 5:00 PM UTC
                      </p>
                    </div>

                    <div className="border-t border-ink-100 pt-4">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500">
                        Response Expectations
                      </span>
                      <p className="flex items-center gap-1.5 font-medium text-ink-800">
                        <Clock
                          className="h-4 w-4 shrink-0 text-brand-600"
                          aria-hidden="true"
                        />
                        <span>Replies within 24 business hours</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Guidance Box */}
                <div className="space-y-3 rounded-[1.25rem] border border-brand-100 bg-brand-50 p-6 text-sm text-ink-800 sm:p-7">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-ink-950">
                    <Shield
                      className="h-5 w-5 text-brand-600"
                      aria-hidden="true"
                    />
                    <span>Acceptance Guarantee</span>
                  </h3>
                  <p className="font-medium leading-relaxed">
                    If your passport or visa photo created on {SITE_NAME} is
                    rejected by the issuing authority for dimensional reasons, we will gladly re-process your photo or
                    issue a full refund in accordance with our{" "}
                    <Link
                      href="/refund-policy"
                      className="font-bold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 hover:text-brand-800"
                    >
                      Refund Policy
                    </Link>
                    .
                  </p>
                  <p className="border-t border-brand-100 pt-3 text-xs leading-relaxed text-ink-600">
                    {SITE_DISCLAIMER}
                  </p>
                </div>

                {/* Useful Links Box */}
                <div className="surface p-6 text-sm sm:p-7">
                  <h3 className="text-base font-extrabold text-ink-950">
                    Frequently Accessed:
                  </h3>
                  <ul className="m-0 mt-3 list-none divide-y divide-ink-100 p-0 text-ink-700">
                    {[
                      { href: "/#faq", label: "Frequently Asked Questions" },
                      { href: "/#photo-rules", label: "Common Passport Photo Rules" },
                      {
                        href: "/data-security-privacy-safeguards",
                        label: "Data Security & Privacy Safeguards",
                      },
                      { href: "/refund-policy", label: "Refund Policy & Terms" },
                    ].map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="group flex min-h-11 items-center justify-between gap-3 py-2.5 font-semibold transition-colors hover:text-brand-700"
                        >
                          <span>{item.label}</span>
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
