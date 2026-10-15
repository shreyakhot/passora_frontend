export interface CountryPassportConfig {
  country_code: string;
  country_name: string;
  document_type: string;
  dimensions: string; // "widthxheight" e.g. "600x750"
}

export const COUNTRIES: CountryPassportConfig[] = [
  {
    country_code: "DZ",
    country_name: "Algeria",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "AU",
    country_name: "Australia",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "AT",
    country_name: "Austria",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "BE",
    country_name: "Belgium",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "BT",
    country_name: "Bhutan",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "BG",
    country_name: "Bulgaria",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "CA",
    country_name: "Canada",
    document_type: "passport",
    dimensions: "1200x1800",
  },
  {
    country_code: "CN",
    country_name: "China",
    document_type: "passport",
    dimensions: "420x560",
  },
  {
    country_code: "HR",
    country_name: "Croatia",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "CZ",
    country_name: "Czechia",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "DK",
    country_name: "Denmark",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "EE",
    country_name: "Estonia",
    document_type: "passport",
    dimensions: "1300x1600",
  },
  {
    country_code: "FI",
    country_name: "Finland",
    document_type: "passport",
    dimensions: "500x653",
  },
  {
    country_code: "FR",
    country_name: "France",
    document_type: "passport",
    dimensions: "630x810",
  },
  {
    country_code: "DE",
    country_name: "Germany",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "GR",
    country_name: "Greece",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "HU",
    country_name: "Hungary",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "IN",
    country_name: "India",
    document_type: "passport",
    dimensions: "630x810",
  },
  {
    country_code: "ID",
    country_name: "Indonesia",
    document_type: "passport",
    dimensions: "400x600",
  },
  {
    country_code: "IR",
    country_name: "Iran",
    document_type: "passport",
    dimensions: "600x400",
  },
  {
    country_code: "IQ",
    country_name: "Iraq",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "IT",
    country_name: "Italy",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "JP",
    country_name: "Japan",
    document_type: "passport",
    dimensions: "827x1063",
  },
  {
    country_code: "KZ",
    country_name: "Kazakhstan",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "LV",
    country_name: "Latvia",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "LT",
    country_name: "Lithuania",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "LU",
    country_name: "Luxembourg",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "MW",
    country_name: "Malawi",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "MT",
    country_name: "Malta",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "MX",
    country_name: "Mexico",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "NP",
    country_name: "Nepal",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "NL",
    country_name: "Netherlands",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "NZ",
    country_name: "New Zealand",
    document_type: "passport",
    dimensions: "900x1200",
  },
  {
    country_code: "NI",
    country_name: "Nigeria",
    document_type: "passport",
    dimensions: "600x800",
  },
  {
    country_code: "NO",
    country_name: "Norway",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "PL",
    country_name: "Poland",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "PT",
    country_name: "Portugal",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "RO",
    country_name: "Romania",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "EU",
    country_name: "Schengen Area",
    document_type: "passport",
    dimensions: "630x810",
  },
  {
    country_code: "SG",
    country_name: "Singapore",
    document_type: "passport",
    dimensions: "400x514",
  },
  {
    country_code: "SK",
    country_name: "Slovakia",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "SI",
    country_name: "Slovenia",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "KR",
    country_name: "South Korea",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "ES",
    country_name: "Spain",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "LK",
    country_name: "Sri Lanka",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "SE",
    country_name: "Sweden",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "CHE",
    country_name: "Switzerland",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "TJ",
    country_name: "Tajikistan",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "TH",
    country_name: "Thailand",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "TR",
    country_name: "Turkey",
    document_type: "passport",
    dimensions: "591x709",
  },
  {
    country_code: "AE",
    country_name: "United Arab Emirates",
    document_type: "passport",
    dimensions: "413x531",
  },
  {
    country_code: "GB",
    country_name: "United Kingdom",
    document_type: "passport",
    dimensions: "600x750",
  },
  {
    country_code: "US",
    country_name: "United States",
    document_type: "passport",
    dimensions: "600x600",
  },
];

/** Country preselected when neither the page nor the visitor's locale picks one. */
export const DEFAULT_COUNTRY_CODE = "US";

export const DEFAULT_COUNTRY: CountryPassportConfig =
  COUNTRIES.find((c) => c.country_code === DEFAULT_COUNTRY_CODE) || COUNTRIES[0];

/** Countries featured in navigation, footers and related-tool grids. */
export const POPULAR_COUNTRY_CODES = [
  "US",
  "GB",
  "CA",
  "AU",
  "IN",
  "EU",
  "DE",
  "FR",
  "CN",
  "JP",
  "AE",
  "NZ",
];

/** Emoji flag for a 2-letter code ("EU" renders the EU flag). */
export function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/**
 * Document wording for a country. Schengen photos are for visas, even though
 * the processing API treats them as the passport format.
 */
export function documentLabel(country: CountryPassportConfig): string {
  return country.country_code === "EU" ? "visa" : country.document_type;
}

/** URL slug of a country's photo page, e.g. "united-states-passport-photo". */
export function countryPageSlug(country: CountryPassportConfig): string {
  const name = country.country_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${name}-${documentLabel(country)}-photo`;
}

export function getCountryByPageSlug(
  slug: string
): CountryPassportConfig | undefined {
  return COUNTRIES.find((c) => countryPageSlug(c) === slug);
}

/** Path of a country's photo page by country code, falling back to the hub. */
export function countryPagePath(code: string): string {
  const country = getCountryByCode(code);
  return country ? `/tool/${countryPageSlug(country)}` : "/tool";
}

/**
 * Best-effort country guess from browser locales such as "en-GB" or "fr-CA".
 * Returns undefined when no locale carries a supported region.
 */
export function detectCountryFromLocales(
  locales: readonly string[]
): CountryPassportConfig | undefined {
  for (const locale of locales) {
    const region = locale.split(/[-_]/)[1];
    const match = region ? getCountryByCode(region) : undefined;
    if (match) return match;
  }
  return undefined;
}

/**
 * Finds a country configuration by its 2-letter or 3-letter country code (case-insensitive).
 */
export function getCountryByCode(
  code: string
): CountryPassportConfig | undefined {
  if (!code) return undefined;
  const upperCode = code.trim().toUpperCase();
  return COUNTRIES.find((c) => c.country_code.toUpperCase() === upperCode);
}

/**
 * Finds a country configuration by country name (case-insensitive).
 */
export function getCountryByName(
  name: string
): CountryPassportConfig | undefined {
  if (!name) return undefined;
  const lowerName = name.trim().toLowerCase();
  return COUNTRIES.find((c) => c.country_name.toLowerCase() === lowerName);
}

/**
 * Parses a dimensions string (e.g. "600x750") into numerical width and height in pixels.
 */
export function parseDimensions(
  dimensionsStr: string
): { width: number; height: number; aspectRatio: number } | null {
  if (!dimensionsStr) return null;
  const parts = dimensionsStr.toLowerCase().split("x");
  if (parts.length !== 2) return null;

  const width = parseInt(parts[0].trim(), 10);
  const height = parseInt(parts[1].trim(), 10);

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return null;
  }

  return {
    width,
    height,
    aspectRatio: width / height,
  };
}

/**
 * Retrieves the parsed pixel dimensions for a given country code.
 */
export function getCountryDimensions(
  countryCode: string
): { width: number; height: number; aspectRatio: number } | null {
  const country = getCountryByCode(countryCode);
  if (!country) return null;
  return parseDimensions(country.dimensions);
}
