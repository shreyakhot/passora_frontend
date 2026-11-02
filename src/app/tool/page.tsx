import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { TOOL_CLUSTERS, getAllToolSummaries } from "@/lib/tools";
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

      <main className="flex-1 bg-base-100 text-base-content" id="main-content">
        <section className="bg-base-200 py-10 sm:py-14 border-b border-base-300" aria-label="Photo guides header">
          <div className="container-narrow max-w-5xl">
            <nav className="text-xs text-slate-600 mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 list-none p-0 m-0">
                <li>
                  <Link href="/" className="text-slate-600 hover:text-lime-800 transition-colors font-medium">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-secondary font-semibold" aria-current="page">
                  Photo Guides
                </li>
              </ol>
            </nav>
            <h1 className="text-3xl! sm:text-4xl! font-extrabold text-secondary tracking-tight leading-tight mb-4">
              {PAGE_TITLE}
            </h1>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-3xl">
              Plain answers about passport, visa and ID photos: what size you need, the rules your photo must
              meet, where to get one taken and how to make one yourself. Photo rules change, so each guide links
              to the official source and shows when it was last checked.
            </p>
          </div>
        </section>

        <div className="container-narrow max-w-5xl py-12 sm:py-16 space-y-12">
          {clusters.map((cluster) => (
            <section key={cluster.id} aria-labelledby={`cluster-${cluster.id}`}>
              <h2
                id={`cluster-${cluster.id}`}
                className="text-2xl! sm:text-3xl! font-extrabold text-secondary tracking-tight mb-2"
              >
                {cluster.name}
              </h2>
              <p className="text-slate-700 text-sm sm:text-base mb-6">{cluster.intro}</p>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
                {cluster.guides.map((guide) => (
                  <li key={guide.slug}>
                    <Link
                      href={`/tool/${guide.slug}`}
                      className="bg-base-100 border border-base-300 hover:border-primary p-5 rounded-2xl flex items-start justify-between gap-3 transition-colors group h-full"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-secondary group-hover:text-lime-800 transition-colors mb-1">
                          {guide.title}
                        </span>
                        <span className="block text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {guide.description}
                        </span>
                      </span>
                      <ArrowRight
                        className="w-4 h-4 text-slate-400 group-hover:text-primary shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
