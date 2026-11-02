import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Scissors,
  CheckCircle2,
  ShieldCheck,
  Check,
  ChevronRight,
  ArrowRight,
  Upload,
  Download,
  Printer,
  Sparkles,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import PrintTemplateGenerator from "@/components/PrintTemplateGenerator";
import FaqAccordion, { type FaqItem } from "@/components/FaqAccordion";
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

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  dark?: boolean;
  id?: string;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className={`eyebrow ${dark ? "eyebrow-dark" : ""}`}>{eyebrow}</span>
      <h2 id={id} className={`display-2 mt-4 ${dark ? "text-white" : "text-ink-950"}`}>
        {title}
      </h2>
      {description && <p className={`lead mt-4 ${dark ? "text-ink-300" : ""}`}>{description}</p>}
    </div>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700"
        aria-hidden="true"
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span>{children}</span>
    </li>
  );
}

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

      <main className="flex-1 bg-white text-ink-950" id="main-content">
        {/* 1. HERO + 2. GENERATOR */}
        <section className="relative overflow-hidden border-b border-ink-100 bg-white" aria-labelledby="print-hero-heading">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-dots [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-200/50 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-32 top-24 h-[380px] w-[380px] rounded-full bg-violet-200/40 blur-3xl" aria-hidden="true" />

          <div className="container-narrow relative pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16">
            <div className="mx-auto max-w-4xl text-center">
              <nav className="mb-6 flex justify-center text-xs sm:text-sm" aria-label="Breadcrumb">
                <ol className="m-0 flex list-none items-center gap-1.5 rounded-full border border-ink-200 bg-white/80 px-3 py-1.5 shadow-soft backdrop-blur">
                  <li>
                    <Link href="/" className="font-medium text-ink-500 transition-colors hover:text-brand-700">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight className="h-3.5 w-3.5 text-ink-400" />
                  </li>
                  <li className="truncate font-semibold text-ink-950" aria-current="page">
                    Print Template Generator
                  </li>
                </ol>
              </nav>

              <h1 id="print-hero-heading" className="display-1 text-ink-950">
                Free Passport Photo Sheet Maker for <span className="marker">4×6″</span> and <span className="marker">A4</span>
              </h1>
              <p className="lead mx-auto mt-5 max-w-2xl">
                Convert your passport photo to 4x6 in seconds. Upload one photo, pick <strong className="text-ink-950">4×6″ (10×15 cm)</strong> or <strong className="text-ink-950">A4</strong>, and download a print-ready sheet with up to 8 passport size photos, cutting guides and calibrated 300 DPI quality.
              </p>

              <ul className="m-0 mt-7 flex list-none flex-wrap items-center justify-center gap-2 p-0 text-xs font-semibold text-ink-700 sm:text-sm">
                <li className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-600" aria-hidden="true" /> Calibrated 300 DPI
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5">
                  <Scissors className="h-4 w-4 text-brand-600" aria-hidden="true" /> Corner Crop Marks
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> 100% Free &amp; In-Browser
                </li>
              </ul>
            </div>
          </div>

          {/* 2. GENERATOR */}
          <div className="relative scroll-mt-24 pb-16 sm:pb-20 lg:pb-24" id="generator">
            <div className="container-narrow max-w-6xl">
              <PrintTemplateGenerator />
              <p className="mt-6 text-center text-sm text-ink-600">
                Need the photo itself first?{" "}
                <Link
                  href="/passport-size-photo-maker"
                  className="inline-flex items-center gap-1 font-bold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 hover:text-brand-800"
                >
                  Make a passport size photo
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* 3. WHAT IT IS + BENEFITS */}
        <section className="section-padding" aria-labelledby="what-heading">
          <div className="container-narrow">
            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
                <span className="eyebrow">How it works</span>
                <h2 id="what-heading" className="display-2 mt-4 text-ink-950">
                  What Is a Passport Photo Sheet Maker?
                </h2>
                <p className="lead mt-5">
                  A passport photo sheet maker tiles one photo into a grid on a single page. Instead of printing one 35×45 mm photo at a time, you print one sheet and cut out every copy. It is the quickest way to make 8 passport size photos online without paying booth prices.
                </p>
                <p className="mt-4 text-base leading-relaxed text-ink-600">
                  Whether you need a passport size photo A4 sheet for your home printer or a passport size 4×6 photo for your local kiosk, the generator sizes everything for you.
                </p>
              </div>

              <div className="surface p-7 shadow-soft sm:p-8 lg:col-span-5">
                <span className="icon-tile" aria-hidden="true">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-ink-950 sm:text-2xl">Why applicants use it</h3>
                <ul className="m-0 mt-5 list-none space-y-3.5 p-0 text-sm leading-relaxed text-ink-700 sm:text-base">
                  <CheckItem><strong className="text-ink-950">You save money.</strong> Pay for a standard print, not a passport photo service.</CheckItem>
                  <CheckItem><strong className="text-ink-950">You get up to 8 photos.</strong> That covers a passport, a visa, other ID and spares.</CheckItem>
                  <CheckItem><strong className="text-ink-950">You print anywhere.</strong> Use a photo kiosk, a print shop, a pharmacy photo counter or your own printer.</CheckItem>
                  <CheckItem><strong className="text-ink-950">You keep control.</strong> Retake as often as you like, in good light, at home.</CheckItem>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. STEPS */}
        <section className="border-y border-ink-100 bg-ink-50 section-padding" aria-labelledby="steps-heading">
          <div className="container-narrow">
            <SectionHeader
              id="steps-heading"
              eyebrow="Photo Kiosk Tip"
              title="How to Print Passport Photos for the Price of a Standard Print"
              description="Follow three steps to skip the booth fee and still get correctly sized prints."
            />

            <div className="relative mt-14">
              <div className="pointer-events-none absolute left-[16%] right-[16%] top-14 hidden h-px border-t-2 border-dashed border-ink-200 md:block" aria-hidden="true" />
              <ol className="relative m-0 grid list-none gap-6 p-0 md:grid-cols-3 lg:gap-8">
                {[
                  {
                    n: "01",
                    icon: Download,
                    title: "Make your sheet",
                    body: (
                      <>
                        Upload your photo above, choose <strong>4×6″</strong> or <strong>A4</strong>, and download the 300 DPI JPEG to your phone or a USB stick.
                      </>
                    ),
                  },
                  {
                    n: "02",
                    icon: Printer,
                    title: "Order a standard 4×6″ print",
                    body: (
                      <>
                        At any photo kiosk or print shop, choose <strong>&quot;Standard Photo Prints (4×6″)&quot;</strong>. Do not press the pricier &quot;Passport Photo&quot; button.
                      </>
                    ),
                  },
                  {
                    n: "03",
                    icon: Scissors,
                    title: "Cut along the crop marks",
                    body: (
                      <>
                        Collect your glossy print. Cut along the corner marks to get up to 8 photos at the exact size you chose.
                      </>
                    ),
                  },
                ].map(({ n, icon: Icon, title, body }) => (
                  <li key={n} className="surface surface-hover relative p-7 sm:p-8">
                    <div className="flex items-center justify-between">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-brand" aria-hidden="true">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="font-display text-5xl font-extrabold tracking-tighter text-ink-100" aria-hidden="true">
                        {n}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-extrabold text-ink-950">
                      <span className="sr-only">Step {Number(n)}: </span>
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base [&_strong]:text-ink-950">{body}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-12 text-center">
              <a href="#generator" className="btn-dark btn-lg">
                <Upload className="h-5 w-5" aria-hidden="true" />
                Make My Print Sheet
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* 5. PAPER SIZES + PHOTO RULES */}
        <section className="section-padding" aria-labelledby="paper-heading">
          <div className="container-narrow">
            <SectionHeader
              id="paper-heading"
              align="left"
              eyebrow="Paper sizes"
              title="4×6″ or A4: Which Sheet Should You Choose?"
              description="Pick 4×6″ for cheap kiosk prints. Pick A4 if you would rather print at home or need several sets at once."
            />

            <div className="mt-12 grid items-start gap-6 lg:grid-cols-12">
              <div className="surface overflow-hidden shadow-soft lg:col-span-7">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm sm:text-base">
                    <thead>
                      <tr className="border-b border-ink-200 bg-ink-50">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-ink-500 sm:px-6">Paper</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-ink-500 sm:px-6">Photos per sheet</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-ink-500 sm:px-6">Best for</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {PAPER_SIZES.map((r) => (
                        <tr key={r.paper + r.photos} className="transition-colors hover:bg-brand-50/50">
                          <td className="p-4 font-bold text-ink-950 sm:px-6">{r.paper}</td>
                          <td className="p-4 text-ink-700 sm:px-6">{r.photos}</td>
                          <td className="p-4 text-ink-600 sm:px-6">{r.bestFor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="surface p-7 sm:p-8 lg:col-span-5">
                <span className="icon-tile" aria-hidden="true">
                  <ClipboardCheck className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-ink-950 sm:text-2xl">Photo rules to check before you print</h3>
                <ul className="m-0 mt-5 list-none space-y-3 p-0 text-sm leading-relaxed text-ink-700 sm:text-base [&_strong]:text-ink-950">
                  <CheckItem>Print each photo at the <strong>exact size</strong> your document needs, such as 35×45 mm or 2×2″.</CheckItem>
                  <CheckItem>Check the <strong>head size</strong> rule for your document. It differs between countries.</CheckItem>
                  <CheckItem>Use a plain, light background with no shadows.</CheckItem>
                  <CheckItem>Print on photo paper, with no borders or creases.</CheckItem>
                  <CheckItem>Print at <strong>100% scale</strong>, never &quot;Fit to Page&quot;.</CheckItem>
                </ul>
                <p className="mt-6 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 sm:text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                  <span>
                    Photo rules change and differ between countries and application types. Always confirm the
                    current requirements with the authority that issues your document. {SITE_DISCLAIMER}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. COMPARISON TABLE */}
        <section className="relative overflow-hidden bg-ink-950 section-padding" aria-labelledby="compare-heading">
          <div className="pointer-events-none absolute inset-0 bg-dots-dark" aria-hidden="true" />
          <div className="pointer-events-none absolute -top-48 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl" aria-hidden="true" />
          <div className="container-narrow relative">
            <SectionHeader
              id="compare-heading"
              dark
              eyebrow="Compare"
              title="Photo Booth vs. 4×6″ Print Template"
              description="Compare a printable sheet with a photo booth or passport photo service."
            />

            <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-lift">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-ink-200 bg-ink-50">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-ink-500 sm:p-5">Feature</th>
                      <th className="bg-brand-600 p-4 font-display font-extrabold text-white sm:p-5">{SITE_NAME} 4×6″ Sheet</th>
                      <th className="p-4 font-display font-bold text-ink-700 sm:p-5">Photo Booth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    <tr>
                      <td className="p-4 font-semibold text-ink-950 sm:p-5">Cost</td>
                      <td className="bg-brand-50 p-4 font-bold text-brand-800 sm:p-5">Free tool + one standard print</td>
                      <td className="p-4 text-ink-600 sm:p-5">Passport photo service price</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-ink-950 sm:p-5">Photos per sheet</td>
                      <td className="bg-brand-50 p-4 font-bold text-brand-800 sm:p-5">Up to 8</td>
                      <td className="p-4 text-ink-600 sm:p-5">Usually 4</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-ink-950 sm:p-5">Retakes</td>
                      <td className="bg-brand-50 p-4 font-bold text-brand-800 sm:p-5">Unlimited, at your own pace</td>
                      <td className="p-4 text-ink-600 sm:p-5">A few rushed attempts</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-ink-950 sm:p-5">Cutting guides</td>
                      <td className="bg-brand-50 p-4 font-bold text-brand-800 sm:p-5">Calibrated corner crop marks</td>
                      <td className="p-4 text-ink-600 sm:p-5">White borders, no marks</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-ink-950 sm:p-5">Digital copy</td>
                      <td className="bg-brand-50 p-4 font-bold text-brand-800 sm:p-5">Instant 300 DPI JPEG + PNG</td>
                      <td className="p-4 text-ink-600 sm:p-5">Often an extra fee</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FAQ */}
        <section className="section-padding">
          <div className="container-narrow max-w-4xl [&>div]:mt-0 [&>div]:border-t-0 [&>div]:pt-0">
            <FaqAccordion
              faqs={PRINT_FAQS}
              title="Passport Photo Sheet & 4×6 Printing FAQs"
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
