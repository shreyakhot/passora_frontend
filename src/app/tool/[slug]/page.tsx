import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarCheck, Sparkles } from "lucide-react";
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
      className="bg-base-100 border border-base-300 hover:border-primary p-5 rounded-2xl flex items-start justify-between gap-3 transition-colors group h-full"
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-secondary group-hover:text-lime-800 transition-colors mb-1">
          {guide.title}
        </span>
        <span className="block text-xs text-slate-600 leading-relaxed line-clamp-2">
          {guide.description}
        </span>
      </span>
      <ArrowRight
        className="w-4 h-4 text-slate-400 group-hover:text-primary shrink-0 mt-0.5"
        aria-hidden="true"
      />
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

      <main className="flex-1 bg-base-100 text-base-content" id="main-content">
        <section className="bg-base-200 py-10 sm:py-14 border-b border-base-300" aria-label="Guide overview">
          <div className="container-narrow max-w-4xl">
            <nav className="text-xs text-slate-600 mb-5" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 list-none p-0 m-0">
                {breadcrumbs.slice(0, -1).map((crumb) => (
                  <li key={crumb.url} className="flex items-center gap-1.5">
                    <Link
                      href={crumb.url.replace(SITE_URL, "") || "/"}
                      className="text-slate-600 hover:text-lime-800 transition-colors font-medium"
                    >
                      {crumb.name}
                    </Link>
                    <span aria-hidden="true" className="text-slate-400">/</span>
                  </li>
                ))}
                <li className="text-secondary font-semibold" aria-current="page">
                  {tool.title}
                </li>
              </ol>
            </nav>

            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-50 border border-lime-300 text-xs font-bold text-lime-900 tracking-wide mb-4">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              {cluster.name}
            </p>

            <h1 className="text-3xl! sm:text-4xl! font-extrabold text-secondary tracking-tight leading-tight mb-4">
              {tool.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-3xl">{tool.intro}</p>

            {tool.lastVerified && (
              <p className="mt-5 inline-flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <CalendarCheck className="w-4 h-4 text-primary" aria-hidden="true" />
                Last checked against official sources on{" "}
                <time dateTime={tool.lastVerified}>{formatDate(tool.lastVerified)}</time>
              </p>
            )}

            {tool.studio && (
              <div className="mt-7">
                <a href="#studio" className="btn btn-primary text-white! px-7">
                  Make my photo
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </section>

        {tool.studio && (
          <section className="bg-base-100 py-10 sm:py-14 border-b border-base-300" id="studio" aria-label="Photo maker">
            <div className="container-narrow max-w-2xl">
              <h2 className="text-2xl! sm:text-3xl! font-extrabold text-secondary tracking-tight text-center mb-2">
                Upload your photo
              </h2>
              <p className="text-slate-700 text-sm text-center max-w-md mx-auto mb-6 leading-relaxed">
                Pick the country and document, then upload a recent photo. You see the result before you pay.
              </p>
              <PhotoMakerStudio defaultCountryCode={tool.countryCode} />
              <OfficialPhotoNotice countryName={countryName} className="mt-5" />
            </div>
          </section>
        )}

        <section className="py-12 sm:py-16 bg-base-100" aria-label="Guide">
          <div className="container-narrow max-w-4xl">
            <article className="bg-base-100 border border-base-300 rounded-3xl p-6 sm:p-12">
              <div className="markdown-content max-w-none" dangerouslySetInnerHTML={{ __html: tool.contentHtml }} />

              {!tool.studio && (
                <aside className="mt-12 text-center bg-base-200 border border-base-300 rounded-2xl p-6 sm:p-8" aria-label="Make your photo online">
                  <h2 className="text-xl! sm:text-2xl! font-bold text-secondary mb-2">Make your photo online</h2>
                  <p className="text-sm text-slate-700 mb-5 max-w-lg mx-auto leading-relaxed">
                    Upload a photo taken against a plain, light background. The maker crops and sizes it for the
                    country you pick, and you preview it before paying.
                  </p>
                  <Link
                    href={makerPublished ? `/tool/${MAKER_SLUG}` : "/passport-size-photo-maker"}
                    className="btn btn-primary text-white! px-7"
                  >
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    Start with your photo
                  </Link>
                </aside>
              )}

              <FaqAccordion faqs={tool.faqs} title={tool.title.toLowerCase()} />

              {tool.sources.length > 0 && (
                <section className="mt-12 pt-8 border-t border-base-300" aria-labelledby="sources-heading">
                  <h2 id="sources-heading" className="text-lg! font-bold text-secondary mb-3">
                    Sources
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
                    {tool.sources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lime-800! underline font-semibold hover:text-lime-900!"
                        >
                          {source.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {!tool.studio && <OfficialPhotoNotice countryName={countryName} className="mt-8" />}
            </article>
          </div>
        </section>

        {relatedGuides.length > 0 && (
          <section className="py-12 sm:py-16 bg-base-200 border-t border-base-300" aria-labelledby="related-heading">
            <div className="container-narrow max-w-5xl">
              <h2 id="related-heading" className="text-2xl! sm:text-3xl! font-extrabold text-secondary tracking-tight mb-6">
                Related guides
              </h2>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
                {relatedGuides.map((guide) => (
                  <li key={guide.slug}>
                    <GuideCard guide={guide} />
                  </li>
                ))}
              </ul>
              <p className="mt-8">
                <Link href="/tool" className="inline-flex items-center gap-1.5 text-sm font-bold text-lime-800! underline">
                  All photo guides
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
