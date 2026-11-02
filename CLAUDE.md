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
* **Many countries, one tool:** Country sizes live in `src/config/countries.ts`. Users pick their country in the photo maker.
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
* **Fonts:** `next/font/google` (Plus Jakarta Sans for display headings, Inter for body, Geist Mono for specs)

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
* Public site theme: DaisyUI `brand` (`data-theme="brand"` on `<html>`). Bold modern SaaS look; full spec in `DESIGN.md`.
* **Primary:** `#4F46E5` (Indigo — `brand-600`), hover `#4338CA` (`brand-700`); `themeColor` `#4F46E5`
* **Ink (secondary / neutral / content):** `#0B1020` (`ink-950`)
* **Accent:** `#7C3AED` (Violet)
* **Base 100 / 200 / 300:** `#FFFFFF` / `#F5F6FB` / `#E3E5EF`
* Use the `brand-*` and `ink-*` Tailwind scales and the component classes (`.btn-brand`, `.btn-outline-brand`, `.btn-dark`, `.surface`, `.eyebrow`, `.display-1/2`, `.lead`, `.icon-tile`, `.field`) instead of raw hex or `slate-*`.
* The admin panel keeps its original lime/navy look through a separate DaisyUI theme, `admin`, applied in `src/app/admin/layout.tsx`.

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

---

## 6. SEO & International Search Strategy

### Target Keywords
1. `passport photo online`
2. `digital passport photo`
3. `visa photo maker`
4. `<country> passport photo`
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
│   ├── lib/
│   │   ├── config/pricing.ts  # Currency and plan pricing (env-driven)
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
│   │   └── site.ts            # SITE_URL, SITE_NAME, SUPPORT_EMAIL, LOGO_PATH, SITE_DISCLAIMER
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

---

## 8. Admin Panel (`/admin`)

Everything is in this app; the Python photo API is not involved (the admin panel only calls its public `/health` and `/countries` endpoints).

* **Pages:** `src/app/admin/` — `login/` plus the `(panel)/` route group, whose layout redirects to `/admin/login` without a session. Views live in `src/components/admin/views/`; shared pieces in `src/components/admin/ui.tsx`, `AdminShell.tsx` (nav filtered by role, `useAdmin()` for `can()` / `toast()`) and `charts.tsx`.
* **API:** `src/app/api/admin/*`. Wrap every handler in `adminRoute(roles, handler)` from `src/lib/admin/server.ts`: it checks the session and role, requires `X-Admin-Request: 1` on mutations, and turns `fail(status, detail)` into `{ detail }` JSON. Record every mutating action with `audit()` from `src/lib/admin/query.ts`.
* **Auth:** `admins` and `admin_sessions` collections (`src/lib/admin/db.ts`). Passwords use Node `crypto.scrypt` (`src/lib/admin/password.ts`); sessions are a random token in the HttpOnly `admin_session` cookie, stored as a SHA-256 hash with a TTL. Login is rate-limited (`admin_login_attempts`). Roles: `owner` (everything, incl. refunds and admin users), `support` (everything except refunds, admin users and the audit log), `editor` (Expert Edit queue only).
* **First admin:** `npm run create-admin` (asks for email, name and password), or `npm run create-admin you@example.com "Your Name" [owner|support|editor]`. Do not use `--email` flags through npm in PowerShell: it strips the `--` separator.
* **Order actions** (`src/lib/admin/orders.ts`) reuse the shop's pipelines: `fulfillPayment` (resend email with `notifyTeam: false`, retry fulfilment), the Razorpay SDK for refunds (per-order `refundLockAt` lock), and `sendExpertEditDeliveredEmailAction`.
* **Expert Edit:** claim → upload edited JPEG (Cloudinary `passport/expert/{resultId}_expert`) → `image.imageUrl` is replaced (the AI result stays in `expertEdit.aiImageUrl`) and a new 72-hour download token is issued.
* **User journeys:** `/api/passport-photo` logs `photo_processed` (with `metadata.resultId`) or `photo_processing_failed` via `after()` — outcome only, never the image, file name or IP. `src/lib/admin/journeys.ts` joins each upload to its order (`payments.image.resultId`) and `image_downloaded` events, for the Journeys page and the dashboard funnel. Activity logs expire after 90 days.
* **Admin theme & CSS gotcha:** `src/app/admin/layout.tsx` wraps the panel in `data-theme="admin"` (lime/navy). Under that theme `globals.css` keeps unlayered `h1`–`h4` sizes and `a { color: inherit }`, which beat Tailwind utilities and DaisyUI classes, so admin headings use the important modifier (`text-sm!`). Public pages use layered base styles, so utilities win there.
* `/admin/` is disallowed in `robots.ts` and every admin page is `noindex`. Optional env: `ADMIN_SESSION_HOURS` (default 12).

---

## 9. SEO Guide Pages (`/tool`)

* **Content:** one Markdown file per guide in `src/content/tools/<slug>.md`, served at `/tool/<slug>`. `src/lib/tools.ts` loads them (FAQ section → `FaqAccordion` + FAQPage schema; links to unpublished `/tool/...` guides render as plain text). `src/app/tool/page.tsx` is the hub; `sitemap.ts` lists every guide.
* **Plan and progress:** `seo/content-strategy.txt` (40-page plan), `seo/PROGRESS.md` (what is published, what is next, daily log), `seo/README.md` (frontmatter, writing and accuracy rules). Five pages are published per day with `/seo-daily-pages`.
* **Redirects:** `next.config.ts` skips any retired `/tool/...` redirect whose slug has a guide file. Restart `next dev` after adding a guide whose slug was previously redirected.
* **Accuracy:** the US State Department rejects photos changed with software, apps, filters or AI. Guides must not claim AI-edited photos are accepted.
