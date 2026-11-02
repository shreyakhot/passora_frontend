import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Camera,
  ChevronRight,
  Globe,
  MapPin,
  Ruler,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { TOOL_CLUSTERS, getAllToolSummaries, type ToolCluster } from "@/lib/tools";
import { LOGO_URL, SITE_NAME, SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/tool`;
const PAGE_TITLE = "Passport Photo Guides";
const PAGE_DESCRIPTION =
  "Guides to passport, visa and ID photos: sizes, official requirements, where to get photos taken and how to make one yourself.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${PAGE_TITLE} — ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [{ url: LOGO_URL, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: `${PAGE_TITLE} — ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: [LOGO_URL],
  },
};

/** Icon shown on each cluster's heading and guide cards (visual only). */
const CLUSTER_ICONS: Record<ToolCluster, LucideIcon> = {
  "core-local": BookOpen,
  "retailer-brands": MapPin,
  "diy-tools": Camera,
  "size-requirements": Ruler,
  "visa-countries": Globe,
};

export default function ToolHubPage() {
  const guides = getAllToolSummaries();
  const clusters = TOOL_CLUSTERS.map((cluster) => ({
    ...cluster,
    guides: guides.filter((g) => g.cluster === cluster.id),
  })).filter((cluster) => cluster.guides.length > 0);

  return (
    <>
      <JsonLd
        siteUrl={SITE_URL}
        siteName={SITE_NAME}
        pageUrl={PAGE_URL}
        pageName={PAGE_TITLE}
        pageDescription={PAGE_DESCRIPTION}
        breadcrumbs={[
          { name: "Home", url: SITE_URL },
          { name: "Photo Guides", url: PAGE_URL },
        ]}
        includeOrganization={false}
        includeWebsite={false}
        includeWebApp={false}
      />

      <Navbar ctaText="Create Photo" ctaHref="/passport-size-photo-maker" />

      <main className="flex-1 bg-white text-ink-950" id="main-content">
        <section
          className="relative overflow-hidden border-b border-ink-100"
          aria-label="Photo guides header"
        >

          <div className="container-narrow relative pb-14 pt-8 sm:pb-20 sm:pt-12">
            <nav className="text-xs text-ink-500 sm:text-sm" aria-label="Breadcrumb">
              <ol className="m-0 flex list-none items-center gap-1.5 p-0">
                <li>
                  <Link href="/" className="font-medium text-ink-500 transition-colors hover:text-brand-700">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
                </li>
                <li className="font-semibold text-ink-950" aria-current="page">
                  Photo Guides
                </li>
              </ol>
            </nav>

            <div className="mt-8 max-w-3xl">
              <span className="eyebrow">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {guides.length} guides
              </span>
              <h1 className="display-1 mt-5 text-ink-950">{PAGE_TITLE}</h1>
              <p className="lead mt-5 max-w-2xl">
                Plain answers about passport, visa and ID photos: what size you need, the rules your photo must
                meet, where to get one taken and how to make one yourself. Photo rules change, so each guide links
                to the official source and shows when it was last checked.
              </p>
            </div>

            {clusters.length > 1 && (
              <nav className="mt-10" aria-label="Guide topics">
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {clusters.map((cluster) => {
                    const Icon = CLUSTER_ICONS[cluster.id];
                    return (
                      <li key={cluster.id}>
                        <a
                          href={`#cluster-${cluster.id}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 shadow-soft transition-colors hover:border-brand-300 hover:text-brand-700 focus-ring"
                        >
                          <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                          {cluster.name}
                          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-bold text-ink-600">
                            {cluster.guides.length}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </div>
        </section>

        <div className="container-narrow section-padding space-y-16 sm:space-y-20">
          {clusters.map((cluster) => {
            const Icon = CLUSTER_ICONS[cluster.id];
            return (
              <section key={cluster.id} aria-labelledby={`cluster-${cluster.id}`}>
                <div className="flex items-start gap-4">
                  <span className="icon-tile" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2
                      id={`cluster-${cluster.id}`}
                      className="scroll-mt-28 text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl"
                    >
                      {cluster.name}
                    </h2>
                    <p className="mt-1.5 max-w-2xl text-sm text-ink-600 sm:text-base">{cluster.intro}</p>
                  </div>
                </div>
                <ul className="m-0 mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                  {cluster.guides.map((guide) => (
                    <li key={guide.slug}>
                      <Link
                        href={`/tool/${guide.slug}`}
                        className="surface surface-hover group flex h-full flex-col p-6 focus-ring"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="icon-tile h-10 w-10 rounded-xl" aria-hidden="true">
                            <Icon className="h-4 w-4" />
                          </span>
                          {guide.hub && (
                            <span className="rounded-full bg-ink-950 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                              Start here
                            </span>
                          )}
                        </span>
                        <span className="mt-5 block font-display text-lg font-extrabold leading-snug tracking-tight text-ink-950 transition-colors group-hover:text-brand-700">
                          {guide.title}
                        </span>
                        <span className="mt-2 block text-sm leading-relaxed text-ink-600 line-clamp-3">
                          {guide.description}
                        </span>
                        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-brand-700">
                          Read guide
                          <ArrowRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <section className="pb-16 sm:pb-24" aria-labelledby="hub-cta-heading">
          <div className="container-narrow">
            <div className="relative overflow-hidden rounded-[1.5rem] bg-ink-950 p-8 text-white shadow-lift sm:p-12">
              <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h2 id="hub-cta-heading" className="text-2xl font-extrabold text-white sm:text-3xl">
                    Ready to make your photo?
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-300 sm:text-base">
                    Pick your country, upload a recent photo and preview the sized result before you pay.
                  </p>
                </div>
                <Link href="/passport-size-photo-maker" className="btn-brand btn-lg shrink-0">
                  <Camera className="h-5 w-5" aria-hidden="true" />
                  Create my photo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
