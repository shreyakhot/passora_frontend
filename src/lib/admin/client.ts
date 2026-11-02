"use client";

/**
 * Admin panel — browser helpers. All calls go through the same-origin proxy
 * at /api/admin/*, which attaches the session from an HttpOnly cookie.
 */

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  json?: unknown;
  formData?: FormData;
};

function errorMessage(body: unknown, status: number): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // FastAPI validation errors
    return detail.map((d: { msg?: string }) => d.msg || "Invalid value").join(", ");
  }
  return `Request failed (HTTP ${status}).`;
}

export async function adminFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const method = options.method || (options.json || options.formData ? "POST" : "GET");
  const headers: Record<string, string> = { "X-Admin-Request": "1" };
  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  const res = await fetch(`/api/admin${path}`, { method, headers, body, cache: "no-store" });
  const data = res.headers.get("content-type")?.includes("application/json")
    ? await res.json().catch(() => null)
    : null;

  if (res.status === 401 && !path.startsWith("/auth/login")) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    // Full reload on purpose: drops all client state of the expired session
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/admin/login?next=${next}`);
  }
  if (!res.ok) throw new AdminApiError(errorMessage(data, res.status), res.status);
  return data as T;
}

/** GET `path` (null = skip). Keeps the previous data while reloading. */
export function useAdminQuery<T>(path: string | null) {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<{ key: string | null; data?: T; error?: AdminApiError }>({
    key: null,
  });
  const key = path ? `${path}#${nonce}` : null;

  useEffect(() => {
    if (!path || !key) return;
    let cancelled = false;
    adminFetch<T>(path).then(
      (data) => {
        if (!cancelled) setState({ key, data });
      },
      (err: unknown) => {
        if (cancelled) return;
        const error =
          err instanceof AdminApiError ? err : new AdminApiError("Network error. Check your connection.", 0);
        setState((prev) => ({ key, data: prev.data, error }));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [path, key]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return {
    data: state.data,
    error: state.key === key ? state.error : undefined,
    loading: key !== null && state.key !== key,
    reload,
  };
}

/**
 * Filters kept in the URL query string, so views can be shared and survive reloads.
 * Changing any filter other than `page` resets to page 1.
 */
export function useUrlFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const get = useCallback((name: string) => params.get(name) || "", [params]);

  const set = useCallback(
    (changes: Record<string, string | number | null | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(changes)) {
        if (v === null || v === undefined || v === "") next.delete(k);
        else next.set(k, String(v));
      }
      if (!("page" in changes)) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  return { get, set, query: params.toString() };
}
