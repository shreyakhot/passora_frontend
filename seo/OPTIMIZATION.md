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
9. **Ask Google to recrawl after the push.** In Search Console, use URL Inspection, then **Request indexing**, for each page changed that day; the API cannot do this. The sitemap has no `lastmod` by design, so Google gets no other signal that a page changed. Measure each page from its next crawl date (the "last crawl" in URL Inspection), not from the edit date.

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

### Audit update (2026-11-23)

Data: Search Console, 2026-10-24 to 2026-11-22. 2 clicks, 2,001 impressions, average position 33.9, 541 queries. Impressions rose from about 60 a day in early November to 181 on 2026-11-21 and 239 on 2026-11-22.

| # | Finding | Evidence | Status |
| :-- | :--- | :--- | :--- |
| 1 | **Indexing mostly fixed** | 11 of the 13 unindexed URLs were crawled on 2026-11-20 and 2026-11-21, after the sitemap was resubmitted, and are now indexed. 48 of 50 sitemap URLs are indexed. | Still "Discovered - currently not indexed": `/tool/passport-photos-near-me` and `/tool/fedex-office-passport-photos`. Request indexing for both. |
| 2 | **Edited pages not recrawled yet** | None of the 20 pages edited on day 1 and day 2 has been crawled since. Their last crawls are 2026-11-02 to 2026-11-15. Google is still ranking the old titles and text. | Request indexing for each edited page (step 9 of the process). Day 1 pages first: they carry the most impressions. |
| 3 | **Three pages rising on their own** | Last 7 days against the 7 before: USPS 88 to 309 impressions (position 52.0 to 29.4), digital 19 to 148 (58.7 to 33.2), same-day 19 to 134 (47.2 to 30.4). The pages had not been recrawled, so this is Google settling new pages, not the edits. | Watch. Their day 1 starting figures still stand as the baseline. |
| 4 | **Four brand and price pages dropped to zero** | Staples (56 impressions at about position 14 in the week of 2026-11-09), Walmart, Walgreens and the cost page have had no impressions since 2026-11-10 or 2026-11-11. All four are still indexed, with the right canonical and no crawl errors. | Not a technical fault. New pages often get a short trial in results, then drop while Google gathers signals, and these queries are dominated by the brands' own sites (audit item 2). The day 1 edits have not been crawled yet; request indexing and re-check on 2026-12-04. |
| 5 | **Old country URLs fading** | Week on week, Portugal fell from 28 impressions to 0 and Romania from 28 to 7. Their URLs redirect to the photo maker. | As predicted in audit item 6. **Owner decision still pending.** |
| 6 | **Most remaining pages have no named queries** | 4 of today's 10 pages had impressions only from anonymized queries, which Search Console does not list. | For these, fix the title length and the description only. |

## Order for the next runs (by impressions, 2026-11-20 data)

- **Day 2 (done 2026-11-21):** best-passport-photos, 2x2-passport-photo, passport-application-photo, take-passport-photo-with-phone, visa-photo-near-me, visa-photo, 35x45mm-passport-photo, infant-newborn-passport-photo, passport-photo-services, passport-photo-size.
- **Day 3 (done 2026-11-23):** the 2026-11-23 data moved the newer guides up, because they started getting impressions: other-stores-that-take-passport-photos, rite-aid-passport-photos, id-photo, uscis-immigration-photos, best-online-passport-photo-services, costco-passport-photos, passport-size-photo-near-me, print-passport-photos, passport-photo-editing-photoshop-word, biometric-passport-photo.
- **Day 4:** the last 10 guides not yet optimized. All 10 have titles over 47 characters: passport-photo, passport-photos-near-me, passport-photo-requirements, online-passport-photo-maker, passport-photographer-near-me, cvs-passport-photos, fedex-office-passport-photos, passport-photo-at-home, how-to-take-a-good-passport-photo, passport-photo-size-by-country.
- **After day 4:** no page qualifies until the 14-day wait ends. Day 1 pages are eligible again from 2026-12-04, day 2 from 2026-12-05 and day 3 from 2026-12-07. Until then, a daily run only pulls the data, checks indexing and recrawls, and logs findings; it changes no pages.

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

### Day 2 — 2026-11-21

Data: 2026-10-22 to 2026-11-20. Site: 2 clicks, 1,550 impressions, average position 32.7, 441 queries. That is almost unchanged; day 1 edits had been live less than a day. All titles were cut to at most 47 characters (51-59 with the site name).

| Page | Start | Changes |
| :--- | :--- | :--- |
| best-passport-photos | 23 / 36.0 | Title: "Best Places & Prices". FAQ renamed "Which passport photo services guarantee compliance?" (the query sits at position 5-10). It now covers online refund promises (no specifics; links to the comparison) and notes no service can guarantee acceptance. |
| 2x2-passport-photo | 10 / 39.1 | Title and meta lead with the size in cm, mm and pixels. The cm queries already rank 9-13.5. |
| passport-application-photo | 5 / 56.4 | H2 renamed "Do you need a new picture to renew your passport?" (query at position 11). The online upload H2 is now a how-to. |
| take-passport-photo-with-phone | 5 / 74.8 | Title is now exactly the primary phrase. H2 renamed "Can you take a passport photo with your phone?" Meta answers yes. |
| visa-photo-near-me | 3 / 10.3 | New H3 "Indian visa" (e-Visa square JPEG 10 KB-1 MB; VFS USA print 2 × 2 in glossy, white; facts from the India guide). FAQ renamed "Where can I get US visa photos taken?" (query at position 12). |
| visa-photo | 3 / 59.7 | Title and meta lead with the US visa photo size (2 × 2 in; DS-160 JPEG 600-1200 px, up to 240 kB). |
| 35x45mm-passport-photo | 2 / 41.5 | Meta answers cm, inches and pixels. |
| infant-newborn-passport-photo | 2 / 81.0 | Title: "Newborn Rules & Tips". |
| passport-photo-services | 1 / 100.0 | Title shortened only. Its one query, "does the dmv take passport photos", was not answered because there is no official source checked. |
| passport-photo-size | 1 / 31.0 | Meta answers the common sizes in mm and pixels. |

- No new facts or prices. Everything added comes from pages already sourced on the site.
- Low positions on this batch: very few impressions, because the pages are new and the site has little authority (audit items 1-2). The near-me visa queries (positions 7-12) are the closest to page one.

### Day 3 — 2026-11-23

Data: 2026-10-24 to 2026-11-22 (see the audit update above). Starting figures are page totals, which include anonymized queries. All titles were cut to at most 47 characters (54-60 with the site name).

| Page | Start | Changes |
| :--- | :--- | :--- |
| other-stores-that-take-passport-photos | 31 / 43.3 | Title: "Target Passport Photos, AAA Prices & Kodak". Most queries are AAA prices (positions 38-68). Meta answers "does Target do passport photos" and gives the AAA price range. H2 renamed "Does AAA take passport photos?", with "Yes" first. H3s renamed "AAA passport photo prices" and "AAA passport photo cost at other clubs". AAA Club Alliance prices re-fetched 2026-11-23, unchanged, and re-dated. |
| rite-aid-passport-photos | 20 / 28.9 | Queries ask for hours (position 8), locations, price and "rite aid print photo". New FAQ "Are there Rite Aid passport photo hours or locations?" H2 renamed "What happened to Rite Aid photo printing?", now linking the print guide. Meta names prices, hours and locations. |
| id-photo | 14 / 42.2 | Title: "ID Photo Requirements, Size & Where to Get One". New H2 "ID photo requirements", using the US rules already sourced on the requirements checklist. H2s renamed "ID photo size by document" and "How to take an ID photo" (query "how to take a id photo"). |
| uscis-immigration-photos | 10 / 57.7 | Title: "USCIS Photo Requirements: Green Card, EAD & OPT" (the searched wording). H3 renamed "EAD, OPT and STEM OPT photo requirements"; the I-765 instructions confirm the STEM extension uses that form. |
| best-online-passport-photo-services | 6 / 32.7 | Title: "Best Online Passport Photo Services Compared" (queries: "best online passport photo service"). H2 renamed "Can you do passport photos online?" Meta answers it. |
| costco-passport-photos | 5 / 25.4 | Title: "Costco Passport Photos: Photo Centers Closed". H2 renamed "Is there a Costco Photo Center near me?" (query "costco passport photo center"). Meta answers "does Costco do passport photos". |
| passport-size-photo-near-me | 5 / 8.8 | Title shortened. Meta names the sizes to ask for. Closest page to page one, with anonymized queries only. |
| print-passport-photos | 5 / 57.6 | Title shortened only (anonymized queries, none since 2026-11-10). |
| passport-photo-editing-photoshop-word | 4 / 15.0 | Title shortened only (anonymized queries). |
| biometric-passport-photo | 3 / 33.3 | Title shortened only (anonymized queries). |

- Facts fetched 2026-11-23: AAA Club Alliance passport photos: Premier free, Plus $8.99, Classic $11.99, non-members $14.99; no appointment; a digital photo is available at most locations.
- Not fetched: riteaid.com returns 403. The Rite Aid page added no new facts; the new answers restate the sourced closure.
- `last_verified` is unchanged on all 10 pages: only the AAA prices were re-checked, not each page's other key facts.
