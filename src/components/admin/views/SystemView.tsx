"use client";

import { useState } from "react";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { useAdminQuery } from "@/lib/admin/client";
import { formatMs } from "@/lib/admin/format";
import type { CountrySpec, SystemStatus } from "@/lib/admin/types";
import { ErrorAlert, KeyValues, Loading, PageHeader, Panel } from "@/components/admin/ui";

function Check({ ok, label, hint }: { ok: boolean | undefined; label: string; hint?: string }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" aria-hidden="true" />
      )}
      <span>
        <span className="font-medium">{label}</span>
        <span className="sr-only">{ok ? ": OK" : ": not working"}</span>
        {hint && <span className="block text-xs text-base-content/60">{hint}</span>}
      </span>
    </li>
  );
}

export default function SystemView() {
  const { data, error, loading, reload } = useAdminQuery<SystemStatus>("/system/status");
  const { data: countries } = useAdminQuery<{ source: "photo-api" | "site"; items: CountrySpec[] }>("/system/countries");
  const [countryFilter, setCountryFilter] = useState("");

  if (error) return <ErrorAlert error={error} onRetry={reload} />;
  if (!data) return <Loading />;

  const u = data.uploads24h;
  const filtered = (countries?.items || []).filter((c) =>
    `${c.countryName} ${c.countryCode} ${c.documentType}`.toLowerCase().includes(countryFilter.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="System"
        description="Health of the services the shop depends on."
        actions={
          <button type="button" className="btn btn-sm btn-ghost" onClick={reload} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Services">
          <ul className="space-y-2">
            <Check
              ok={data.photoApi.ok}
              label="Photo processing API"
              hint={
                data.photoApi.ok
                  ? `${data.photoApi.url} · v${data.photoApi.version} · ${data.photoApi.countriesLoaded} countries · ${data.photoApi.latencyMs} ms`
                  : `Unreachable at ${data.photoApi.url}`
              }
            />
            <Check ok={data.mongo.ok} label="MongoDB" hint={data.mongo.ok ? `${data.mongo.database} · ${data.mongo.pingMs} ms` : "Unreachable"} />
            <Check ok={data.integrations.resend} label="Resend email" hint={data.integrations.resend ? undefined : "Emails are skipped (key missing or demo)"} />
            <Check ok={data.integrations.razorpay} label="Razorpay payments and refunds" />
            <Check ok={data.integrations.razorpayWebhook} label="Razorpay webhook secret" />
            <Check ok={data.integrations.cloudinary} label="Cloudinary storage" />
          </ul>
        </Panel>

        <Panel title="Shop settings">
          <KeyValues
            rows={[
              ["Site", data.shop.siteUrl],
              ["Currency", data.shop.currency],
              ["Standard price", data.shop.standard],
              ["Expert Edit price", data.shop.expertEdit],
            ]}
          />
          <p className="mt-4 text-xs text-base-content/60">Prices come from environment variables and change on redeploy.</p>
        </Panel>

        <Panel title="Photo uploads, last 24 hours">
          {!u ? (
            <p className="text-sm text-base-content/60">Not available.</p>
          ) : u.processed + u.failed === 0 ? (
            <p className="text-sm text-base-content/60">No photos uploaded in the last 24 hours.</p>
          ) : (
            <>
              <KeyValues
                rows={[
                  ["Processed", String(u.processed)],
                  ["Failed", String(u.failed)],
                  ["Average time", formatMs(u.avgMs)],
                  ["Slowest", formatMs(u.maxMs)],
                ]}
              />
              {u.topErrors.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-base-content/60">Most common failures</p>
                  <ul className="space-y-1 text-sm">
                    {u.topErrors.map((e, i) => (
                      <li key={i} className="flex justify-between gap-4">
                        <span className="min-w-0 break-words">{e.error || "Unknown error"}</span>
                        <span className="tabular-nums text-base-content/60">{e.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </Panel>
      </div>

      <Panel
        title={`Supported countries (${countries?.items.length ?? "…"})`}
        className="mt-6"
        actions={
          <input
            type="search"
            className="input input-xs w-48"
            placeholder="Filter countries"
            aria-label="Filter countries"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          />
        }
        bodyClassName="max-h-[32rem] overflow-auto"
      >
        {!countries ? (
          <Loading />
        ) : (
          <>
            {countries.source === "site" && (
              <p className="px-4 pt-3 text-xs text-warning">Photo API unreachable, so this is the site’s own list.</p>
            )}
            <table className="table table-xs table-pin-rows">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Code</th>
                  <th>Document</th>
                  <th>Pixels</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={`${c.countryCode}-${c.documentType}`}>
                    <td>{c.countryName}</td>
                    <td className="font-mono">{c.countryCode}</td>
                    <td>{c.documentType}</td>
                    <td className="font-mono">{c.dimensions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Panel>
    </>
  );
}
