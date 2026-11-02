/**
 * Admin panel — read-only calls to the photo processing API's public
 * endpoints (/health, /countries, /countries/{code}).
 */

const BASE = (process.env.PHOTO_API_URL || "https://photo-govt.com/api").replace(/\/+$/, "");

export interface CountrySpec {
  countryCode: string;
  countryName: string;
  documentType: string;
  dimensions: string;
  widthMm?: number | null;
  heightMm?: number | null;
  printDpi?: number;
  maxFileSizeKb?: number;
  background?: string;
  headHeightPct?: [number, number];
  eyeFromBottomPct?: [number, number];
  topMarginMinPct?: number;
}

async function getJson<T>(path: string, timeoutMs = 6000): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function photoApiHealth(): Promise<{
  url: string;
  ok: boolean;
  latencyMs: number | null;
  version?: string;
  countriesLoaded?: number;
}> {
  const started = Date.now();
  const data = await getJson<{ status: string; version?: string; countries_loaded?: number }>("/health");
  return {
    url: BASE,
    ok: data?.status === "healthy",
    latencyMs: data ? Date.now() - started : null,
    version: data?.version,
    countriesLoaded: data?.countries_loaded,
  };
}

interface RawConfig {
  country: { code: string; name: string };
  document_type: string;
  photo_spec?: { width_mm?: number; height_mm?: number; print_dpi?: number };
  digital_requirements?: { required_resolution_px?: { width: number; height: number }; max_file_size_kb?: number };
  background_rules?: { color?: string };
  face_constraints?: {
    head_height_pct?: { min: number; max: number };
    eye_position?: { from_bottom_pct?: { min: number; max: number } };
    top_margin_pct?: { min: number };
  };
}

/** Full spec for one country (passport first, then visa). */
export async function countrySpec(code: string | undefined): Promise<CountrySpec | null> {
  if (!code) return null;
  for (const doc of ["passport", "visa"]) {
    const c = await getJson<RawConfig>(`/countries/${encodeURIComponent(code)}?document_type=${doc}`);
    if (!c) continue;
    const px = c.digital_requirements?.required_resolution_px;
    const fc = c.face_constraints;
    return {
      countryCode: c.country.code,
      countryName: c.country.name,
      documentType: c.document_type,
      dimensions: px ? `${px.width}x${px.height}` : "",
      widthMm: c.photo_spec?.width_mm,
      heightMm: c.photo_spec?.height_mm,
      printDpi: c.photo_spec?.print_dpi,
      maxFileSizeKb: c.digital_requirements?.max_file_size_kb,
      background: c.background_rules?.color,
      headHeightPct: fc?.head_height_pct ? [fc.head_height_pct.min, fc.head_height_pct.max] : undefined,
      eyeFromBottomPct: fc?.eye_position?.from_bottom_pct
        ? [fc.eye_position.from_bottom_pct.min, fc.eye_position.from_bottom_pct.max]
        : undefined,
      topMarginMinPct: fc?.top_margin_pct?.min,
    };
  }
  return null;
}

/** Summary list of every country the photo API supports. */
export async function listCountries(): Promise<CountrySpec[] | null> {
  const rows = await getJson<{ country_code: string; country_name: string; document_type: string; dimensions: string }[]>(
    "/countries"
  );
  return rows
    ? rows
        .map((r) => ({
          countryCode: r.country_code,
          countryName: r.country_name,
          documentType: r.document_type,
          dimensions: r.dimensions,
        }))
        .sort((a, b) => a.countryName.localeCompare(b.countryName))
    : null;
}
