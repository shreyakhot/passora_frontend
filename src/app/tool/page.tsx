import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { POPULAR_TOOLS, TOOL_DIRECTORY, TOOL_GROUPS, type ToolDirectoryEntry } from "@/lib/tool-directory";
import { COUNTRIES, DEFAULT_COUNTRY, countryPagePath, documentLabel } from "@/config/countries";
import { LOGO_URL, SITE_NAME, SITE_URL } from "@/lib/site";

const PAGE_TITLE = "Passport & Visa Photo Sizes by Country";
const PAGE_DESCRIPTION = `Passport and visa photo makers for ${COUNTRIES.length} countries. Pick your country to see the photo size, then crop, size and check your photo online.`;

const groupId = (group: string) =>
  `group-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const GROUP_INTROS: Record<string, string> = {
  "Passport Photos":
    "Passport photo sizes for every supported country, in alphabetical order.",
  "Visa Photos":
    "Photo sizes for visa applications. Check the embassy or consulate guidance for your visa type.",
};

function ToolCard({ tool }: { tool: ToolDirectoryEntry }) {
  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="bg-white border border-slate-200 hover:border-lime-600 p-5 rounded-2xl flex items-center justify-between transition-all group h-full"
    >
      <span className="flex items-center gap-3 min-w-0">
        <span className="text-2xl shrink-0" aria-hidden="true">{tool.flag}</span>
        <span className="min-w-0">
          <span className="text-sm font-bold text-slate-900 group-hover:text-lime-900 transition-colors block">
            {tool.title}
          </span>
          <span className="text-xs text-slate-500 font-mono">{tool.spec}</span>
        </span>
      </span>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#4D7C0F] shrink-0 ml-2" aria-hidden="true" />
    </Link>
  );
}

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/tool`,
  },
  openGraph: {
    title: `${PAGE_TITLE} — ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/tool`,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [{ url: LOGO_URL, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} — ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: [LOGO_URL],
  },
};

export default function ToolHubPage() {
  return (
    <>
      <JsonLd
        siteUrl={SITE_URL}
        siteName={SITE_NAME}
        pageUrl={`${SITE_URL}/tool`}
        pageName={PAGE_TITLE}
        pageDescription={PAGE_DESCRIPTION}
        breadcrumbs={[
          { name: "Home", url: SITE_URL },
          { name: "Photo Guides", url: `${SITE_URL}/tool` },
        ]}
        includeOrganization={false}
        includeWebsite={false}
        includeWebApp={false}
      />

      <Navbar ctaText="Create Photo" ctaHref="/passport-size-photo-maker" />

      <main className="flex-1 bg-white text-slate-900" id="main-content">
        <section className="bg-slate-50/80 py-10 sm:py-16 border-b border-slate-200/80" aria-label="Photo guides header">
          <div className="container-narrow max-w-5xl">
            <nav className="text-xs text-slate-600 mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 list-none p-0 m-0">
                <li>
                  <Link href="/" className="text-slate-600 hover:text-lime-800 transition-colors font-medium">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-slate-900 font-semibold" aria-current="page">
                  Photo Guides
                </li>
              </ol>
            </nav>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-4">
              {PAGE_TITLE}
            </h1>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-3xl">
              Find the photo size for your application. Each page covers one country&apos;s
              passport or visa photo, with a photo maker to size and check your picture. Photo
              rules change, so always confirm the current requirements with your country&apos;s
              issuing authority. Not sure where to start? Try the{" "}
              <Link href={countryPagePath(DEFAULT_COUNTRY.country_code)} className="font-bold underline text-[#365314] hover:text-[#4D7C0F]">
                {DEFAULT_COUNTRY.country_name} {documentLabel(DEFAULT_COUNTRY)} photo maker
              </Link>{" "}
              or the{" "}
              <Link href="/passport-size-photo-maker" className="font-bold underline text-[#365314] hover:text-[#4D7C0F]">
                passport size photo maker
              </Link>
              .
            </p>
          </div>
        </section>

        <div className="container-narrow max-w-5xl py-12 sm:py-16 space-y-12">
          <section aria-labelledby="group-popular">
            <h2
              id="group-popular"
              className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2"
            >
              Popular Countries
            </h2>
            <p className="text-slate-700 text-sm sm:text-base mb-6">
              The passport and visa photos people make most often.
            </p>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
              {POPULAR_TOOLS.map((t) => (
                <li key={t.slug}>
                  <ToolCard tool={t} />
                </li>
              ))}
            </ul>
          </section>

          {TOOL_GROUPS.map((group) => (
            <section key={group} aria-labelledby={groupId(group)}>
              <h2
                id={groupId(group)}
                className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2"
              >
                {group}
              </h2>
              <p className="text-slate-700 text-sm sm:text-base mb-6">{GROUP_INTROS[group]}</p>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
                {TOOL_DIRECTORY.filter((t) => t.group === group).map((t) => (
                  <li key={t.slug}>
                    <ToolCard tool={t} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section aria-label="Print sheets" className="border-t border-slate-200 pt-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
              Printing Your Photos
            </h2>
            <p className="text-slate-700 text-sm sm:text-base">
              Already have a passport photo? Use the{" "}
              <Link href="/passport-photo-print-template-generator" className="font-bold underline text-[#365314] hover:text-[#4D7C0F]">
                passport photo print template generator
              </Link>{" "}
              to lay out copies on a 6×4″ sheet for a photo shop.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
