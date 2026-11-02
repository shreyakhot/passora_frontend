import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Camera,
  Check,
  ChevronRight,
  ExternalLink,
  Globe,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import PhotoMakerStudio from "@/components/PhotoMakerStudio";
import FaqAccordion from "@/components/FaqAccordion";
import OfficialPhotoNotice from "@/components/OfficialPhotoNotice";
import {
  TOOL_CLUSTERS,
  getAllToolSlugs,
  getAllToolSummaries,
  getToolBySlug,
  type ToolSummary,
} from "@/lib/tools";
import { getCountryByCode } from "@/config/countries";
import { LOGO_URL, SITE_NAME, SITE_URL } from "@/lib/site";

/** The strategy's money page: every guide's CTA points here. */
const MAKER_SLUG = "online-passport-photo-maker";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return {};

  const pageUrl = `${SITE_URL}/tool/${slug}`;
  const socialTitle = `${tool.metaTitle} — ${SITE_NAME}`;

  return {
    title: tool.metaTitle,
    description: tool.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: socialTitle,
      description: tool.description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "article",
      ...(tool.published ? { publishedTime: tool.published } : {}),
      ...(tool.lastVerified ? { modifiedTime: tool.lastVerified } : {}),
      images: [{ url: LOGO_URL, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary",
      title: socialTitle,
      description: tool.description,
      images: [LOGO_URL],
    },
  };
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function GuideCard({ guide }: { guide: ToolSummary }) {
  return (
    <Link
      href={`/tool/${guide.slug}`}
      className="surface surface-hover group flex h-full flex-col p-6 focus-ring"
    >
      <span className="icon-tile h-10 w-10 rounded-xl" aria-hidden="true">
        <BookOpen className="h-4 w-4" />
      </span>
      <span className="mt-5 block font-display text-lg font-extrabold leading-snug tracking-tight text-ink-950 transition-colors group-hover:text-brand-700">
        {guide.title}
      </span>
      <span className="mt-2 block text-sm leading-relaxed text-ink-600 line-clamp-2">
        {guide.description}
      </span>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-brand-700">
        Read guide
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

export default async function ToolGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  const pageUrl = `${SITE_URL}/tool/${slug}`;
  const cluster = TOOL_CLUSTERS.find((c) => c.id === tool.cluster) ?? TOOL_CLUSTERS[0];
  const allGuides = getAllToolSummaries();
  const hubGuide = !tool.hub ? allGuides.find((g) => g.slug === cluster.hub) : undefined;
  const makerPublished = allGuides.some((g) => g.slug === MAKER_SLUG);
  const countryName = tool.countryCode ? getCountryByCode(tool.countryCode)?.country_name : undefined;

  // Hand-picked related guides first, then the cluster hub and the pillar.
  const relatedGuides: ToolSummary[] = [];
  for (const guide of [
    ...tool.related,
    ...(hubGuide ? [hubGuide] : []),
    ...allGuides.filter((g) => g.slug === "passport-photo"),
  ]) {
    if (guide.slug !== slug && !relatedGuides.some((g) => g.slug === guide.slug)) {
      relatedGuides.push(guide);
    }
  }

  const makerHref = makerPublished ? `/tool/${MAKER_SLUG}` : "/passport-size-photo-maker";

  const breadcrumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Photo Guides", url: `${SITE_URL}/tool` },
    ...(hubGuide ? [{ name: hubGuide.title, url: `${SITE_URL}/tool/${hubGuide.slug}` }] : []),
    { name: tool.title, url: pageUrl },
  ];

  return (
    <>
      <JsonLd
        siteUrl={SITE_URL}
        siteName={SITE_NAME}
        description={tool.description}
        appName={`${SITE_NAME} Online Passport Photo Maker`}
        appUrl={pageUrl}
        appId={`${pageUrl}#webapp`}
        pageUrl={pageUrl}
        pageName={tool.metaTitle}
        pageDescription={tool.description}
        datePublished={tool.published}
        dateModified={tool.lastVerified}
        breadcrumbs={breadcrumbs}
        faqItems={tool.faqs}
        howTo={tool.howToSteps.length > 0 ? { name: tool.title, steps: tool.howToSteps } : undefined}
        includeOrganization={false}
        includeWebsite={false}
        includeWebApp={tool.studio}
      />

      <Navbar
        ctaText="Create Photo"
        ctaHref={tool.studio ? "#studio" : makerPublished ? `/tool/${MAKER_SLUG}` : "/passport-size-photo-maker"}
      />

      <main className="flex-1 bg-white text-ink-950" id="main-content">
        <section className="relative overflow-hidden border-b border-ink-100" aria-label="Guide overview">

          <div className="container-narrow relative pb-12 pt-8 sm:pb-16 sm:pt-12">
            <nav className="text-xs text-ink-500 sm:text-sm" aria-label="Breadcrumb">
              <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
                {breadcrumbs.slice(0, -1).map((crumb) => (
                  <li key={crumb.url} className="flex items-center gap-1.5">
                    <Link
                      href={crumb.url.replace(SITE_URL, "") || "/"}
                      className="font-medium text-ink-500 transition-colors hover:text-brand-700"
                    >
                      {crumb.name}
                    </Link>
                    <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-ink-300" />
                  </li>
                ))}
                <li className="font-semibold text-ink-950" aria-current="page">
                  {tool.title}
                </li>
              </ol>
            </nav>

            <div className="mt-8 max-w-4xl">
              <p className="eyebrow">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {cluster.name}
              </p>

              <h1 className="display-2 mt-5 text-ink-950">{tool.title}</h1>
              <p className="lead mt-5 max-w-3xl">{tool.intro}</p>

              {(tool.lastVerified || countryName || tool.sources.length > 0) && (
                <ul className="m-0 mt-7 flex list-none flex-wrap gap-2 p-0 text-xs text-ink-700 sm:text-sm">
                  {tool.lastVerified && (
                    <li className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5">
                      <CalendarCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
                      <span>
                        Last checked against official sources on{" "}
                        <time dateTime={tool.lastVerified} className="font-semibold text-ink-950">
                          {formatDate(tool.lastVerified)}
                        </time>
                      </span>
                    </li>
                  )}
                  {countryName && (
                    <li className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 font-semibold text-ink-950">
                      <Globe className="h-4 w-4 text-brand-600" aria-hidden="true" />
                      {countryName}
                    </li>
                  )}
                  {tool.sources.length > 0 && (
                    <li className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5">
                      <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
                      {tool.sources.length} {tool.sources.length === 1 ? "source" : "sources"} cited
                    </li>
                  )}
                </ul>
              )}

              {tool.studio && (
                <div className="mt-8">
                  <a href="#studio" className="btn-brand btn-lg">
                    Make my photo
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {tool.studio && (
          <section className="relative border-b border-ink-100 bg-ink-50 section-padding" id="studio" aria-label="Photo maker">
            <div className="container-narrow">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-5 lg:pt-6">
                  <span className="eyebrow">Photo studio</span>
                  <h2 className="display-2 mt-4 text-ink-950">Upload your photo</h2>
                  <p className="lead mt-4">
                    Pick the country and document, then upload a recent photo. You see the result before you pay.
                  </p>
                  <ul className="m-0 mt-8 list-none space-y-4 p-0 text-sm text-ink-700 sm:text-base">
                    {[
                      "Preview the finished photo before you pay",
                      "Digital file plus a 6×4″ print sheet",
                      "Your upload is used only to make your photo",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700"
                          aria-hidden="true"
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:col-span-7">
                  <PhotoMakerStudio defaultCountryCode={tool.countryCode} />
                  <OfficialPhotoNotice countryName={countryName} className="mt-5 bg-white" />
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="section-padding" aria-label="Guide">
          <div className="container-narrow">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-16">
              <article className="min-w-0 max-w-[72ch]">
                <div className="markdown-content max-w-none" dangerouslySetInnerHTML={{ __html: tool.contentHtml }} />

                {!tool.studio && (
                  <aside
                    className="relative mt-14 overflow-hidden rounded-[1.5rem] border border-brand-100 bg-brand-50 p-7 sm:p-9"
                    aria-label="Make your photo online"
                  >
                    <div className="relative">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white" aria-hidden="true">
                        <Camera className="h-5 w-5" />
                      </span>
                      <h2 className="mt-5 text-2xl font-extrabold text-ink-950 sm:text-3xl">Make your photo online</h2>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-700 sm:text-base">
                        Upload a photo taken against a plain, light background. The maker crops and sizes it for the
                        country you pick, and you preview it before paying.
                      </p>
                      <Link href={makerHref} className="btn-brand btn-lg mt-6">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Start with your photo
                      </Link>
                    </div>
                  </aside>
                )}

                <FaqAccordion faqs={tool.faqs} title={tool.title.toLowerCase()} />

                {tool.sources.length > 0 && (
                  <section className="mt-14 border-t border-ink-200 pt-10" aria-labelledby="sources-heading">
                    <h2
                      id="sources-heading"
                      className="flex scroll-mt-28 items-center gap-2.5 text-xl font-extrabold text-ink-950"
                    >
                      <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden="true" />
                      Sources
                    </h2>
                    <ul className="m-0 mt-5 list-none space-y-2.5 p-0 text-sm sm:text-base">
                      {tool.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-start gap-2 font-semibold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-[3px] transition-colors hover:text-brand-800 hover:decoration-brand-600"
                          >
                            <ExternalLink
                              className="mt-1 h-3.5 w-3.5 shrink-0 text-ink-400 transition-colors group-hover:text-brand-600"
                              aria-hidden="true"
                            />
                            {source.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {!tool.studio && <OfficialPhotoNotice countryName={countryName} className="mt-10" />}
              </article>

              <aside className="hidden lg:block" aria-label="Guide shortcuts">
                <div className="sticky top-28 space-y-5">
                  <div className="relative overflow-hidden rounded-[1.5rem] bg-ink-950 p-7 text-white shadow-lift">
                    <div className="relative">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-400/30"
                        aria-hidden="true"
                      >
                        <Camera className="h-5 w-5" />
                      </span>
                      <p className="mt-5 font-display text-xl font-extrabold leading-snug tracking-tight text-white">
                        Make your photo online
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-300">
                        Pick your country, upload a recent photo and preview the result before you pay.
                      </p>
                      {tool.studio ? (
                        <a href="#studio" className="btn-brand mt-6 w-full">
                          Make my photo
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      ) : (
                        <Link href={makerHref} className="btn-brand mt-6 w-full">
                          Start with your photo
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <nav className="surface p-6" aria-label="More guides">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">Part of</p>
                    <p className="mt-2 flex items-center gap-2 font-display text-base font-extrabold text-ink-950">
                      <BookOpen className="h-4 w-4 text-brand-600" aria-hidden="true" />
                      {cluster.name}
                    </p>
                    <ul className="m-0 mt-4 list-none space-y-1 border-t border-ink-100 p-0 pt-4 text-sm">
                      {hubGuide && (
                        <li>
                          <Link
                            href={`/tool/${hubGuide.slug}`}
                            className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                          >
                            <span className="line-clamp-2">{hubGuide.title}</span>
                            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link
                          href="/tool"
                          className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                        >
                          <span>All photo guides</span>
                          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {relatedGuides.length > 0 && (
          <section className="border-t border-ink-100 bg-ink-50 section-padding" aria-labelledby="related-heading">
            <div className="container-narrow">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <span className="eyebrow">Keep reading</span>
                  <h2 id="related-heading" className="display-2 mt-4 text-ink-950">
                    Related guides
                  </h2>
                </div>
                <Link href="/tool" className="btn-outline-brand shrink-0 self-start sm:self-auto">
                  All photo guides
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="m-0 mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {relatedGuides.map((guide) => (
                  <li key={guide.slug}>
                    <GuideCard guide={guide} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
