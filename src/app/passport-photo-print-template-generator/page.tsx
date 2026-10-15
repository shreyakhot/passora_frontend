import type { Metadata } from "next";
import Link from "next/link";
import {
  Scissors,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import PrintTemplateGenerator from "@/components/PrintTemplateGenerator";
import FaqAccordion, { type FaqItem } from "@/components/FaqAccordion";
import { POPULAR_TOOLS } from "@/lib/tool-directory";
import { PRICING } from "@/lib/config/pricing";
import { LOGO_URL, SITE_DISCLAIMER, SITE_NAME, SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/passport-photo-print-template-generator`;

export const metadata: Metadata = {
  title: "Passport Photo Sheet Maker: Free 4×6″ & A4 Print Template",
  description:
    "Free passport photo sheet maker. Tile your passport or visa photo onto a 4x6, A4 or US Letter sheet at 300 DPI with cutting guides, then print it at home or at any photo shop.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Free Passport Photo Sheet Maker (4×6″ & A4) — ${SITE_NAME}`,
    description:
      "Make up to 8 passport size photos on one 4×6″ sheet, or more on A4 and US Letter. Calibrated 300 DPI with cutting guides. Print at home or at any photo kiosk.",
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_URL,
        width: 640,
        height: 640,
        alt: `Free passport photo sheet maker for 4×6 and A4 — ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `Free Passport Photo Sheet Maker (4×6″ & A4) — ${SITE_NAME}`,
    description:
      "Convert your passport photo to a 4x6 sheet for free. Print-ready 300 DPI sheets for photo kiosks and home printers.",
    images: [LOGO_URL],
  },
};

const PRINT_FAQS: FaqItem[] = [
  {
    question: "How do I convert a passport photo to 4x6 for free?",
    answer:
      "Upload your photo to the generator above, choose 4×6″ and download the sheet. The tool tiles your photo into a grid at 1800×1200 px (300 DPI), so it is ready to print straight away. It is free, needs no sign-up and runs in your browser.",
  },
  {
    question: "How many passport photos fit on a 4×6 inch sheet?",
    answer:
      "A 4×6″ (10×15 cm) sheet holds up to 8 photos in the common 35×45 mm size, which is used for many passports and visas, including the Schengen Area, the UK and India. It also fits up to 4 US photos (2×2″) or 2 Canadian photos (50×70 mm).",
  },
  {
    question: "Can I make a passport size photo A4 sheet online?",
    answer:
      "Yes. Choose A4 (or US Letter) in the generator to fill a full page with copies of your photo. This suits home printers and anyone who needs spare sets for a family application, a visa or another ID document.",
  },
  {
    question: "Why should I avoid the 'Passport Photos' option at kiosks?",
    answer:
      "Photo kiosks and print shops often charge much more for their passport photo service than for a standard print. If you choose a standard 4×6″ photo print and upload your sheet, you usually pay only the price of a regular print.",
  },
  {
    question: "How do I make sure the printed photos are the right size?",
    answer:
      "Turn off 'Fit to Page' and 'Shrink to Fit', then print at 100% (Actual Size). Any scaling changes the photo dimensions and can cause a rejection. Measure one photo with a ruler before you cut the rest: it should match the size you selected, for example 35×45 mm or 2×2″.",
  },
  {
    question: "What paper do passport photos need?",
    answer:
      "Most issuing authorities ask for photos printed on photo-quality paper (gloss or matte) with no borders, creases or heavy texture, and many reject photos printed on plain office paper. Check the exact requirements with the authority that issues your document.",
  },
  {
    question: "Can I cut the photos myself?",
    answer:
      "Yes. Each sheet includes corner crop marks. Use sharp scissors, or a rotary trimmer and a metal ruler, and cut just outside each mark for clean, accurate edges.",
  },
  {
    question: "Do I need printed photos for an online application?",
    answer:
      "Often not. Many online passport and visa applications ask you to upload a digital photo instead, so use our passport size photo maker for that. Use the printed sheet for paper applications and other ID that needs physical copies, and check what your application asks for.",
  },
];

const PAPER_SIZES = [
  {
    paper: "4×6″ (10×15 cm)",
    photos: "Up to 8 at 35×45 mm",
    bestFor: "Kiosk and home printing",
  },
  {
    paper: "4×6″ (10×15 cm)",
    photos: "Up to 4 US (2×2″)",
    bestFor: "US passports and visas",
  },
  {
    paper: "A4 (210×297 mm)",
    photos: "Multiple full sets",
    bestFor: "Home printers and families",
  },
  {
    paper: "US Letter (8.5×11″)",
    photos: "Multiple full sets",
    bestFor: "Home printers in North America",
  },
];

const RELATED_TOOLS = POPULAR_TOOLS;

export default function PrintTemplateGeneratorPage() {
  return (
    <>
      <JsonLd
        siteUrl={SITE_URL}
        siteName={SITE_NAME}
        appName={`${SITE_NAME} Passport Photo Print Template Generator`}
        appUrl={PAGE_URL}
        appId={`${PAGE_URL}#webapp`}
        description="Free passport photo sheet maker. Make 8 passport size photos online on a 4x6 inch or A4 sheet with cutting guides at 300 DPI."
        price="0"
        priceCurrency={PRICING.currency}
        breadcrumbs={[
          { name: "Home", url: SITE_URL },
          { name: "Photo Guides", url: `${SITE_URL}/tool` },
          {
            name: "Print Template Generator",
            url: PAGE_URL,
          },
        ]}
        includeOrganization={false}
        includeWebsite={false}
        includeWebApp={true}
        faqItems={PRINT_FAQS}
      />

      <Navbar ctaText="Photo Maker Studio" ctaHref="/passport-size-photo-maker" />

      <main className="flex-1 bg-slate-50 text-slate-900" id="main-content">
        {/* 1. HERO */}
        <section className="bg-white pt-6 pb-8 sm:pt-10 sm:pb-12 border-b border-slate-200/80">
          <div className="container-narrow max-w-4xl text-center">
            <nav className="text-xs text-slate-600 mb-3 sm:mb-4 flex justify-center" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 list-none p-0 m-0">
                <li>
                  <Link href="/" className="text-slate-600 hover:text-lime-800 transition-colors font-medium">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/tool" className="text-slate-600 hover:text-lime-800 transition-colors font-medium">
                    Photo Guides
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-slate-900 font-semibold truncate" aria-current="page">
                  Print Template Generator
                </li>
              </ol>
            </nav>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15] mb-2 sm:mb-3">
              Free Passport Photo Sheet Maker for 4×6″ and A4
            </h1>
            <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4">
              Convert your passport photo to 4x6 in seconds. Upload one photo, pick <strong>4×6″ (10×15 cm)</strong> or <strong>A4</strong>, and download a print-ready sheet with up to 8 passport size photos, cutting guides and calibrated 300 DPI quality.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4D7C0F]" /> Calibrated 300 DPI
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                <Scissors className="w-3.5 h-3.5 text-[#4D7C0F]" /> Corner Crop Marks
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4D7C0F]" /> 100% Free &amp; In-Browser
              </span>
            </div>
          </div>
        </section>

        {/* 2. GENERATOR */}
        <section className="py-6 sm:py-10 bg-slate-50 border-b border-slate-200/80" id="generator">
          <div className="container-narrow max-w-6xl">
            <PrintTemplateGenerator />
          </div>
        </section>

        {/* 3. WHAT IT IS + BENEFITS */}
        <section className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
          <div className="container-narrow max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-4">
              What Is a Passport Photo Sheet Maker?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
              A passport photo sheet maker tiles one photo into a grid on a single page. Instead of printing one 35×45 mm photo at a time, you print one sheet and cut out every copy. It is the quickest way to make 8 passport size photos online without paying booth prices.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              Whether you need a passport size photo A4 sheet for your home printer or a passport size 4×6 photo for your local kiosk, the generator sizes everything for you.
            </p>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Why applicants use it</h3>
            <ul className="space-y-2 text-slate-600 text-sm sm:text-base leading-relaxed list-none p-0">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-1 shrink-0 text-[#4D7C0F]" /><span><strong>You save money.</strong> Pay for a standard print, not a passport photo service.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-1 shrink-0 text-[#4D7C0F]" /><span><strong>You get up to 8 photos.</strong> That covers a passport, a visa, other ID and spares.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-1 shrink-0 text-[#4D7C0F]" /><span><strong>You print anywhere.</strong> Use a photo kiosk, a print shop, a pharmacy photo counter or your own printer.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-1 shrink-0 text-[#4D7C0F]" /><span><strong>You keep control.</strong> Retake as often as you like, in good light, at home.</span></li>
            </ul>
          </div>
        </section>

        {/* 4. STEPS */}
        <section className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200/80">
          <div className="container-narrow max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-[#4D7C0F] text-xs font-bold mb-3">
                Photo Kiosk Tip
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
                How to Print Passport Photos for the Price of a Standard Print
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Follow three steps to skip the booth fee and still get correctly sized prints.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  n: "01",
                  title: "Make your sheet",
                  body: (
                    <>
                      Upload your photo above, choose <strong>4×6″</strong> or <strong>A4</strong>, and download the 300 DPI JPEG to your phone or a USB stick.
                    </>
                  ),
                },
                {
                  n: "02",
                  title: "Order a standard 4×6″ print",
                  body: (
                    <>
                      At any photo kiosk or print shop, choose <strong>&quot;Standard Photo Prints (4×6″)&quot;</strong>. Do not press the pricier &quot;Passport Photo&quot; button.
                    </>
                  ),
                },
                {
                  n: "03",
                  title: "Cut along the crop marks",
                  body: (
                    <>
                      Collect your glossy print. Cut along the corner marks to get up to 8 photos at the exact size you chose.
                    </>
                  ),
                },
              ].map((s) => (
                <div key={s.n} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7">
                  <div className="w-10 h-10 rounded-xl bg-lime-100 text-[#4D7C0F] font-bold flex items-center justify-center mb-4">
                    {s.n}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. PAPER SIZES + PHOTO RULES */}
        <section className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
          <div className="container-narrow max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-3">
              4×6″ or A4: Which Sheet Should You Choose?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              Pick 4×6″ for cheap kiosk prints. Pick A4 if you would rather print at home or need several sets at once.
            </p>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-4 font-bold text-slate-900">Paper</th>
                      <th className="p-4 font-bold text-slate-900">Photos per sheet</th>
                      <th className="p-4 font-bold text-slate-900">Best for</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {PAPER_SIZES.map((r) => (
                      <tr key={r.paper + r.photos}>
                        <td className="p-4 font-semibold text-slate-900">{r.paper}</td>
                        <td className="p-4 text-slate-600">{r.photos}</td>
                        <td className="p-4 text-slate-600">{r.bestFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3">Photo rules to check before you print</h3>
            <ul className="space-y-2 text-slate-600 text-sm sm:text-base leading-relaxed list-disc pl-5">
              <li>Print each photo at the <strong>exact size</strong> your document needs, such as 35×45 mm or 2×2″.</li>
              <li>Check the <strong>head size</strong> rule for your document. It differs between countries.</li>
              <li>Use a plain, light background with no shadows.</li>
              <li>Print on photo paper, with no borders or creases.</li>
              <li>Print at <strong>100% scale</strong>, never &quot;Fit to Page&quot;.</li>
            </ul>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-4">
              Photo rules change and differ between countries and application types. Always confirm the
              current requirements with the authority that issues your document. {SITE_DISCLAIMER}
            </p>
          </div>
        </section>

        {/* 6. COMPARISON TABLE */}
        <section className="py-14 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
          <div className="container-narrow max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
                Photo Booth vs. 4×6″ Print Template
              </h2>
              <p className="text-slate-600 text-sm">
                Compare a printable sheet with a photo booth or passport photo service.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-4 sm:p-5 font-bold text-slate-900">Feature</th>
                      <th className="p-4 sm:p-5 font-bold text-lime-800 bg-lime-50/50">{SITE_NAME} 4×6″ Sheet</th>
                      <th className="p-4 sm:p-5 font-bold text-slate-700">Photo Booth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-4 sm:p-5 font-semibold text-slate-900">Cost</td>
                      <td className="p-4 sm:p-5 text-[#365314] font-bold bg-lime-50/30">Free tool + one standard print</td>
                      <td className="p-4 sm:p-5 text-slate-600">Passport photo service price</td>
                    </tr>
                    <tr>
                      <td className="p-4 sm:p-5 font-semibold text-slate-900">Photos per sheet</td>
                      <td className="p-4 sm:p-5 text-[#365314] font-bold bg-lime-50/30">Up to 8</td>
                      <td className="p-4 sm:p-5 text-slate-600">Usually 4</td>
                    </tr>
                    <tr>
                      <td className="p-4 sm:p-5 font-semibold text-slate-900">Retakes</td>
                      <td className="p-4 sm:p-5 text-[#365314] font-bold bg-lime-50/30">Unlimited, at your own pace</td>
                      <td className="p-4 sm:p-5 text-slate-600">A few rushed attempts</td>
                    </tr>
                    <tr>
                      <td className="p-4 sm:p-5 font-semibold text-slate-900">Cutting guides</td>
                      <td className="p-4 sm:p-5 text-[#365314] font-bold bg-lime-50/30">Calibrated corner crop marks</td>
                      <td className="p-4 sm:p-5 text-slate-600">White borders, no marks</td>
                    </tr>
                    <tr>
                      <td className="p-4 sm:p-5 font-semibold text-slate-900">Digital copy</td>
                      <td className="p-4 sm:p-5 text-[#365314] font-bold bg-lime-50/30">Instant 300 DPI JPEG + PNG</td>
                      <td className="p-4 sm:p-5 text-slate-600">Often an extra fee</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FAQ */}
        <section className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
          <div className="container-narrow max-w-4xl">
            <FaqAccordion
              faqs={PRINT_FAQS}
              title="Passport Photo Sheet & 4×6 Printing FAQs"
            />
          </div>
        </section>

        {/* 8. RELATED TOOLS */}
        <section className="py-14 sm:py-20 bg-slate-50" aria-label="Explore other passport tools">
          <div className="container-narrow max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-[#4D7C0F] text-xs font-bold mb-2">
                Full Photo Suite
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Explore Other Passport Photo Tools
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {RELATED_TOOLS.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tool/${t.slug}`}
                  className="bg-white border border-slate-200 hover:border-lime-600 p-4.5 sm:p-5 rounded-2xl flex items-center justify-between transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0" role="img" aria-hidden="true">{t.flag}</span>
                    <div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-lime-900 transition-colors block">
                        {t.title}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{t.spec}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#4D7C0F] group-hover:translate-x-1 transition-all" />
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