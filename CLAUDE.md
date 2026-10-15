# Photo-Govt — AI & Engineering Guide (CLAUDE.md)

## 1. Project Overview & Mission

**Photo-Govt** (https://photo-govt.com) is a privacy-first, web-based passport, visa and ID photo maker for 50+ countries. A user picks a country and uploads a photo. The photo processing API replaces the background, scales the head and crops the image to that country's size. The user previews the result, pays, and downloads the digital file and a print-ready 6×4″ sheet.

The brand is never hardcoded. Read it from `src/lib/site.ts`:

| Export | Source | Default |
| :--- | :--- | :--- |
| `SITE_URL` | `NEXT_PUBLIC_SITE_URL` (normalised to an origin) | `https://photo-govt.com` |
| `SITE_DOMAIN` | derived from `SITE_URL` | `photo-govt.com` |
| `SITE_NAME` | `NEXT_PUBLIC_SITE_NAME` | `Photo-Govt` |
| `SUPPORT_EMAIL` | `NEXT_PUBLIC_CONTACT_EMAIL` | `support@<SITE_DOMAIN>` |
| `LOGO_PATH` / `LOGO_URL` | — | `/logo.jpg` (file: `public/logo.jpg`) |
| `SITE_DISCLAIMER` | — | "…is an independent photo service and is not affiliated with… any government, passport office, embassy or consulate." |

### Core Value Propositions
* **Many countries, one tool:** Country sizes live in `src/config/countries.ts`. Each country gets a generated landing page.
* **Privacy-first:** The processing API key stays server-side. Processing artifacts are deleted after the session. Download links expire.
* **Preview before paying:** Users see the processed photo on `/preview/[id]` before checkout.
* **Independent:** The site is not affiliated with any government. Always pair size guidance with a reminder to check the issuing authority's current rules.

---

## 2. Technology Stack

* **Framework:** Next.js 16 (App Router). See `AGENTS.md`: read `node_modules/next/dist/docs/` before relying on remembered Next.js APIs.
* **Runtime / Library:** React 19 / TypeScript 5
* **Styling Engine:** Tailwind CSS v4 + `@tailwindcss/typography`
* **UI Component Library:** DaisyUI v5 (CSS-first configuration via `@plugin "daisyui/theme"`)
* **Icons:** Lucide React (`lucide-react`)
* **Content:** `@next/mdx`; Markdown tool pages via `gray-matter` + `remark` / `remark-gfm` / `remark-html`
* **Data & Services:** MongoDB (`mongodb`), Razorpay (payments), Cloudinary (storage), Resend (email), `pdf-lib` (invoices), Zod (validation)
* **Fonts:** `next/font/google` (Geist Sans, Geist Mono)

---

## 3. Essential Commands

```bash
# Start local development server (http://localhost:3000)
npm run dev

# Run ESLint validation
npm run lint

# Compile production build
npm run build

# Run production server
npm start

# Submit URLs to IndexNow
npm run indexnow
```

---

## 4. Architectural Rules & Code Conventions

### Component Architecture
1. **Server Components by Default:** Keep layout, SEO, static copy and JSON-LD components as React Server Components.
2. **Client Components Only When Required:** Mark interactive components (e.g. `PhotoMakerStudio.tsx`, `PrintTemplateGenerator.tsx`, `ContactForm.tsx`, the `Navbar.tsx` mobile drawer) with `"use client"`.
3. **No Competing UI Libraries:** Do NOT install or introduce shadcn/ui, Material UI, Mantine, Chakra or other component libraries. Use DaisyUI and custom CSS utility classes.
4. **Semantic Color Tokens:** Never hardcode arbitrary hex colours in component classes. Use semantic tokens (`bg-base-100`, `bg-base-200`, `text-primary`, `bg-secondary`, `text-base-content`, `border-base-300`).
5. **Reusable Props & SEO Friendly:** Components export strongly typed prop interfaces and default data constants. Use semantic HTML (`<header>`, `<nav>`, `<section>`, `<article>`, `<ol>`, `<ul>`, `<figure>`, `<footer>`) and ARIA landmarks.
6. **No Hardcoded Brand:** Import `SITE_NAME`, `SITE_URL`, `SUPPORT_EMAIL`, `LOGO_PATH` and `SITE_DISCLAIMER` from `@/lib/site` instead of writing the brand, domain or support address in copy.
7. **Country-Neutral Copy:** Do not assume one country. Use the selected country's name and dimensions, and mention a specific country only as one example among several.

### Design & Styling (`src/app/globals.css`)
* Theme is configured via `@plugin "daisyui/theme"` with the custom theme name `brand` (`data-theme="brand"` on `<html>`).
* **Primary:** `#65A30D` (Lime Green — `lime-600`), hover / `themeColor` `#4D7C0F` (`lime-700`)
* **Secondary:** `#0F172A` (Deep Navy — `slate-900`)
* **Accent:** `#0F766E` (Teal — `teal-700`)
* **Neutral / Content:** `#0F172A`
* **Base 100 / 200 / 300:** `#FFFFFF` / `#F8FAFC` / `#E2E8F0`

### Image Handling & Icons
* Use `LOGO_PATH` (`/logo.jpg`, file `public/logo.jpg`) for brand logos and OpenGraph/Twitter previews. App Router icons are `src/app/icon.jpg` and `src/app/apple-icon.jpg`.
* Use the Next.js `<Image />` component with descriptive `alt` text for brand logos and visual assets.

### Pricing & Payments
* All prices come from `src/lib/config/pricing.ts` (`PRICING`, `getPlanPricing("standard" | "expert_edit")`). Never accept an amount from client input.
* Currency comes from `NEXT_PUBLIC_PAYMENT_CURRENCY` (default `USD`). Amounts come from `NEXT_PUBLIC_PAYMENT_AMOUNT` and `NEXT_PUBLIC_EXPERT_EDIT_AMOUNT`, with per-currency defaults as fallback.
* Razorpay orders: `/api/payments/create-order`, `/api/payments/verify`, `/api/payments/status/[paymentId]`; webhook: `/api/webhooks/razorpay`. Fulfilment (`src/lib/payments/fulfillment-service.ts`) stores the photo in Cloudinary, creates a 72-hour download token (`/api/download/[token]`) and sends email through Resend with a PDF invoice (`/api/invoices/[paymentId]`).

---

## 5. Country Photo Specifications

Photo sizes are per country. Each `COUNTRIES` entry in `src/config/countries.ts` has `country_code`, `country_name`, `document_type` and `dimensions` (pixel size, `"widthxheight"`, e.g. `"413x531"`). Helpers in the same file: `countryPageSlug`, `countryPagePath`, `getCountryByCode`, `getCountryByPageSlug`, `parseDimensions`, `documentLabel` (the `EU` / Schengen entry is labelled as a visa), `countryFlag`, `detectCountryFromLocales`, `DEFAULT_COUNTRY_CODE` (`US`) and `POPULAR_COUNTRY_CODES`.

Do not present any size as an official guarantee. Photo rules change and can differ between online and paper applications, embassies and visa categories. Copy must tell users to confirm the current rules with their issuing authority (`OfficialPhotoNotice.tsx` does this), and must state that the site is independent and not affiliated with any government (`SITE_DISCLAIMER`).

### Country landing pages (`/tool/[slug]`)
* `src/lib/country-pages.ts` generates one page per country at `/tool/<country>-<document>-photo` (e.g. `/tool/united-states-passport-photo`).
* `src/lib/tools.ts` merges those pages with Markdown files in `src/content/tools/<slug>.md`. A Markdown file whose slug matches a generated page overrides it.
* `src/lib/tool-directory.ts` builds the `/tool` hub (`TOOL_DIRECTORY`, grouped into Passport and Visa photos) and `POPULAR_TOOLS`.

---

## 6. SEO & International Search Strategy

### Target Keywords
1. `passport photo online`
2. `digital passport photo`
3. `visa photo maker`
4. `<country> passport photo` (one landing page per country)
5. `passport photo print template`

### Mandatory Metadata & Crawling Rules
* **Metadata Base:** Always resolve from `SITE_URL` (`NEXT_PUBLIC_SITE_URL`, default `https://photo-govt.com`). Never hardcode a domain.
* **Canonical URL:** Set per page from `SITE_URL`. Do not put a canonical in the root layout, because every page would inherit it.
* **International Targeting:** `<html lang="en">`. Do NOT add region-specific hreflang alternates (`en-<REGION>`), `geo.region` / `geo.placename` tags or a region-specific `content-language`.
* **Crawling & Indexing:**
  * `src/app/robots.ts` generates `/robots.txt`. It disallows `/preview/` and `/api/` and points to `/sitemap.xml`.
  * `src/app/sitemap.ts` generates the sitemap (static pages plus every `getAllToolSlugs()` page). **CRITICAL RULE:** Do NOT add `lastModified` or `stableLastModified` to sitemap entries. Keep entries to `{ url, changeFrequency, priority }`.
  * IndexNow: `src/lib/seo/indexnow.ts`, `/api/indexnow`, `scripts/submit-indexnow.mjs`; key file in `public/`.
* **Photo Processing API (`PHOTO_API_URL`, default `https://photo-govt.com/api`):**
  * `src/lib/passport-api.ts`: server-side client that sends `PHOTO_API_KEY` as the `X-API-Key` header.
  * `src/app/api/passport-photo/route.ts`: server-side proxy (multipart `image`, `country_code`, `document_type`) that keeps the API key out of the browser.

---

## 7. Directory Structure

```
frontend/
├── public/
│   ├── images/                # Marketing images
│   ├── logo.jpg               # Brand logo, default OG/Twitter image (LOGO_PATH)
│   └── <indexnow-key>.txt     # IndexNow key file
├── scripts/
│   └── submit-indexnow.mjs    # CLI IndexNow submission
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── contact/                # Contact form handler
│   │   │   ├── download/[token]/       # Time-limited downloads
│   │   │   ├── indexnow/               # IndexNow endpoint
│   │   │   ├── invoices/[paymentId]/   # PDF invoices
│   │   │   ├── passport-photo/route.ts # Secure proxy to PHOTO_API_URL
│   │   │   ├── payments/               # create-order, verify, status/[paymentId]
│   │   │   └── webhooks/razorpay/      # Razorpay webhook
│   │   ├── preview/[id]/      # Preview, checkout and thank-you pages
│   │   ├── tool/              # /tool hub and /tool/[slug] country pages
│   │   ├── passport-size-photo-maker/
│   │   ├── passport-photo-print-template-generator/
│   │   ├── about-us/, contact-us/, data-security-privacy-safeguards/,
│   │   │   privacy-policy/, refund-policy/, terms-of-service/
│   │   ├── apple-icon.jpg     # App Router apple touch icon
│   │   ├── globals.css        # Tailwind CSS v4, DaisyUI "brand" theme, CSS tokens
│   │   ├── icon.jpg           # App Router favicon/icon
│   │   ├── layout.tsx         # Root layout and site-wide metadata
│   │   ├── not-found.tsx
│   │   ├── page.tsx           # Homepage
│   │   ├── robots.ts          # Programmatic robots.txt
│   │   └── sitemap.ts         # Dynamic sitemap
│   ├── components/
│   │   ├── ContactForm.tsx
│   │   ├── FaqAccordion.tsx
│   │   ├── Footer.tsx         # Site footer with brand and link groups
│   │   ├── JsonLd.tsx         # Schema.org JSON-LD structured data graph
│   │   ├── Navbar.tsx         # Sticky header with brand logo & mobile menu
│   │   ├── OfficialPhotoNotice.tsx # "Confirm the rules with your issuing authority" notice
│   │   ├── PhotoMakerStudio.tsx    # Country picker, upload and processing flow
│   │   └── PrintTemplateGenerator.tsx # 6×4″ print sheet layout
│   ├── config/
│   │   ├── countries.json     # JSON copy of the country dimension data
│   │   └── countries.ts       # Typed country list, slugs and lookup utilities
│   ├── content/
│   │   └── tools/             # <slug>.md pages that override generated country pages
│   ├── lib/
│   │   ├── config/pricing.ts  # Currency and plan pricing (env-driven)
│   │   ├── country-pages.ts   # Generated content for /tool/<country>-<document>-photo
│   │   ├── db/mongodb.ts      # MongoDB client
│   │   ├── email/             # Resend client and templates
│   │   ├── invoices/          # Invoice PDF generation and service
│   │   ├── logging/           # Activity logger
│   │   ├── models/            # Payment, UserActivityLog, WebhookEvent
│   │   ├── payments/          # Razorpay client, payment and fulfilment services
│   │   ├── seo/indexnow.ts    # IndexNow helper
│   │   ├── storage/cloudinary.ts # Cloudinary storage
│   │   ├── image-compress.ts  # Client-side image compression before upload
│   │   ├── passport-api.ts    # Photo processing API client (server-only)
│   │   ├── site.ts            # SITE_URL, SITE_NAME, SUPPORT_EMAIL, LOGO_PATH, SITE_DISCLAIMER
│   │   ├── tool-directory.ts  # /tool directory and popular tools
│   │   └── tools.ts           # Loads Markdown + generated tool pages
│   └── mdx-components.tsx     # MDX typography styling bindings
├── .gitignore
├── .prettierignore            # Prettier ignore rules
├── .prettierrc                # Code formatting configuration
├── AGENTS.md                  # Next.js agent rules (auto-managed by next dev)
├── CLAUDE.md                  # Assistant and developer reference guide
├── DESIGN.md                  # Design system & visual guidelines
├── eslint.config.mjs          # ESLint rules
├── next.config.ts             # Next.js build and MDX configuration
├── package.json               # Dependencies and npm scripts
├── postcss.config.mjs         # Tailwind CSS v4 PostCSS plugin
├── README.md                  # Project documentation
└── tsconfig.json              # TypeScript strict configuration
```
