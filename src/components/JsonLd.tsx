import { LOGO_URL, SITE_NAME, SITE_URL, SUPPORT_EMAIL } from "@/lib/site";
import { PRICING } from "@/lib/config/pricing";

export interface JsonLdFaqEntry {
  question: string;
  answer: string;
}

export interface JsonLdProps {
  siteUrl?: string;
  siteName?: string;
  description?: string;
  logoUrl?: string;
  imageUrl?: string;
  appName?: string;
  appUrl?: string;
  appId?: string;
  applicationCategory?: string;
  price?: string;
  priceCurrency?: string;
  faqItems?: JsonLdFaqEntry[];
  /** Absolute URL of the page the FAQs and breadcrumbs belong to. */
  pageUrl?: string;
  /** Emits a WebPage node for `pageUrl` when set. */
  pageName?: string;
  pageDescription?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  includeOrganization?: boolean;
  includeWebsite?: boolean;
  includeWebApp?: boolean;
}


/**
 * Returns JSON-LD structured data for Google Search & SEO rich results.
 * Strictly adheres to Google Search Central guidelines:
 * - Only emits FAQPage schema if matching visible FAQs are supplied on the page.
 * - Emits valid Organization, WebSite, and WebApplication schemas.
 */
export default function JsonLd({
  siteUrl = SITE_URL,
  siteName = SITE_NAME,
  description = "Make a passport, visa or ID photo online for 50+ countries, sized and checked against each country's photo rules.",
  logoUrl = LOGO_URL,
  imageUrl = LOGO_URL,
  appName,
  appUrl,
  appId,
  applicationCategory = "PhotographyApplication",
  price = PRICING.amount.toFixed(2),
  priceCurrency = PRICING.currency,
  faqItems,
  pageUrl,
  pageName,
  pageDescription,
  breadcrumbs,
  includeOrganization = true,
  includeWebsite = true,
  includeWebApp = true,
}: JsonLdProps) {
  const graph: object[] = [];

  if (includeOrganization) {
    graph.push({
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
        width: 640,
        height: 640,
      },
      image: imageUrl,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SUPPORT_EMAIL,
        availableLanguage: ["English"],
      },
    });
  }

  if (includeWebsite) {
    graph.push({
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: description,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en",
    });
  }

  if (includeWebApp) {
    const resolvedAppUrl = appUrl || `${siteUrl}/passport-size-photo-maker`;
    const resolvedAppId = appId || `${siteUrl}/#webapp`;
    const resolvedAppName = appName || `${siteName} Passport Photo Maker`;

    graph.push({
      "@type": "WebApplication",
      "@id": resolvedAppId,
      name: resolvedAppName,
      url: resolvedAppUrl,
      description: description,
      applicationCategory: applicationCategory,
      operatingSystem: "All",
      browserRequirements:
        "Requires a modern web browser with JavaScript enabled",
      offers: {
        "@type": "Offer",
        price: price,
        priceCurrency: priceCurrency,
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
      },
      provider: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en",
    });
  }

  const pageId = `${pageUrl ?? `${siteUrl}/`}`;
  const hasBreadcrumbs = Boolean(breadcrumbs && breadcrumbs.length > 0);

  if (pageUrl && pageName) {
    graph.push({
      "@type": "WebPage",
      "@id": `${pageId}#webpage`,
      url: pageUrl,
      name: pageName,
      ...(pageDescription ? { description: pageDescription } : {}),
      inLanguage: "en",
      isPartOf: { "@id": `${siteUrl}/#website` },
      publisher: { "@id": `${siteUrl}/#organization` },
      ...(hasBreadcrumbs ? { breadcrumb: { "@id": `${pageId}#breadcrumb` } } : {}),
      ...(includeWebApp ? { mainEntity: { "@id": appId || `${siteUrl}/#webapp` } } : {}),
    });
  }

  if (faqItems && faqItems.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageId}#faq`,
      mainEntity: faqItems.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: entry.answer,
        },
      })),
    });
  }

  if (breadcrumbs && hasBreadcrumbs) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${pageId}#breadcrumb`,
      itemListElement: breadcrumbs.map((crumb, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
  }

  const graphData = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphData) }}
    />
  );
}
