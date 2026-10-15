import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import PhotoMakerStudio from "@/components/PhotoMakerStudio";
import FaqAccordion from "@/components/FaqAccordion";
import OfficialPhotoNotice from "@/components/OfficialPhotoNotice";
import { getAllToolSlugs, getToolBySlug } from "@/lib/tools";
import { POPULAR_TOOLS } from "@/lib/tool-directory";
import { getCountryByCode } from "@/config/countries";
import { PRICING } from "@/lib/config/pricing";
import { LOGO_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import {
  Sparkles,
  ArrowRight,
  Globe,
  Crop,
  Zap,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllToolSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return {};

  const pageUrl = `${SITE_URL}/tool/${slug}`;

  return {
    title: tool.meta_title || tool.title,
    description: tool.meta_description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${tool.title} — ${SITE_NAME}`,
      description: tool.meta_description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: tool.feature_image || LOGO_URL,
          alt: tool.feature_image_alt || `${tool.title} — ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.title} — ${SITE_NAME}`,
      description: tool.meta_description,
      images: [tool.feature_image || LOGO_URL],
    },
  };
}


export default async function DynamicToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const siteUrl = SITE_URL;
  const countryName = getCountryByCode(tool.country_code)?.country_name;
  const relatedTools = POPULAR_TOOLS.filter((t) => t.slug !== slug);

  return (
    <>
      <JsonLd
        siteUrl={siteUrl}
        siteName={SITE_NAME}
        appName={`${SITE_NAME} ${tool.hero_title || tool.title}`}
        appUrl={`${siteUrl}/tool/${slug}`}
        appId={`${siteUrl}/tool/${slug}#webapp`}
        description={tool.meta_description}
        price={tool.price || PRICING.amount.toFixed(2)}
        priceCurrency={PRICING.currency}
        pageUrl={`${siteUrl}/tool/${slug}`}
        pageName={tool.meta_title || tool.title}
        pageDescription={tool.meta_description}
        breadcrumbs={[
          { name: "Home", url: siteUrl },
          { name: "Photo Guides", url: `${siteUrl}/tool` },
          { name: tool.hero_title, url: `${siteUrl}/tool/${slug}` },
        ]}
        includeOrganization={false}
        includeWebsite={false}
        includeWebApp={true}
        faqItems={tool.faqs}
      />

      <Navbar ctaText="Create Photo" ctaHref="#studio" />

      <main className="flex-1 bg-white text-slate-900" id="main-content">
        {/* =========================================================================
            1. HERO SECTION (Matching Homepage Design with Photo on Right)
           ========================================================================= */}
        <section className="bg-white py-10 sm:py-16 lg:py-20 border-b border-slate-200/80" id="hero" aria-label="Tool overview">
          <div className="container-narrow">
            {/* Breadcrumb Navigation */}
            <nav className="text-xs text-slate-600 mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 list-none p-0 m-0">
                <li>
                  <Link href="/" className="text-slate-600 hover:text-lime-800 transition-colors font-medium">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-slate-400">/</li>
                <li>
                  <Link href="/tool" className="text-slate-600 hover:text-lime-800 transition-colors font-medium">
                    Photo Guides
                  </Link>
                </li>
                <li aria-hidden="true" className="text-slate-400">/</li>
                <li className="text-slate-900 font-semibold truncate max-w-[220px] sm:max-w-none" aria-current="page">
                  {tool.hero_title}
                </li>
              </ol>
            </nav>

            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Copy Column */}
              <div className="lg:col-span-7 max-w-2xl">
                {/* Official Biometric Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4FBE8] border border-lime-300 text-xs font-bold text-[#365314] tracking-wide mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#4D7C0F]" aria-hidden="true" />
                  <span>{tool.badge ? tool.badge.toUpperCase() : "OFFICIAL BIOMETRIC SPECIFICATION"}</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-3xl lg:text-[40px] font-extrabold text-[#0F172A] tracking-tight leading-[1.18] mb-3">
                  {tool.hero_title}
                </h1>

                {/* Sub-heading */}
                <p className="text-lg sm:text-xl text-[#334155] font-semibold mb-4 leading-snug">
                  {tool.dimensions_mm} · Size, background and framing checked before you download
                </p>

                {/* Body description */}
                <p className="text-sm sm:text-base text-[#334155] leading-relaxed mb-7 max-w-xl">
                  {tool.hero_subtitle}
                </p>

                {/* CTA Buttons - Scrolls smoothly to #studio */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 mb-7">
                  <a
                    href="#studio"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#4D7C0F] hover:bg-[#3F650C] !text-white text-white font-bold text-base px-7 py-3.5 sm:py-4 rounded-xl transition-colors text-center shadow-xs cursor-pointer"
                  >
                    <span>{tool.cta_button_text || "Create My Passport Photo"}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                  <a
                    href="#how-it-works"
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base px-6 py-3.5 sm:py-4 rounded-xl border border-slate-300 transition-colors text-center"
                  >
                    How It Works
                  </a>
                </div>

                {/* Features Badges Row */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5">
                  <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 text-center">
                    <span aria-hidden="true">🔒</span> Secure &amp; Private
                  </span>
                  <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 text-center">
                    <span className="text-amber-600" aria-hidden="true">⚡</span> Results in 10s
                  </span>
                  <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 text-center">
                    <span aria-hidden="true">🌍</span> 50+ Countries
                  </span>
                  <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 text-center">
                    <span aria-hidden="true">🪪</span> Biometric Validation
                  </span>
                </div>
              </div>

              {/* Right Visual Preview Column (Matching Homepage with Feature Image) */}
              <div className="lg:col-span-5 flex items-center justify-center w-full">
                <div className="w-full max-w-sm lg:max-w-md">
                  <div className="p-2 sm:p-4 flex items-center justify-center">
                    <div className="relative w-full aspect-[4/5] max-h-[440px] flex items-center justify-center">
                      {tool.feature_image ? (
                        <Image
                          src={tool.feature_image}
                          alt={tool.feature_image_alt || `${tool.hero_title} Sample Biometric Preview`}
                          fill
                          priority
                          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 420px"
                          className="object-contain"
                        />
                      ) : (
                        <Image
                          src="https://res.cloudinary.com/dipzpwbbk/image/upload/v1790507890/uk_passport_size_photo_i5uujz.jpg"
                          alt="Sample passport photo with a plain light background"
                          fill
                          priority
                          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 420px"
                          className="object-contain"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. PHOTO MAKER STUDIO SECTION (Placed directly below Hero Section)
           ========================================================================= */}
        <section className="bg-slate-50 py-10 sm:py-16 border-b border-slate-200/80" id="studio" aria-label="Photo Maker Studio">
          <div className="container-narrow max-w-2xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-5 sm:mb-7">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {tool.studio_title || `Create Your ${tool.hero_title}`}
              </h2>
              <p className="text-slate-700 text-xs sm:text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
                {tool.studio_description ||
                  "Select your country, upload your photo, and let AI automatically size and verify biometrics in 10 seconds."}
              </p>
            </div>

            {/* Embedded Searchable Photo Maker Component */}
            <PhotoMakerStudio
              defaultCountryCode={tool.country_code}
              defaultDocumentType={tool.document_type || "passport"}
            />
            <OfficialPhotoNotice countryName={countryName} className="mt-5" />
          </div>
        </section>

        {/* =========================================================================
            3. 3-STEP PROCESS SECTION (Matching Homepage)
           ========================================================================= */}
        <section className="bg-white py-14 sm:py-20 border-b border-slate-200/80" id="how-it-works">
          <div className="container-narrow">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-[#4D7C0F] text-xs font-bold mb-3">
                Simple 3-Step Process
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
                {tool.how_it_works_title || "How It Works in 3 Steps"}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Three steps take you from a regular phone photo to a correctly sized, checked photo.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-lime-600 transition-colors">
                <div>
                  <div className="flex items-center justify-between w-full mb-6">
                    <div className="w-12 h-12 rounded-xl bg-lime-50 border border-lime-200 flex items-center justify-center text-[#4D7C0F]">
                      <Globe className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      Step 01
                    </span>
                  </div>
                  <h3 className="text-slate-900 text-lg sm:text-xl font-bold mb-2">
                    1. Select Your Country
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Choose from 50+ countries, including the US, Canada, India and the Schengen Area. The tool loads that country&apos;s photo size automatically.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-lime-600 transition-colors">
                <div>
                  <div className="flex items-center justify-between w-full mb-6">
                    <div className="w-12 h-12 rounded-xl bg-lime-50 border border-lime-200 flex items-center justify-center text-[#4D7C0F]">
                      <Crop className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      Step 02
                    </span>
                  </div>
                  <h3 className="text-slate-900 text-lg sm:text-xl font-bold mb-2">
                    2. Upload and Auto-Crop
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Upload a clear, recent photo. The tool centres your face, sets the head size and checks the background and framing.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-lime-600 transition-colors">
                <div>
                  <div className="flex items-center justify-between w-full mb-6">
                    <div className="w-12 h-12 rounded-xl bg-lime-50 border border-lime-200 flex items-center justify-center text-[#4D7C0F]">
                      <Zap className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      Step 03
                    </span>
                  </div>
                  <h3 className="text-slate-900 text-lg sm:text-xl font-bold mb-2">
                    3. Preview and Download
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    In under 10 seconds you get a digital photo plus a print-ready 6×4″ sheet to upload or take to a photo shop for printing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. MARKDOWN CONTENT ARTICLE (Tables, Guidelines, Rules)
           ========================================================================= */}
        <section className="py-14 sm:py-20 bg-slate-50/70 border-b border-slate-200/80" aria-label="Official photo rules and submission guide">
          <div className="container-narrow max-w-4xl">
            <article className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 shadow-xs">
              <div
                className="markdown-content max-w-none"
                dangerouslySetInnerHTML={{ __html: tool.contentHtml }}
              />

              {/* Interactive FAQ Accordion UI */}
              {tool.faqs && tool.faqs.length > 0 && (
                <FaqAccordion
                  faqs={tool.faqs}
                  title={tool.hero_title || tool.title}
                />
              )}

              {/* In-Article CTA */}
              <div className="mt-12 pt-8 border-t border-slate-100 text-center bg-slate-50 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Ready to create your {tool.hero_title}?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-5 max-w-md mx-auto">
                  {tool.cta_description ||
                    "Prepare your photo using your country's photo requirements and review it before submitting your application."}
                </p>
                <a
                  href="#studio"
                  className="inline-flex items-center justify-center gap-2 bg-[#4D7C0F] hover:bg-[#3F650C] !text-white text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-xl transition-all shadow-sm focus-ring cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Upload Photo &amp; Create Now</span>
                </a>
              </div>
            </article>
          </div>
        </section>

        {/* =========================================================================
            5. OTHER POPULAR PASSPORT & VISA TOOLS (Internal Linking SEO Grid)
           ========================================================================= */}
        <section className="py-14 sm:py-20 bg-white" aria-label="Explore other passport photo tools">
          <div className="container-narrow">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-[#4D7C0F] text-xs font-bold mb-2">
                Biometric Standards &amp; Tools
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Explore Other Passport &amp; Visa Tools
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Photo sizes and photo makers for popular passport and visa applications.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTools.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tool/${t.slug}`}
                  className="bg-white border border-slate-200 hover:border-lime-600 p-4.5 sm:p-5 rounded-2xl flex items-center justify-between transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0" role="img" aria-hidden="true">{t.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-lime-800 bg-lime-50 px-1.5 py-0.5 rounded text-[10px]">
                          {t.group}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-lime-900 transition-colors block truncate">
                        {t.title}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {t.spec}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#4D7C0F] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/tool"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#365314] hover:text-[#4D7C0F] underline"
              >
                View all countries
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
