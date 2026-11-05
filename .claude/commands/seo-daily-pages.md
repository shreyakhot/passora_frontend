---
description: Write and publish the next five SEO guide pages from the content strategy
---

Publish today's five SEO guide pages in the `/tool` section.

1. Read `seo/README.md` (workflow, frontmatter, accuracy rules), `seo/PROGRESS.md` (what is done and what is next), each page's entry in `seo/content-plan-sheets.txt` (H1, supporting keywords, H2/H3 outline, cannibalization guard, keyword mapping) and the parts of `seo/content-strategy.txt` that cover the pages you are writing: the page inventory, the cannibalization rules, internal linking for their clusters, and the content standards.
2. Take the next five rows with status `todo` in `seo/PROGRESS.md`, in order. If fewer than five are left, do the rest and then follow the maintenance rules in section 11 of the strategy.
3. Open two or three published pages in `src/content/tools/` and match their structure, tone and frontmatter.
4. Verify every requirement, price and retailer fact against the official or retailer source before writing it (WebSearch/WebFetch). Leave out anything you cannot verify, or tell the reader to check it.
5. Write each page to `src/content/tools/<slug>.md`. Each page needs a unique angle, the primary keyword in the H1, title and intro, a closing FAQ, sources, and no other page's primary keyword as an anchor.
6. Run `npx tsc --noEmit` and `npx eslint src/lib/tools.ts src/app/tool`. If the dev server is running, request each new `/tool/<slug>` and confirm it returns 200.
7. Update `seo/PROGRESS.md`: mark the five rows `done` with today's date and add a dated entry to the daily log that lists facts to re-check and any open issues.
8. Report the five URLs and anything the site owner needs to decide. Do not commit unless asked.
