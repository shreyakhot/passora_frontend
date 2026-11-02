import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";
import { SITE_NAME } from "@/lib/site";

/** One Markdown file per guide page; see seo/README.md for the frontmatter. */
const TOOLS_DIRECTORY = path.join(process.cwd(), "src/content/tools");

export type ToolCluster =
  | "core-local"
  | "retailer-brands"
  | "diy-tools"
  | "size-requirements"
  | "visa-countries";

/** Cluster names and their hub slugs, in the order the strategy lists them. */
export const TOOL_CLUSTERS: { id: ToolCluster; name: string; hub: string; intro: string }[] = [
  {
    id: "core-local",
    name: "Passport Photo Basics",
    hub: "passport-photo",
    intro: "What a passport photo is, where to get one, what it costs and how fast you can have it.",
  },
  {
    id: "retailer-brands",
    name: "Where to Get Passport Photos",
    hub: "passport-photos-near-me",
    intro: "Pharmacies, post offices and print shops that take passport photos, and what to expect at each.",
  },
  {
    id: "diy-tools",
    name: "Online & DIY Passport Photos",
    hub: "online-passport-photo-maker",
    intro: "Make, check and print a passport photo yourself with a phone, a computer or an online tool.",
  },
  {
    id: "size-requirements",
    name: "Photo Size & Requirements",
    hub: "passport-photo-requirements",
    intro: "Sizes, formats and the rules a photo must meet before an authority accepts it.",
  },
  {
    id: "visa-countries",
    name: "Visa, Immigration & Countries",
    hub: "visa-photo",
    intro: "Photo rules for visas, immigration forms and specific countries.",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
  answerHtml?: string;
}

export interface ToolSource {
  name: string;
  url: string;
}

export interface ToolSummary {
  slug: string;
  title: string;
  description: string;
  cluster: ToolCluster;
  hub: boolean;
  pageNumber: number;
}

export interface ToolPageData extends ToolSummary {
  metaTitle: string;
  intro: string;
  primaryKeyword: string;
  pageType: string;
  countryCode?: string;
  studio: boolean;
  published?: string;
  lastVerified?: string;
  sources: ToolSource[];
  related: ToolSummary[];
  contentHtml: string;
  faqs: FaqItem[];
  howToSteps: string[];
}

const CLUSTER_IDS = new Set(TOOL_CLUSTERS.map((c) => c.id));

function toCluster(value: unknown): ToolCluster {
  return CLUSTER_IDS.has(value as ToolCluster) ? (value as ToolCluster) : "core-local";
}

/** gray-matter parses YAML dates into Date objects; keep them as YYYY-MM-DD. */
function toDateString(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === "string" && value ? value : undefined;
}

export function getAllToolSlugs(): string[] {
  if (!fs.existsSync(TOOLS_DIRECTORY)) return [];
  return fs
    .readdirSync(TOOLS_DIRECTORY)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

function readToolFile(slug: string): matter.GrayMatterFile<string> | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const fullPath = path.join(TOOLS_DIRECTORY, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const file = matter(fs.readFileSync(fullPath, "utf8"));
  // Editorial HTML comments (TODOs, notes) must not ship in the page source.
  file.content = file.content
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\{\{SITE_NAME\}\}/g, SITE_NAME);
  return file;
}

function toSummary(slug: string, data: Record<string, unknown>): ToolSummary {
  return {
    slug,
    title: String(data.title || slug),
    description: String(data.meta_description || ""),
    cluster: toCluster(data.cluster),
    hub: data.hub === true,
    pageNumber: Number(data.page_number) || 0,
  };
}

/** Every published guide, ordered by cluster and then by strategy page number. */
export function getAllToolSummaries(): ToolSummary[] {
  const clusterOrder = TOOL_CLUSTERS.map((c) => c.id);
  return getAllToolSlugs()
    .map((slug) => {
      const file = readToolFile(slug);
      return file ? toSummary(slug, file.data) : null;
    })
    .filter((t): t is ToolSummary => Boolean(t))
    .sort(
      (a, b) =>
        clusterOrder.indexOf(a.cluster) - clusterOrder.indexOf(b.cluster) ||
        Number(b.hub) - Number(a.hub) ||
        a.pageNumber - b.pageNumber
    );
}

async function markdownToHtml(markdown: string): Promise<string> {
  const processed = await remark().use(remarkGfm).use(html, { sanitize: false }).process(markdown);
  return processed.toString();
}

/**
 * Links to guides that are not published yet render as plain text, so writers
 * can link ahead and the links go live when the target page ships.
 */
function unlinkUnpublishedGuides(htmlContent: string, published: Set<string>): string {
  return htmlContent.replace(
    /<a href="\/tool\/([a-z0-9-]+)\/?(?:#[^"]*)?">([\s\S]*?)<\/a>/g,
    (link, slug: string, text: string) => (published.has(slug) ? link : text)
  );
}

/** Splits the "## Frequently Asked Questions" section into FAQ items. */
async function extractFaqs(
  rawContent: string,
  published: Set<string>
): Promise<{ cleanedContent: string; faqs: FaqItem[] }> {
  const match = rawContent.match(/(?:^|\n)##\s+[^\n]*\b(?:Frequently Asked Questions|FAQs?)\b[^\n]*/i);
  if (!match || match.index === undefined) return { cleanedContent: rawContent, faqs: [] };

  const startIndex = match.index;
  const rest = rawContent.slice(startIndex + match[0].length);
  const nextH2 = rest.match(/\n##\s+[^\n]+/);
  const faqBlock = nextH2?.index !== undefined ? rest.slice(0, nextH2.index) : rest;
  const after = nextH2?.index !== undefined ? rest.slice(nextH2.index) : "";
  const cleanedContent = `${rawContent.slice(0, startIndex).trimEnd()}\n\n${after.trimStart()}`;

  const faqs: FaqItem[] = [];
  for (const chunk of faqBlock.split(/(?:^|\n)###\s+/)) {
    const trimmed = chunk.trim();
    const firstNewline = trimmed.indexOf("\n");
    if (!trimmed || firstNewline === -1) continue;
    const question = trimmed.slice(0, firstNewline).trim();
    const answer = trimmed.slice(firstNewline).trim();
    if (!question || !answer) continue;
    faqs.push({
      question,
      // Plain text for FAQPage schema: drop link markup and emphasis.
      answer: answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1"),
      answerHtml: unlinkUnpublishedGuides((await markdownToHtml(answer)).trim(), published),
    });
  }
  return { cleanedContent, faqs };
}

/** Steps of the first ordered list under a "## How to ..." heading, for HowTo schema. */
function extractHowToSteps(content: string): string[] {
  const section = content.match(/(?:^|\n)##\s+How to[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (!section) return [];
  return section[1]
    .split("\n")
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) =>
      line
        .replace(/^\d+\.\s+/, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .trim()
    );
}

export async function getToolBySlug(slug: string): Promise<ToolPageData | null> {
  const file = readToolFile(slug);
  if (!file) return null;
  const { data, content } = file;
  const published = new Set(getAllToolSlugs());

  const { cleanedContent, faqs } = await extractFaqs(content, published);
  const contentHtml = unlinkUnpublishedGuides(await markdownToHtml(cleanedContent), published);

  const relatedSlugs: string[] = Array.isArray(data.related) ? data.related.map(String) : [];
  const related = relatedSlugs
    .filter((s) => s !== slug && published.has(s))
    .map((s) => {
      const relatedFile = readToolFile(s);
      return relatedFile ? toSummary(s, relatedFile.data) : null;
    })
    .filter((t): t is ToolSummary => Boolean(t));

  const sources: ToolSource[] = Array.isArray(data.sources)
    ? data.sources
        .filter((s: unknown): s is ToolSource => Boolean((s as ToolSource)?.name && (s as ToolSource)?.url))
        .map((s: ToolSource) => ({ name: String(s.name), url: String(s.url) }))
    : [];

  const summary = toSummary(slug, data);
  return {
    ...summary,
    metaTitle: String(data.meta_title || summary.title),
    intro: String(data.intro || summary.description),
    primaryKeyword: String(data.primary_keyword || ""),
    pageType: String(data.page_type || ""),
    countryCode: data.country_code ? String(data.country_code) : undefined,
    studio: data.studio === true,
    published: toDateString(data.published),
    lastVerified: toDateString(data.last_verified),
    sources,
    related,
    contentHtml,
    faqs,
    howToSteps: data.howto === true ? extractHowToSteps(cleanedContent) : [],
  };
}
