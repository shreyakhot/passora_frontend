import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";
import { getPlanPricing } from "@/lib/config/pricing";
import { DEFAULT_COUNTRY_CODE } from "@/config/countries";
import { getAllCountryPageSlugs, getCountryPageSource } from "@/lib/country-pages";

const TOOLS_DIRECTORY = path.join(process.cwd(), "src/content/tools");

export interface FaqItem {
  question: string;
  answer: string;
  answerHtml?: string;
}

export interface ToolPageData {
  slug: string;
  title: string;
  /** Optional <title> override; falls back to `title`. */
  meta_title?: string;
  meta_description: string;
  country_code: string;
  document_type: string;
  badge?: string;
  hero_title: string;
  hero_subtitle: string;
  studio_title?: string;
  studio_description?: string;
  cta_description?: string;
  how_it_works_title?: string;
  /** Hero button label; defaults to "Create My Passport Photo". */
  cta_button_text?: string;
  dimensions_mm: string;
  dimensions_px?: string;
  feature_image?: string;
  feature_image_alt?: string;
  price?: string;
  contentHtml: string;
  faqs?: FaqItem[];
}

function getMarkdownToolSlugs(): string[] {
  if (!fs.existsSync(TOOLS_DIRECTORY)) return [];
  const fileNames = fs.readdirSync(TOOLS_DIRECTORY);
  return fileNames
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

/** Markdown guides plus one generated page per country. */
export function getAllToolSlugs(): string[] {
  return Array.from(new Set([...getMarkdownToolSlugs(), ...getAllCountryPageSlugs()]));
}

async function parseFaqsFromMarkdown(
  rawContent: string
): Promise<{ cleanedContent: string; faqs: FaqItem[] }> {
  // Look for ## Frequently Asked Questions (or FAQ / FAQs / X. FAQs) section
  const faqHeaderRegex = /(?:^|\n)##\s+(?:(?:\d+\.\s*)?[^\n]*\b(?:Frequently Asked Questions|FAQs?)\b[^\n]*)/i;
  const match = rawContent.match(faqHeaderRegex);

  if (!match || match.index === undefined) {
    return { cleanedContent: rawContent, faqs: [] };
  }

  const startIndex = match.index;
  const afterHeaderIndex = startIndex + match[0].length;
  const restOfContent = rawContent.slice(afterHeaderIndex);

  // Find where the next top-level H2 section begins (## ), if any
  const nextH2Match = restOfContent.match(/\n##\s+[^\n]+/);
  let rawFaqBlock = "";
  let cleanedContent = "";

  if (nextH2Match && nextH2Match.index !== undefined) {
    rawFaqBlock = restOfContent.slice(0, nextH2Match.index);
    const postFaqContent = restOfContent.slice(nextH2Match.index);
    cleanedContent =
      rawContent.slice(0, startIndex).trimEnd() + "\n\n" + postFaqContent.trimStart();
  } else {
    rawFaqBlock = restOfContent;
    cleanedContent = rawContent.slice(0, startIndex).trimEnd();
  }

  // Parse questions & answers from rawFaqBlock
  // Questions start with ###
  const chunks = rawFaqBlock.split(/(?:^|\n)###\s+/);
  const faqs: FaqItem[] = [];

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const firstNewline = trimmed.indexOf("\n");
    let question = "";
    let rawAnswer = "";

    if (firstNewline === -1) {
      question = trimmed;
    } else {
      question = trimmed.slice(0, firstNewline).trim();
      rawAnswer = trimmed.slice(firstNewline).trim();
    }

    if (question) {
      // Strip leading section numbers (e.g., "4.1 ", "1. ")
      question = question.replace(/^\d+(?:\.\d+)*\s*[-–.:]?\s*/, "").trim();

      // Strip HTML comments from answer
      const cleanedAnswer = rawAnswer.replace(/<!--[\s\S]*?-->/g, "").trim();

      if (cleanedAnswer) {
        // Convert answer markdown to HTML for rich formatting / links
        const processed = await remark()
          .use(remarkGfm)
          .use(html, { sanitize: false })
          .process(cleanedAnswer);

        faqs.push({
          question,
          answer: cleanedAnswer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
          answerHtml: processed.toString().trim(),
        });
      }
    }
  }

  return { cleanedContent, faqs };
}

export async function getToolBySlug(slug: string): Promise<ToolPageData | null> {
  try {
    const fullPath = path.join(TOOLS_DIRECTORY, `${slug}.md`);
    let data: matter.GrayMatterFile<string>["data"];
    let rawContent: string;

    if (fs.existsSync(fullPath)) {
      ({ data, content: rawContent } = matter(fs.readFileSync(fullPath, "utf8")));
    } else {
      const generated = getCountryPageSource(slug);
      if (!generated) return null;
      ({ data, content: rawContent } = generated);
    }
    // Editorial HTML comments (TODOs, notes) must not ship in the page source.
    const content = rawContent.replace(/<!--[\s\S]*?-->/g, "");

    // Extract FAQs from markdown if present
    const { cleanedContent, faqs: parsedFaqs } = await parseFaqsFromMarkdown(content);

    let finalFaqs: FaqItem[] = parsedFaqs;

    // Fallback or merge with frontmatter FAQs if present
    if ((!finalFaqs || finalFaqs.length === 0) && Array.isArray(data.faqs)) {
      finalFaqs = [];
      for (const item of data.faqs) {
        if (item?.question && item?.answer) {
          const processed = await remark()
            .use(remarkGfm)
            .use(html, { sanitize: false })
            .process(item.answer);
          finalFaqs.push({
            question: item.question,
            answer: item.answer,
            answerHtml: processed.toString().trim(),
          });
        }
      }
    }

    // Process markdown with GFM (GitHub Flavored Markdown for tables, checklists, links)
    const processedContent = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: false })
      .process(cleanedContent);
    const contentHtml = processedContent.toString();

    return {
      slug,
      title: data.title || "Passport Photo Maker",
      meta_title: data.meta_title,
      meta_description:
        data.meta_description ||
        "Create passport and visa photos online, sized and checked against official photo guidance.",
      country_code: data.country_code || DEFAULT_COUNTRY_CODE,
      document_type: data.document_type || "passport",
      badge: data.badge || "Verified Biometric Standard",
      hero_title: data.hero_title || data.title || "Passport Photo Maker Online",
      hero_subtitle:
        data.hero_subtitle ||
        "Upload a photo from your phone or desktop. Our AI crops, centers, and cleans the background to meet official government standards.",
      studio_title: data.studio_title,
      studio_description: data.studio_description,
      cta_description: data.cta_description,
      how_it_works_title: data.how_it_works_title,
      cta_button_text: data.cta_button_text,
      dimensions_mm: data.dimensions_mm || "35 × 45 mm",
      dimensions_px: data.dimensions_px,
      feature_image:
        data.feature_image ||
        "https://res.cloudinary.com/dipzpwbbk/image/upload/v1790507890/uk_passport_size_photo_i5uujz.jpg",
      feature_image_alt: data.feature_image_alt,
      price: data.price || getPlanPricing("standard").amount.toFixed(2),
      contentHtml,
      faqs: finalFaqs.length > 0 ? finalFaqs : undefined,
    };
  } catch (error) {
    console.error(`Error loading tool markdown for slug "${slug}":`, error);
    return null;
  }
}
