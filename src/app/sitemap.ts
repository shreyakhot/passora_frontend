import type { MetadataRoute } from "next";
import { getAllToolSlugs } from "@/lib/tools";
import { SITE_URL } from "@/lib/site";

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

const STATIC_PAGES: { path: string; changeFrequency: ChangeFrequency; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/passport-size-photo-maker", changeFrequency: "weekly", priority: 0.9 },
  { path: "/passport-photo-print-template-generator", changeFrequency: "weekly", priority: 0.9 },
  { path: "/tool", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.8 },
  { path: "/data-security-privacy-safeguards", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy-policy", changeFrequency: "monthly", priority: 0.6 },
  { path: "/terms-of-service", changeFrequency: "monthly", priority: 0.6 },
  { path: "/refund-policy", changeFrequency: "monthly", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const toolEntries: MetadataRoute.Sitemap = getAllToolSlugs().map((slug) => ({
    url: `${SITE_URL}/tool/${slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticEntries, ...toolEntries];
}
