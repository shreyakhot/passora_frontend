import {
  COUNTRIES,
  countryPageSlug,
  documentLabel,
  getCountryByPageSlug,
  parseDimensions,
  type CountryPassportConfig,
} from "@/config/countries";
import { getPlanPricing } from "@/lib/config/pricing";
import { SITE_NAME } from "@/lib/site";

/**
 * Generated /tool/[slug] pages: one per country in src/config/countries.ts.
 * A markdown file in src/content/tools with the same slug overrides the
 * generated page, so hand-written guides can replace any country.
 */

export interface CountryPageSource {
  data: Record<string, string>;
  content: string;
}

export function getAllCountryPageSlugs(): string[] {
  return COUNTRIES.map(countryPageSlug);
}

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** "4:5" for small ratios, otherwise a decimal width/height. */
function aspectRatioLabel(width: number, height: number): string {
  const d = gcd(width, height);
  const w = width / d;
  const h = height / d;
  return w <= 20 && h <= 20 ? `${w}:${h}` : (width / height).toFixed(2);
}

function buildContent(country: CountryPassportConfig): string {
  const name = country.country_name;
  const doc = documentLabel(country);
  const Doc = titleCase(doc);
  const dims = parseDimensions(country.dimensions);
  const sizePx = dims ? `${dims.width} × ${dims.height} px` : country.dimensions;
  const ratio = dims ? aspectRatioLabel(dims.width, dims.height) : "—";
  const price = getPlanPricing("standard").amountFormatted;

  return `## ${name} ${Doc} Photo Size at a Glance

| Requirement | ${name} ${doc} photo |
| --- | --- |
| Digital size | ${sizePx} |
| Aspect ratio (width : height) | ${ratio} |
| File format | JPEG |
| Background | Plain, light and evenly lit, with no shadows or patterns |
| Expression | Neutral, mouth closed, eyes open and looking straight at the camera |
| Photo age | Recent – most authorities ask for a photo taken within the last 6 months |

## How to Make a ${name} ${Doc} Photo Online

1. **Choose ${name}.** It is preselected on this page, so the correct size loads automatically.
2. **Upload a clear photo.** Use a well-lit photo taken against a plain wall, facing the camera with your head and shoulders in frame.
3. **Let the tool format it.** Your face is centred, the head is scaled, the background is replaced and the image is cropped to ${sizePx}.
4. **Preview and download.** Check the result, then download the digital file and a print-ready 6×4″ sheet.

## Tips for a Photo That Gets Accepted

- Stand about 1–1.5 m from the camera and keep the phone at eye level.
- Face a window or soft light so both sides of your face are evenly lit.
- Remove glasses, hats and headphones unless the rules allow them (religious or medical head coverings are usually accepted).
- Keep hair away from your eyes and the edges of your face.
- Do not use filters, beauty modes or heavy editing.

## Check the Official Rules Before You Apply

Photo rules change, and they can differ between online and paper applications, embassies and visa categories. Always confirm the current requirements with the ${name} authority that issues your ${doc}. ${SITE_NAME} is an independent service and is not affiliated with any government, passport office, embassy or consulate.

## Frequently Asked Questions

### What size is a ${name} ${doc} photo?

The digital photo is sized to ${sizePx} (aspect ratio ${ratio}). The tool crops and scales your photo to these dimensions automatically.

### Can I take my ${name} ${doc} photo at home with a phone?

Yes. A recent phone photo against a plain wall in good daylight works well. Upload it and the tool handles cropping, sizing and the background.

### Does the tool change the background?

Yes. The background is replaced with a plain, light, even colour, and the head size and position are checked before you download.

### Can I print my ${name} ${doc} photo?

Yes. Every order includes a print-ready 6×4″ sheet that you can print at home or at any photo shop. You can also use the [print template generator](/passport-photo-print-template-generator).

### How much does it cost?

You can preview your photo for free. Downloading the finished digital photo and print sheet costs ${price}.
`;
}

export function getCountryPageSource(slug: string): CountryPageSource | null {
  const country = getCountryByPageSlug(slug);
  if (!country) return null;

  const name = country.country_name;
  const doc = documentLabel(country);
  const Doc = titleCase(doc);
  const dims = parseDimensions(country.dimensions);
  const sizePx = dims ? `${dims.width} × ${dims.height} px` : country.dimensions;

  return {
    data: {
      title: `${name} ${Doc} Photo Maker`,
      meta_title: `${name} ${Doc} Photo Online — Correct Size (${sizePx})`,
      meta_description: `Make a ${name} ${doc} photo online. Upload a phone photo and get it cropped to ${sizePx} with a compliant background, plus a print-ready sheet.`,
      country_code: country.country_code,
      document_type: country.document_type,
      badge: `${name} ${Doc} Photo Format`,
      hero_title: `${name} ${Doc} Photo Maker`,
      hero_subtitle: `Turn a phone photo into a ${name} ${doc} photo. The tool crops it to ${sizePx}, replaces the background and checks the framing before you download.`,
      cta_button_text: `Create My ${name} ${Doc} Photo`,
      cta_description: `Prepare your photo using ${name} ${doc} photo requirements and review it before you submit your application.`,
      dimensions_mm: sizePx,
      dimensions_px: sizePx,
      feature_image_alt: `${name} ${doc} photo example with a plain light background`,
    },
    content: buildContent(country),
  };
}
