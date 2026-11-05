# SEO guide pages: daily workflow

The 40-page plan in [content-strategy.txt](content-strategy.txt), with per-page detail (H1, supporting keywords, H2/H3 outline, cannibalization guard, keyword-to-page mapping) in [content-plan-sheets.txt](content-plan-sheets.txt), is published five pages a day in the `/tool` section. [PROGRESS.md](PROGRESS.md) is the source of truth for what is done and what comes next. Read both before writing anything.

## Where pages live

| What | Where |
| :--- | :--- |
| Page content (one Markdown file per page) | `src/content/tools/<slug>.md` |
| Loader, link handling, FAQ parsing | `src/lib/tools.ts` |
| Page template | `src/app/tool/[slug]/page.tsx` |
| Section hub (lists every published page by cluster) | `src/app/tool/page.tsx` |
| Sitemap | `src/app/sitemap.ts` adds every published page automatically |

A page is published by adding its `.md` file. Nothing else needs registering: the route, sitemap entry and hub card come from the file. `next.config.ts` drops any old `/tool/...` redirect whose slug now has a Markdown file.

The URL is `/tool/<slug>`, where `<slug>` is the strategy slug without slashes (`/passport-photo/` → `/tool/passport-photo`).

## Daily run (five pages)

1. Open `PROGRESS.md` and take the next five rows with status `todo`, in order. Do not skip ahead or reorder.
2. For each page, check every earlier page's `primary_keyword` (the table in `PROGRESS.md`) so the new page does not target or anchor-link another page's primary term.
3. Verify facts before writing. Requirements must come from the issuing authority (State Department, USCIS, IRCC, VFS or embassy sites). Retailer facts must come from the retailer's own site. When a fact cannot be verified, leave it out or tell the reader to check, never guess. Prices: do not quote retailer prices unless verified that day; name the source and date if you do.
4. Write `src/content/tools/<slug>.md` using the frontmatter below.
5. Run `npm run lint` and `npx tsc --noEmit`. Fix anything the new pages caused.
6. Mark the rows `done` with today's date in `PROGRESS.md` and add a line to the daily log at the bottom, including facts to re-check and any open issue.

## Frontmatter

```yaml
---
title: "H1 of the page; contains the primary keyword"
meta_title: "Title tag, about 50-60 characters, contains the primary keyword"
meta_description: "About 140-160 characters"
primary_keyword: "exactly as in the strategy"
supporting_keywords: ["...", "..."]
page_number: 1            # number in the strategy's page inventory
cluster: core-local       # core-local | retailer-brands | diy-tools | size-requirements | visa-countries
page_type: "Pillar / hub" # from the strategy
hub: true                 # true only for the five cluster hubs
intro: "First paragraph shown under the H1. Contains the primary keyword."
country_code: US          # optional; default country for the studio and notice
studio: false             # true only on the money page (embeds the photo maker)
howto: false              # true on DIY guides; emits HowTo schema from the first ordered list under "## How to"
published: 2026-10-16
last_verified: 2026-10-16
sources:
  - name: "U.S. Department of State: Passport Photos"
    url: "https://travel.state.gov/en/passports/apply/help/photos.html"
related: [passport-photo-size, passport-photo-requirements] # slugs shown as cards at the end
---
```

## Body rules

- Start with `##` sections. The H1 and intro come from frontmatter, so do not repeat them.
- End with `## Frequently Asked Questions` and `###` questions. The loader turns that section into the FAQ accordion and FAQPage schema. Keep it to 4-6 questions that do not repeat the body.
- Link to other guides as `/tool/<slug>`. Links to pages that are not published yet render as plain text and become live links automatically when that page ships. So link to future pages freely, but only where the reader's need shifts.
- Anchor text describes the destination ("photo size for a Schengen visa"). Never use another page's exact primary keyword as an anchor.
- Do not add a CTA in the body. The template places the single maker CTA after the article. The money page (`studio: true`) shows the maker itself instead.
- Keep copy free of the brand name and domain. The template adds `SITE_NAME`. If the brand must appear in Markdown, write `{{SITE_NAME}}`.
- Tables use GitHub Markdown. Keep them narrow enough for a phone.

## Accuracy notes that apply to every page

- **US altered-photo rule.** The State Department says: "Do not change your photo using computer software, phone apps or filters," "We check all photos to ensure they were not digitally enhanced or altered," and "Submit the original, unchanged photo." Its pages also name artificial intelligence. Pages must not claim that an AI-edited photo is accepted for a US passport. Recommend taking the photo against a plain white or off-white background in good light, so it needs only cropping and sizing.
- **Independence.** The site is not affiliated with any government. The template shows `OfficialPhotoNotice` on every page. Never imply approval or guaranteed acceptance.
- **Retailers.** Rite Aid closed all stores (reported Oct 2025). Costco closed its in-store photo centres in 2024. Check both before writing about them.
