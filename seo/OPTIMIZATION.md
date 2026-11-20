# SEO guide pages: Search Console optimization

All 40 guides are published (see [PROGRESS.md](PROGRESS.md)). From 2026-11-20 the daily SEO work is optimizing existing guides against their Search Console queries: **10 pages per day**.

## Daily process

1. **Pull fresh data.** Get the last 28-30 days of Search Console data (query, and query + page) with the service account described in the session memory. Never print the key.
2. **Pick the pages.** Rank live guides by impressions and take the top 10 that have not been optimized in the last 14 days. Changes need about two weeks to show in the data. If fewer than 10 pages qualify, stop there.
3. **Compare each page with its queries.** Check the title tag, meta description, intro, H2/H3s and FAQ against the queries the page appears for.
   - Fix what is missing: answer question-style queries in a heading or FAQ, put the answer in the first sentence, and use the searcher's wording where it reads naturally.
   - Do not add another page's primary keyword or create overlap. See the cannibalization rules in the strategy.
4. **Verify anything factual you touch.** Fetch prices the same day and date them on the page. Requirements must come from official sources. If you cannot verify something, leave it out.
5. **Keep titles short.** `meta_title` must be at most **47 characters**. The template appends the site name (13 characters), and Google cuts titles at about 60.
6. **Update `last_verified`** only when the page's key facts were re-checked that day. It becomes `dateModified`.
7. **Run checks.**
   - Run the anchor check (no other page's primary keyword as link text).
   - Run `npx tsc --noEmit`.
   - Render each changed page and confirm its title and FAQ schema.
8. **Log the day below** with each page's starting impressions and position, so the effect can be measured 2-4 weeks later.

## Audit: why the guides rank low (2026-11-20)

Data: Search Console, 2026-10-21 to 2026-11-19. 2 clicks, 1,487 impressions, average position 32.6, 426 queries. URL Inspection: 37 of 50 sitemap URLs indexed.

| # | Cause | Evidence | Status |
| :-- | :--- | :--- | :--- |
| 1 | **Pages are new** | Guides were published 2026-10-16 to 2026-11-16. 13 of 50 sitemap URLs were not indexed on 2026-11-20 (8 never seen by Google, 5 discovered but not crawled). New pages' positions move a lot in their first weeks. | Sitemap resubmitted and IndexNow sent 2026-11-20. The owner should request indexing for the 13 URLs in Search Console. |
| 2 | **Low site authority against official and brand sites** | Brand and requirement queries compete with usps.com, walgreens.com, walmart.com, canada.ca, travel.state.gov and established photo sites. Navigational brand queries rank worst: Walgreens page average 80.5, Walmart 51.1. Backlinks cannot be measured through the API. | Check the Search Console Links report. Earning links (directories, partners, useful tools) is outside the guide content. |
| 3 | **Titles cut off in results** | All 10 top pages had title tags of 63-74 characters once the site name was added. | Fixed on day 1 pages (55-59 characters). README rule changed to at most 47 characters for `meta_title`. Fix the rest as each page comes up. |
| 4 | **Question queries without a direct answer** | High-impression queries are questions the pages did not answer under their own headings. Examples: "does staples do passport photos" (position 10.8), "can you get a passport at walmart", "can i return passport photos to walgreens", "how to convert physical passport photo to digital", "passport fees at post office", "24 hour passport photo". | Fixed on day 1 pages: question headings and FAQs, answer first. |
| 5 | **Price queries without the price in the snippet** | Many "post office passport photo cost" and "how much is a passport photo" queries. The meta descriptions did not state a price. | Fixed on USPS, cost, Walmart and Walgreens pages. Prices re-fetched 2026-11-20 and dated. |
| 6 | **Lost country rankings** | The old `/tool/<country>-passport-photo` URLs ranked in the top 3. Examples: France 1.0, Portugal 2.7, Bhutan 2.9, Romania 9.5. They 308-redirect to `/passport-size-photo-maker`, an unrelated page, so these rankings will likely be lost. | **Owner decision pending.** Options: redirect covered countries to the by-country guide, and add or restore the others. |
| 7 | **Weak internal linking** | The pillar `/tool/passport-photo` had no in-text links pointing to it. Some new guides had 0-1. | 36 links added 2026-11-20. Not live until pushed. |
| 8 | **Overlap on post office price queries** | "post office passport photo cost" shows both the USPS page (position about 24-35) and the cost page (about 70). | Acceptable: the brand page leads, as the strategy intends. Watch it. |
| 9 | **Page speed unknown** | The PageSpeed Insights API quota was exhausted on 2026-11-20. | Check the Core Web Vitals report or PageSpeed Insights by hand. |

## Order for the next runs (by impressions, 2026-11-20 data)

- **Day 2:** best-passport-photos, 2x2-passport-photo, passport-application-photo, take-passport-photo-with-phone, visa-photo-near-me, visa-photo, 35x45mm-passport-photo, infant-newborn-passport-photo, passport-photo-services, passport-photo-size.
- **Later:** the 20 guides with no impressions yet. Several are not indexed. For these, fix titles (at most 47 characters) and answer-first intros, then re-rank with fresh data. Day 1 pages become eligible again from 2026-12-04.

## Daily log

### Day 1 — 2026-11-20

Pages, with starting impressions / average position (2026-10-21 to 2026-11-19) and what changed. All titles were cut to at most 47 characters.

| Page | Start | Changes |
| :--- | :--- | :--- |
| usps-post-office-passport-photos | 168 / 39.2 | Title and meta lead with the $15 fee. Intro answers with the price. New FAQ "What are the passport fees at the post office?" Price dates updated to 2026-11-20. |
| digital-passport-photo | 105 / 38.9 | Title: "Digital Copy & Upload". New H2 "Can you convert a printed passport photo to digital?" (no, for US online renewal; scans are refused). H2s renamed to match "digital copy" and "electronic passport photo" queries. |
| walgreens-passport-photos | 55 / 80.5 | Meta states $16.99 and the free digital copy (2026-11-20). FAQ renamed "Can you get a passport at Walgreens?" New FAQ on returns: no published policy, so the answer says exactly that. |
| canadian-passport-photos | 53 / 72.2 | Title: "Size: 50 x 70 mm Rules". New H3 on baby and child photos (canada.ca, fetched 2026-11-20). Visa H2 renamed "Canada visitor visa photo requirements". |
| passport-photo-cost | 53 / 75.5 | New first H2 "How much is a passport photo?" with a direct answer. Prices: Walmart, USPS and Walgreens re-fetched 2026-11-20; FedEx kept at its 2026-11-11 check (its site fails to load). |
| same-day-instant-passport-photos | 46 / 42.9 | Title: "Instant & 24-Hour". New H2 "24-hour passport photos". |
| staples-passport-photos | 38 / 18.9 | H2 renamed "Does Staples do passport photos?" (query at position 10.8). Meta answers it. |
| walmart-passport-photos | 36 / 51.1 | Meta answers "does Walmart take passport photos" with the $7.64 price (2026-11-20). H2 renamed "Can you get a passport at Walmart?" The product name quote was removed (not re-verified verbatim). |
| indian-passport-photo-oci-photo | 27 / 50.7 | Title states 3.5 x 4.5 cm. FAQ renamed to the "in cm" query, with inches and pixels added. |
| schengen-eu-photo-size | 24 / 51.7 | Title uses the searched order "Schengen Visa Photo Size". It no longer contains the exact primary keyword, but the intro still does. H2 renamed for the "VFS" query. |

- **Facts fetched 2026-11-20:**
  - Walmart $7.64.
  - USPS: "$15.00 - Post Office photo fee (if needed)" and "$35.00 - Post Office acceptance fee".
  - Walgreens $16.99 with "FREE Digital copy sent via email with purchase of Passport Photo".
  - Walgreens passport policy page: no return or refund terms.
  - canada.ca child photo rules.
- **Not re-verified:** FedEx Office (header overflow error), so the cost page keeps the 2026-11-11 FedEx price with its date.
- **Measure on or after 2026-12-04:** compare each page's impressions and position with the starting figures above.
