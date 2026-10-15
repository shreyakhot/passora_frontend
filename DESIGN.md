# Photo-Govt — Design System & UI Specification (`DESIGN.md`)

## 1. Brand Identity & Design Philosophy

**Photo-Govt** (display name from `SITE_NAME` in `src/lib/site.ts`) is a passport, visa and ID photo maker for 50+ countries. Its design rests on three visual and UX pillars:
1. **Trust & Clarity:** A clean, neutral, international visual language that gives users confidence when they prepare photos for official documents. It never implies a government affiliation: the site is independent, and `SITE_DISCLAIMER` says so.
2. **Speed & Clarity:** Minimal cognitive load. Clear step-by-step guidance from choosing a country and uploading, through preview, to download and printing.
3. **Accessibility & Usability:** High contrast, legible typography, generous tap targets and full keyboard and screen-reader navigation.

Brand assets: `public/logo.jpg` (`LOGO_PATH`) for the logo and default social image; `src/app/icon.jpg` and `src/app/apple-icon.jpg` for App Router icons.

---

## 2. Color Palette & Semantic Tokens

All colour tokens are managed via the CSS-first DaisyUI theme `brand` in `src/app/globals.css` (applied with `data-theme="brand"`).

### Core Palette

| Token | Hex Value | Purpose & Application |
| :--- | :--- | :--- |
| `--color-primary` | `#65A30D` | Primary brand colour (`lime-600`), active state indicators, key links |
| `.btn-primary` | `#4D7C0F` → `#3F650C` hover → `#365314` active | Primary CTA buttons (`lime-700` base for AA contrast with white text) |
| `--color-primary-content` | `#FFFFFF` | Text/icons on primary backgrounds |
| `--color-secondary` | `#0F172A` | Deep navy (`slate-900`) for high-contrast headers, footer background, bold typography |
| `--color-secondary-content`| `#FFFFFF` | Text/icons on secondary/dark backgrounds |
| `--color-accent` | `#0F766E` | Deep teal (`teal-700`) for badges, trust indicators, secondary highlights |
| `--color-accent-content` | `#FFFFFF` | Text on accent backgrounds |
| `--color-neutral` | `#0F172A` | Neutral dark accents |
| `--color-neutral-content` | `#FFFFFF` | Text on neutral backgrounds |

`themeColor` in the root layout metadata is `#4D7C0F`.

### Surface & Base Colors

| Token | Hex Value | Application |
| :--- | :--- | :--- |
| `--color-base-100` | `#FFFFFF` | Main page background, modal surfaces, primary card backgrounds |
| `--color-base-200` | `#F8FAFC` | Light slate surface for alternating sections (e.g. photo studio, How It Works) |
| `--color-base-300` | `#E2E8F0` | Subtle borders, dividers, disabled states |
| `--color-base-content` | `#0F172A` | Primary body text colour (maximum contrast on base-100) |

### Feedback & Status Tokens

| Token | Hex Value | Application |
| :--- | :--- | :--- |
| `--color-info` | `#0284C7` | Information alerts, helpful hints, tooltips |
| `--color-success` | `#15803D` | Validated photo indicator, success alerts, checkmarks |
| `--color-warning` | `#D97706` | Lighting warnings, dimension caution alerts |
| `--color-error` | `#DC2626` | File format errors, processing errors |

### Radii

`--radius-btn: 0.75rem`, `--radius-box: 1rem`, `--radius-field: 0.75rem`.

---

## 3. Typography Scale & Hierarchy

We use **Geist Sans** for clean geometric clarity and **Geist Mono** for technical/dimension indicators.

| Level | Desktop Size / Leading | Mobile Size / Leading | Weight | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Hero H1** | `3.25rem` (52px) / `1.15` | `2.5rem` (40px) / `1.2` | Bold (`700`) | `-0.02em` |
| **Section H2**| `2.5rem` (40px) / `1.2` | `2.0rem` (32px) / `1.25` | Bold (`700`) | `-0.01em` |
| **Card H3** | `1.75rem` (28px) / `1.25` | `1.5rem` (24px) / `1.3` | Bold (`700`) | `0` |
| **Subhead H4**| `1.125rem` (18px) / `1.4` | `1.125rem` (18px) / `1.4` | SemiBold (`600`) | `0` |
| **Body (Lead)**| `1.125rem` (18px) / `1.6` | `1.0rem` (16px) / `1.5` | Regular (`400`) | `0` |
| **Body (Base)**| `1.0rem` (16px) / `1.6` | `1.0rem` (16px) / `1.6` | Regular (`400`) | `0` |
| **Caption** | `0.875rem` (14px) / `1.4` | `0.875rem` (14px) / `1.4` | Regular (`400`) | `0` |
| **Mono Specs**| `0.8125rem` (13px) / `1.2` | `0.8125rem` (13px) / `1.2` | Medium (`500`) | `0` |

---

## 4. Spacing, Elevation & Layout Grid

### Layout Dimensions
* **Max Container Width:** `80rem` (1280px) via `.container-narrow`
* **Horizontal Padding:** `--container-padding`: `1rem` mobile, `1.5rem` ≥640px, `2rem` ≥1024px
* **Section Gap:** `--section-gap` via `.section-padding`: `3.5rem` mobile, `4.5rem` ≥640px, `5.5rem` ≥1024px
* **Grid Baseline:** 8px rhythm for consistent spacing (`gap-2`, `gap-4`, `gap-6`, `gap-8`, `gap-12`)

### Elevation & Shadows
* **Flat Card Default:** `--shadow-card` via `.card-shadow`
* **Hover State:** `--shadow-card-hover` (subtle lift with a 250ms `--transition-base` transition)
* **Button States:** `.btn-primary` uses `#4D7C0F`, hover `#3F650C`, active `#365314`.
* **Interactive Focus:** `:focus-visible` ring `outline: 2px solid #4D7C0F; outline-offset: 2px;` (`#84CC16` on dark/`bg-secondary` surfaces).

---

## 5. UI Component Hierarchy & Standards

### 1. Navigation Header (`Navbar.tsx`)
* Sticky top navigation bar with a white surface and subtle border (`border-base-300`).
* Shows the brand logo (`LOGO_PATH`) with rounded corners and the `SITE_NAME` wordmark.
* Desktop links with subtle hover feedback (`btn btn-ghost btn-sm`).
* Accessible mobile toggle button with clear ARIA attributes and a dropdown drawer.

### 2. Homepage Sections (`src/app/page.tsx`)
Sections in order: `#hero`, `#studio`, `#how-it-works`, `#features`, `#trust`, `#photo-rules`, `#pricing`, `#popular-tools`, `#faq`.
* **Hero:** International headline (passport, visa and ID photos for many countries) with trust badges and a primary CTA to the studio.
* **How It Works:** Linear steps: choose your country and upload → automatic background replacement, centring and cropping to that country's size → preview, pay, download and print.
* **Features / Trust:** Card grids using Lucide icons (e.g. `Globe`, `Shield`, `Lock`, `Printer`, `Crop`, `Zap`).
* **Photo Rules:** General guidance (background, expression, lighting, accessories). Pair it with `OfficialPhotoNotice` and avoid single-country claims.
* **Pricing:** Standard and Expert Edit cards. Read prices from `getPlanPricing()`; never hardcode amounts or currency symbols.
* **Popular Tools:** Links to `POPULAR_TOOLS` country pages from `src/lib/tool-directory.ts`.
* **FAQ:** `FaqAccordion.tsx`. Answers must match the Schema.org `FAQPage` JSON-LD.

### 3. Photo Studio (`PhotoMakerStudio.tsx`)
* Country picker (defaults to the page's country, or a guess from browser locales) showing the target pixel size.
* Upload zone for JPEG, PNG and WebP (up to 20 MB). Large images are compressed client-side (`image-compress.ts`) before upload.
* Staged processing progress while `/api/passport-photo` runs, then a redirect to `/preview/[id]`.

### 4. Official Photo Notice (`OfficialPhotoNotice.tsx`)
* Info callout (Lucide `Info`) that reminds users to confirm the current photo rules with the issuing authority for the selected country. It reinforces that the site is independent.

### 5. Country Pages & Directory (`/tool`, `/tool/[slug]`)
* One generated landing page per country (`src/lib/country-pages.ts`) with a size table, steps, tips and the official-rules reminder. A Markdown file in `src/content/tools/<slug>.md` overrides the generated page.
* The `/tool` hub lists every country from `TOOL_DIRECTORY`, grouped into Passport Photos and Visa Photos, with flag emoji and pixel size.

### 6. Print Template Generator (`PrintTemplateGenerator.tsx`)
* Lays out photos on a 6×4″ (10×15 cm) sheet for home or kiosk printing.

### 7. Footer (`Footer.tsx`)
* Dark navy background (`bg-secondary text-secondary-content`) as a visual anchor.
* Brand overview (with the "not affiliated with any government" statement), link groups (Product, Popular Countries, More Countries, Company & Legal) and a copyright notice. No single-country flag or indicator.

---

## 6. Photo Size Specifications

There is no single global photo size. Each country's output size is stored in pixels (`dimensions: "widthxheight"`) in `src/config/countries.ts`. The UI shows it as `width × height px` alongside the aspect ratio. Overlays, previews and copy must use the selected country's dimensions and must not hardcode one country's millimetre spec.

Always tell users to confirm the current rules with their issuing authority, and never imply that the site is affiliated with or approved by a government.

---

## 7. Accessibility (a11y) & Motion Standards

* **WCAG 2.1 AA Compliance:** Minimum colour contrast ratio of 4.5:1 for normal text and 3:1 for large headings.
* **Touch Targets:** Minimum tap target size of `44px` (`2.75rem`) for all buttons and interactive controls.
* **Keyboard Navigation:** Clear `:focus-visible` ring (`#4D7C0F`; `#84CC16` on dark surfaces) across all interactive controls.
* **Reduced Motion:** Animations are suppressed automatically for users with `prefers-reduced-motion: reduce`.
* **Language:** The document language is `lang="en"`. Copy uses neutral international English and must not assume the user's country.
