# Photo-Govt — Design System & UI Specification (`DESIGN.md`)

## 1. Brand Identity & Design Philosophy

**Photo-Govt** (display name from `SITE_NAME` in `src/lib/site.ts`) is a passport, visa and ID photo maker for 50+ countries. The public site uses a **bold, modern SaaS** look: confident display type, an indigo product colour on near-black "ink" and white, generous whitespace and app-like tool surfaces.

1. **Trust & Clarity:** Clean, neutral and international. It never implies a government affiliation: the site is independent, and `SITE_DISCLAIMER` says so.
2. **Product-first:** The photo studio and print generator look like real app surfaces (header bar, numbered steps, elevated card), not like forms dropped onto a marketing page.
3. **Accessibility & Usability:** WCAG 2.1 AA contrast, ≥44px tap targets, full keyboard and screen-reader support.

Brand assets: `public/logo.jpg` (`LOGO_PATH`) for the logo and default social image; `src/app/icon.jpg` and `src/app/apple-icon.jpg` for App Router icons.

---

## 2. Colour

All tokens live in `src/app/globals.css`.

### DaisyUI theme `brand` (public site, `data-theme="brand"` on `<html>`)

| Token | Hex | Use |
| :--- | :--- | :--- |
| `--color-primary` | `#4F46E5` | Indigo. Primary actions, selected states, links (6.3:1 on white) |
| `--color-secondary` / `--color-neutral` | `#0B1020` | Ink. Headings, dark bands, footer |
| `--color-accent` | `#7C3AED` | Violet. Sparing highlights |
| `--color-base-100 / 200 / 300` | `#FFFFFF` / `#F5F6FB` / `#E3E5EF` | Page, alternate sections, borders |
| `--color-base-content` | `#0B1020` | Body text |
| `--color-info / success / warning / error` | `#2563EB` / `#047857` / `#B45309` / `#DC2626` | Feedback |

`themeColor` in the root layout is `#4F46E5`.

### Tailwind scales (`@theme`)

* `brand-50 … brand-900`: the indigo scale (`brand-600` = primary, `brand-700` = hover, `brand-50/100` = tinted fills).
* `ink-50 … ink-950`: the neutral scale (`ink-950` headings and dark bands, `ink-600` body copy, `ink-500` muted, `ink-200` borders, `ink-50/100` subtle fills).
* Use `emerald-*` for success, `amber-*` for warnings and `red-*` for errors.

Do not use raw hex, `slate-*` or `lime-*` in public components.

### DaisyUI theme `admin`

The `/admin` panel keeps its original lime/navy palette (`#65A30D` primary, `#4D7C0F` buttons, `#0F172A` navy). `src/app/admin/layout.tsx` applies it with `data-theme="admin"`. Leave it alone unless you are redesigning the admin panel on purpose.

---

## 3. Typography

| Role | Font | Notes |
| :--- | :--- | :--- |
| Display / headings | **Plus Jakarta Sans** (`font-display`, `--font-jakarta`) | `h1`–`h4` get it automatically: weight 800, tracking −0.025em, balanced wrapping |
| Body | **Inter** (`font-sans`, `--font-inter`) | 16px base, 1.6 line height |
| Specs / dimensions | **Geist Mono** (`font-mono`) | Pixel sizes, countdowns |

Scale helpers:

* `.display-1`: hero H1, `clamp(2.5rem, 6vw, 4.5rem)`, line height 1.04
* `.display-2`: section H2, `clamp(1.875rem, 4vw, 3rem)`
* `.lead`: intro paragraph, 17–19px, `ink-600`
* `.marker`: highlights one word in a heading (indigo text with a soft underline bar)

Base heading styles are in `@layer base`, so Tailwind size utilities on a heading always win.

---

## 4. Layout, Surfaces & Elevation

* **Container:** `.container-narrow`, 78rem max, padding 1rem / 1.5rem / 2rem
* **Section rhythm:** `.section-padding`, 4rem / 5rem / 6.5rem
* **Section header pattern:** `.eyebrow` pill → `h2.display-2` → `p.lead`, centred (left-aligned in two-column layouts)
* **Cards:** `.surface` (white, 1px `ink-200`, 1.25rem radius); add `.surface-hover` for lift on hover. Tool surfaces use `rounded-3xl` + `shadow-lift`.
* **Dark bands:** `bg-ink-950` with `.bg-dots-dark` and a blurred `brand-600/25` glow (trust section, footer).
* **Backdrops:** `.bg-dots` (masked) and blurred `brand-200` / `violet-200` blobs in heroes. Do not put gradients on buttons or cards.
* **Shadows:** `shadow-soft` (resting), `shadow-lift` (elevated / hover / popovers), `shadow-brand` (primary button glow)
* **Icon tile:** `.icon-tile`, a 44px indigo-tinted square for Lucide icons

---

## 5. Components

### Buttons

| Class | Use |
| :--- | :--- |
| `.btn-brand` | Primary CTA (indigo, white text, glow) |
| `.btn-outline-brand` | Secondary on light surfaces |
| `.btn-dark` | Strong secondary (ink) |
| `.btn-light` | Primary on dark surfaces |
| `.btn-lg` | Larger size modifier |

All buttons are ≥44px tall, rounded 0.875rem and bold.

### Forms

`.field` for inputs, selects and textareas: 0.875rem radius, `ink-200` border, indigo focus ring.

### Navigation (`Navbar.tsx`)

Sticky, translucent white with backdrop blur that turns solid on scroll. Pill-shaped nav links (`brand-50` active state), a "Tools" dropdown (Lucide icon tiles), a compact `.btn-brand` CTA and a full-width mobile drawer below `lg`.

### Footer (`Footer.tsx`)

`ink-950` with a dotted texture: an optional CTA band (`showCta`, default on), brand column with the independence statement and support email, link groups (Product, Resources, Company) and a copyright row.

### Homepage (`src/app/page.tsx`)

Sections in order: `#hero` (copy, stats and a product visual with crop guides, scan line and floating chips, then a country strip), `#studio` (copy column + `PhotoMakerStudio`), `#how-it-works`, `#features` (bento grid, first card dark), `#trust` (dark band), `#photo-rules`, `#pricing` (Standard on dark, Expert Edit on white, prices from `getPlanPricing()`), `#faq` (sticky heading + accordion; answers must match the FAQPage JSON-LD).

### Photo Studio (`PhotoMakerStudio.tsx`)

An app-style card: header bar, then step 1 (country picker with flag tile and mono pixel size) and step 2 (drop zone with an indigo icon tile). The processing modal shows a scanning frame, a progress bar and a step list.

### FAQ (`FaqAccordion.tsx`) & Official Photo Notice (`OfficialPhotoNotice.tsx`)

FAQ items are `<details>` cards with a rotating `+` badge. The notice is an `ink-50` callout reminding users to confirm the rules with the issuing authority.

---

## 6. Photo Size Specifications

There is no single global photo size. Each country's output size is stored in pixels (`dimensions: "widthxheight"`) in `src/config/countries.ts`. The UI shows it as `width × height px`. Overlays, previews and copy must use the selected country's dimensions and must not hardcode one country's millimetre spec.

Always tell users to confirm the current rules with their issuing authority, and never imply that the site is affiliated with or approved by a government.

---

## 7. Accessibility & Motion

* **Contrast:** WCAG 2.1 AA (4.5:1 text, 3:1 large text). `brand-600` on white is 6.3:1.
* **Touch targets:** ≥44px for every interactive control.
* **Focus:** `:focus-visible` uses a 2px primary outline (`brand-300` on dark surfaces). `.focus-ring` applies it explicitly.
* **Motion:** `animate-fade-in`, `animate-float` and `animate-scan` are all disabled under `prefers-reduced-motion: reduce`.
* **Language:** `lang="en"`, neutral international English. Copy must not assume the user's country.
