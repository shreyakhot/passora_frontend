import {
  COUNTRIES,
  POPULAR_COUNTRY_CODES,
  countryFlag,
  countryPageSlug,
  documentLabel,
  parseDimensions,
  type CountryPassportConfig,
} from "@/config/countries";

export type ToolGroup = "Passport Photos" | "Visa Photos";

export interface ToolDirectoryEntry {
  slug: string;
  title: string;
  flag: string;
  spec: string;
  group: ToolGroup;
  countryCode: string;
}

export const TOOL_GROUPS: ToolGroup[] = ["Passport Photos", "Visa Photos"];

function toEntry(country: CountryPassportConfig): ToolDirectoryEntry {
  const doc = documentLabel(country);
  const dims = parseDimensions(country.dimensions);
  return {
    slug: countryPageSlug(country),
    title: `${country.country_name} ${doc.charAt(0).toUpperCase()}${doc.slice(1)} Photo`,
    flag: countryFlag(country.country_code),
    spec: dims ? `${dims.width}×${dims.height} px` : country.dimensions,
    group: doc === "visa" ? "Visa Photos" : "Passport Photos",
    countryCode: country.country_code,
  };
}

/** Every country's /tool/[slug] page, alphabetical. Used by the /tool hub. */
export const TOOL_DIRECTORY: ToolDirectoryEntry[] = COUNTRIES.map(toEntry).sort((a, b) =>
  a.title.localeCompare(b.title)
);

/** Featured countries, in POPULAR_COUNTRY_CODES order. Used by nav, footer and related-tool grids. */
export const POPULAR_TOOLS: ToolDirectoryEntry[] = POPULAR_COUNTRY_CODES.map((code) =>
  TOOL_DIRECTORY.find((t) => t.countryCode === code)
).filter((t): t is ToolDirectoryEntry => Boolean(t));
