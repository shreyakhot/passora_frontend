# Photo-Govt — Passport, Visa & ID Photos Online

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-v5-570DF8?style=flat-square)](https://daisyui.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Photo-Govt** ([photo-govt.com](https://photo-govt.com)) is a privacy-first passport, visa and ID photo maker for 50+ countries. Users pick a country, upload a photo, and get a correctly sized photo with the background replaced and the face centred and cropped. They can then download the digital file and a print-ready 6×4″ sheet.

The display name and URL are not hardcoded. They come from `src/lib/site.ts` (`SITE_NAME` defaults to `Photo-Govt`, `SITE_URL` to `https://photo-govt.com`) and can be overridden with `NEXT_PUBLIC_SITE_NAME` / `NEXT_PUBLIC_SITE_URL`.

> Photo-Govt is an independent photo service and is not affiliated with, endorsed by or operated by any government, passport office, embassy or consulate.

---

## ✨ Features

* 🌍 **50+ Countries:** Each country's pixel dimensions are defined in `src/config/countries.ts`. Every country gets its own landing page at `/tool/<country>-passport-photo` (for example `/tool/united-states-passport-photo`, or `/tool/<region>-visa-photo` for visa formats such as Schengen).
* 🤖 **Automatic Formatting:** Uploaded photos go through a server-side proxy (`/api/passport-photo`) to the photo processing API. The API replaces the background, scales the head and crops to the selected country's size.
* 👀 **Preview Before Paying:** The processed result is shown on `/preview/[id]` before checkout.
* 💳 **Two Plans:** A Standard photo, or Expert Edit (the photo plus a manual review by a person). Payments go through Razorpay.
* 📧 **Delivery:** After payment, the photo is stored in Cloudinary. A time-limited download link and a PDF invoice are emailed through Resend.
* 🖨️ **Print Templates:** `/passport-photo-print-template-generator` lays photos out on a 6×4″ (10×15 cm) sheet.
* ♿ **Accessible:** Responsive layouts, semantic HTML, keyboard navigation and WCAG 2.1 AA contrast targets.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **UI Library** | [React 19](https://react.dev/) with [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + `@tailwindcss/typography` |
| **Component UI**| [DaisyUI v5](https://daisyui.com/) (CSS-first theme configuration) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Content** | MDX (`@next/mdx`) and Markdown tool pages (`gray-matter`, `remark`, `remark-gfm`, `remark-html`) |
| **Database** | MongoDB (`mongodb` driver) |
| **Payments** | Razorpay |
| **Storage** | Cloudinary |
| **Email** | Resend |
| **Invoices** | `pdf-lib` |
| **Validation** | Zod |
| **Fonts** | Geist Sans & Geist Mono via `next/font/google` |

---

## 🎨 Design System & Palette

The UI uses a custom CSS-first DaisyUI theme named `brand`, configured in `src/app/globals.css`:

* **Primary:** `#65A30D` (`lime-600`): brand colour and primary actions
* **Primary Hover / theme-color:** `#4D7C0F` (`lime-700`)
* **Secondary / Neutral / Base content:** `#0F172A` (`slate-900`): headers, footer and body text
* **Accent:** `#0F766E` (`teal-700`): badges and trust indicators
* **Base Surfaces:** `#FFFFFF` (Base 100) / `#F8FAFC` (Base 200) / `#E2E8F0` (Base 300)
* **Logo / favicon / OG image:** `public/logo.jpg` (`LOGO_PATH` in `src/lib/site.ts`)
* **Design Docs:** Full specification in [DESIGN.md](DESIGN.md)

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** v20 or higher (current LTS recommended)
* **npm:** v9.0.0 or higher (or pnpm / yarn / bun)
* Accounts and keys for MongoDB, Razorpay, Cloudinary, Resend and the photo processing API (see below)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env`** with the variables listed below.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in your browser:**
   Go to [http://localhost:3000](http://localhost:3000).

### Environment Variables

Never commit real values. `NEXT_PUBLIC_*` variables are exposed to the browser. All other variables are server-only.

| Variable | Purpose |
| :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used for metadata, sitemap, robots, emails and invoices (default `https://photo-govt.com`) |
| `NEXT_PUBLIC_SITE_NAME` | Display/brand name (default `Photo-Govt`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public support address (default `support@<site domain>`) |
| `NEXT_PUBLIC_PAYMENT_CURRENCY` | ISO 4217 currency code for checkout (default `USD`) |
| `NEXT_PUBLIC_PAYMENT_AMOUNT` | Standard plan price in major units (e.g. `9.99`) |
| `NEXT_PUBLIC_EXPERT_EDIT_AMOUNT` | Expert Edit plan price in major units (e.g. `16.99`) |
| `PHOTO_API_URL` | Base URL of the photo processing API (default `https://photo-govt.com/api`) |
| `PHOTO_API_KEY` | API key sent by the server-side proxy; never exposed to the client |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | MongoDB database name |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key ID used by Checkout |
| `RAZORPAY_KEY_SECRET` | Razorpay secret used to create and verify orders |
| `RAZORPAY_WEBHOOK_SECRET` | Secret used to verify `/api/webhooks/razorpay` signatures |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | Sender address (default `<SITE_NAME> <noreply@<site domain>>`) |
| `RESEND_REPLY_TO` | Reply-to address for outgoing email (reserved: the code currently uses `SUPPORT_EMAIL` as reply-to) |
| `RESEND_BCC_EMAIL` | Comma-separated internal BCC addresses |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional Google Analytics measurement ID (script loads only when set) |
| `NEXT_PUBLIC_CLARITY_ID` | Optional Microsoft Clarity project ID (script loads only when set) |

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js local development server with hot reloading |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Runs ESLint checks across the codebase |
| `npm run indexnow` | Submits site URLs to IndexNow (`scripts/submit-indexnow.mjs`) |

---

## 📐 Photo Sizes & Official Rules

Photo requirements differ by country and document. Each country's output size is stored as pixel dimensions (`"widthxheight"`) in `src/config/countries.ts`. Every generated country page shows that size, the aspect ratio and general guidance on background, expression and photo age.

Rules change and can differ between online and paper applications, embassies and visa categories. Users must confirm the current requirements with the authority that issues their passport, visa or ID. Photo-Govt is independent and is not affiliated with any government.

### Adding or editing a country

1. Add or update an entry in `COUNTRIES` in `src/config/countries.ts` (`country_code`, `country_name`, `document_type`, `dimensions`).
2. A landing page is generated automatically at `/tool/<country>-<document>-photo` by `src/lib/country-pages.ts` and `src/lib/tools.ts`. It is listed in the `/tool` directory (`src/lib/tool-directory.ts`) and in the sitemap.
3. To hand-write a page, add `src/content/tools/<slug>.md` with front matter. A markdown file with the same slug as a generated page replaces that page.

---

## 🔍 SEO & Technical Architecture

* **Canonical base:** Comes from `NEXT_PUBLIC_SITE_URL` (`https://photo-govt.com`) through `SITE_URL` in `src/lib/site.ts`. Canonicals are set per page.
* **International targeting:** The root layout uses `lang="en"`. The site does not use region-specific hreflang alternates (`en-<REGION>`) or country geo tags.
* **Structured Data:** JSON-LD graph (`src/components/JsonLd.tsx`) with `Organization`, `WebSite`, `WebApplication` and `FAQPage` schema types.
* **Sitemaps & Robots:** `src/app/sitemap.ts` (static pages plus every `/tool/<slug>` page) and `src/app/robots.ts` (disallows `/preview/` and `/api/`).
* **IndexNow:** `src/lib/seo/indexnow.ts`, `/api/indexnow` and `npm run indexnow`. The key file is served from `public/`.

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── images/                    # Marketing images
│   ├── logo.jpg                   # Brand logo and default OG/Twitter image
│   └── <indexnow-key>.txt         # IndexNow key file
├── scripts/
│   └── submit-indexnow.mjs        # CLI IndexNow submission
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── contact/           # Contact form handler
│   │   │   ├── download/[token]/  # Time-limited download links
│   │   │   ├── indexnow/          # IndexNow submission endpoint
│   │   │   ├── invoices/[paymentId]/ # PDF invoices
│   │   │   ├── passport-photo/    # Server-side proxy to PHOTO_API_URL
│   │   │   ├── payments/          # create-order, verify, status/[paymentId]
│   │   │   └── webhooks/razorpay/ # Razorpay webhook receiver
│   │   ├── preview/[id]/          # Result preview, checkout, thank-you page
│   │   ├── tool/                  # /tool directory hub and /tool/[slug] country pages
│   │   ├── passport-size-photo-maker/
│   │   ├── passport-photo-print-template-generator/
│   │   ├── about-us/ contact-us/ data-security-privacy-safeguards/
│   │   ├── privacy-policy/ refund-policy/ terms-of-service/
│   │   ├── apple-icon.jpg / icon.jpg # App Router icons
│   │   ├── globals.css            # Tailwind CSS v4, DaisyUI "brand" theme, tokens
│   │   ├── layout.tsx             # Root layout and site-wide metadata
│   │   ├── not-found.tsx
│   │   ├── page.tsx               # Homepage
│   │   ├── robots.ts              # Programmatic robots.txt
│   │   └── sitemap.ts             # Dynamic sitemap
│   ├── components/
│   │   ├── ContactForm.tsx
│   │   ├── FaqAccordion.tsx
│   │   ├── Footer.tsx             # Site footer with brand and link groups
│   │   ├── JsonLd.tsx             # Schema.org JSON-LD structured data
│   │   ├── Navbar.tsx             # Sticky header with logo and mobile menu
│   │   ├── OfficialPhotoNotice.tsx # "Check your issuing authority's rules" notice
│   │   ├── PhotoMakerStudio.tsx   # Country picker, upload and processing flow
│   │   └── PrintTemplateGenerator.tsx # 6×4″ print sheet layout
│   ├── config/
│   │   ├── countries.json         # JSON copy of the country dimension data
│   │   └── countries.ts           # Typed country list, slugs and lookup helpers
│   ├── content/
│   │   └── tools/                 # Markdown pages that override generated /tool pages
│   ├── lib/
│   │   ├── config/pricing.ts      # Currency and plan prices (from env)
│   │   ├── country-pages.ts       # Generated content for each country page
│   │   ├── db/mongodb.ts          # MongoDB client
│   │   ├── email/                 # Resend client and email templates
│   │   ├── invoices/              # Invoice PDF generation
│   │   ├── logging/               # Activity logging
│   │   ├── models/                # Payment, UserActivityLog, WebhookEvent
│   │   ├── payments/              # Razorpay, payment and fulfilment services
│   │   ├── seo/indexnow.ts        # IndexNow helper
│   │   ├── storage/cloudinary.ts  # Cloudinary uploads
│   │   ├── image-compress.ts      # Client-side image compression
│   │   ├── passport-api.ts        # Photo processing API client (server-side)
│   │   ├── site.ts                # SITE_URL, SITE_NAME, SUPPORT_EMAIL, LOGO_PATH, SITE_DISCLAIMER
│   │   ├── tool-directory.ts      # /tool directory entries and popular tools
│   │   └── tools.ts               # Loads markdown and generated tool pages
│   └── mdx-components.tsx         # MDX typography bindings
├── AGENTS.md                      # Next.js agent rules (auto-managed by next dev)
├── CLAUDE.md                      # Assistant & engineering guide
├── DESIGN.md                      # Design system & UI specs
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## 🔒 Privacy

* The photo processing API key stays on the server. The browser only talks to `/api/passport-photo`.
* Server-side processing artifacts are deleted automatically after the session.
* Download links expire (72 hours after fulfilment). `/preview/` and `/api/` are excluded from search engines.
* Payment card details are handled by Razorpay and never touch this application.

See `/data-security-privacy-safeguards` and `/privacy-policy` for the user-facing policies.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
