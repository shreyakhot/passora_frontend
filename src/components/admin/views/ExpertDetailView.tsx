"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Hand, Mail, Undo2, Upload } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { adminFetch, AdminApiError, useAdminQuery } from "@/lib/admin/client";
import { formatDateTime } from "@/lib/admin/format";
import type { ExpertDetail } from "@/lib/admin/types";
import { ErrorAlert, KeyValues, Loading, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";

interface DeliverResponse {
  editedImageUrl: string;
  downloadUrl: string;
  warnings: string[];
  email: { sent: boolean; error?: string };
}

function Photo({ src, label }: { src?: string; label: string }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 text-sm font-medium">{label}</figcaption>
      {src ? (
        <a href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-base-300 bg-base-200">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary/data URLs, admin only */}
          <img src={src} alt={label} className="aspect-[3/4] w-full object-contain" />
        </a>
      ) : (
        <div className="flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-base-300 text-sm text-base-content/50">
          Not available
        </div>
      )}
    </figure>
  );
}

/** Reads width × height of a local image file before upload. */
function readDimensions(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve(`${img.naturalWidth}x${img.naturalHeight}`);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve("");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export default function ExpertDetailView({ paymentId }: { paymentId: string }) {
  const { admin, can, toast } = useAdmin();
  const { data, error, reload } = useAdminQuery<ExpertDetail>(`/expert/${encodeURIComponent(paymentId)}`);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ url: string; dims: string; kb: number } | null>(null);
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [delivered, setDelivered] = useState<DeliverResponse | null>(null);

  if (error) return <ErrorAlert error={error} onRetry={reload} />;
  if (!data) return <Loading />;

  const base = `/expert/${encodeURIComponent(paymentId)}`;
  const assignee = data.expertEdit.assignee;
  const mineOrManager = !!assignee && (assignee.id === admin.id || can("owner", "support"));

  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setActionError("");
    try {
      await fn();
    } catch (err) {
      setActionError(err instanceof AdminApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onFile(f: File | null) {
    if (fileInfo) URL.revokeObjectURL(fileInfo.url);
    setFile(f);
    setFileInfo(f ? { url: URL.createObjectURL(f), dims: await readDimensions(f), kb: Math.round(f.size / 1024) } : null);
  }

  const dimsMismatch = fileInfo?.dims && data.dimensions && fileInfo.dims !== data.dimensions;
  const tooBig = fileInfo && data.spec?.maxFileSizeKb && fileInfo.kb > data.spec.maxFileSizeKb;

  return (
    <>
      <PageHeader
        title={data.email}
        description={`${data.country.name || data.country.code || "Unknown country"} · paid ${formatDateTime(data.paidAt)}`}
        back={{ href: "/admin/expert", label: "Expert Edit queue" }}
        actions={
          can("owner", "support") && (
            <Link href={`/admin/orders/${data.paymentId}`} className="btn btn-sm">
              Order details
            </Link>
          )
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge value={data.status} label={data.status === "completed" ? "Delivered" : undefined} />
        {assignee && (
          <span className="text-sm text-base-content/70">
            Claimed by {assignee.id === admin.id ? "you" : assignee.name} · {formatDateTime(data.expertEdit.claimedAt)}
          </span>
        )}
        {data.status === "pending" && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={busy}
            onClick={() =>
              act(async () => {
                await adminFetch(`${base}/claim`, { method: "POST" });
                toast("Order claimed. It’s yours to edit.");
                reload();
              })
            }
          >
            <Hand className="h-4 w-4" aria-hidden="true" />
            Claim order
          </button>
        )}
        {data.status === "in_review" && mineOrManager && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={busy}
            onClick={() =>
              act(async () => {
                await adminFetch(`${base}/release`, { method: "POST" });
                toast("Order returned to the queue.");
                reload();
              })
            }
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            Release
          </button>
        )}
      </div>

      {actionError && (
        <div className="mb-4">
          <ErrorAlert error={actionError} />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Photos">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Photo src={data.images.original} label="Customer’s original" />
              <Photo src={data.images.ai} label="AI result" />
              {data.images.edited ? (
                <Photo src={data.images.edited} label="Delivered edit" />
              ) : (
                <Photo src={data.images.preview} label="Preview with guides" />
              )}
            </div>
            <p className="mt-3 text-xs text-base-content/60">Open any photo full size in a new tab to download it for editing.</p>
          </Panel>

          {data.status === "in_review" && mineOrManager && !delivered && (
            <Panel title="Deliver the edited photo">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!file) return;
                  act(async () => {
                    const form = new FormData();
                    form.append("image", file);
                    form.append("note", note);
                    form.append("notifyCustomer", String(notify));
                    const res = await adminFetch<DeliverResponse>(`${base}/deliver`, { formData: form });
                    setDelivered(res);
                    toast(res.email.sent ? "Delivered and emailed to the customer." : "Photo delivered.", res.email.sent ? "success" : "error");
                    reload();
                  });
                }}
              >
                <div>
                  <label htmlFor="expert-file" className="mb-1 block text-sm font-medium">
                    Edited photo (JPEG, up to 10 MB)
                  </label>
                  <input
                    id="expert-file"
                    type="file"
                    accept="image/jpeg"
                    className="file-input file-input-sm w-full max-w-md"
                    onChange={(e) => onFile(e.target.files?.[0] || null)}
                  />
                </div>

                {fileInfo && (
                  <div className="flex flex-wrap items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                    <img src={fileInfo.url} alt="Selected edited photo" className="h-40 rounded border border-base-300 object-contain" />
                    <ul className="space-y-1 text-sm">
                      <li>
                        Size: <strong>{fileInfo.dims || "unknown"} px</strong>
                        {data.dimensions && <span className="text-base-content/60"> (order: {data.dimensions})</span>}
                      </li>
                      <li>
                        File: <strong>{fileInfo.kb} KB</strong>
                        {data.spec && <span className="text-base-content/60"> (limit: {data.spec.maxFileSizeKb} KB)</span>}
                      </li>
                      {dimsMismatch && <li className="text-warning">Dimensions differ from the order.</li>}
                      {tooBig && <li className="text-warning">File is over this country’s size limit.</li>}
                    </ul>
                  </div>
                )}

                <div>
                  <label htmlFor="expert-note" className="mb-1 block text-sm font-medium">
                    Note to the customer (optional)
                  </label>
                  <textarea
                    id="expert-note"
                    className="textarea w-full"
                    rows={3}
                    maxLength={1000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. We evened out the lighting and removed a shadow behind the left shoulder."
                  />
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="checkbox checkbox-sm" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
                  Email the customer a download link
                </label>

                <button type="submit" className="btn btn-primary" disabled={busy || !file}>
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {busy ? "Uploading…" : "Deliver photo"}
                </button>
              </form>
            </Panel>
          )}

          {delivered && (
            <div role="status" className="alert alert-success alert-soft">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold">Delivered.</p>
                <p>{delivered.email.sent ? "The customer has been emailed." : `Customer not emailed${delivered.email.error ? `: ${delivered.email.error}` : "."}`}</p>
                {delivered.warnings.map((w) => (
                  <p key={w} className="text-warning">
                    {w}
                  </p>
                ))}
              </div>
            </div>
          )}

          {data.status === "completed" && (
            <Panel
              title="Delivery"
              actions={
                mineOrManager && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    disabled={busy}
                    onClick={() =>
                      act(async () => {
                        await adminFetch(`${base}/resend-delivery`, { method: "POST" });
                        toast("Delivery email sent again.");
                        reload();
                      })
                    }
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Resend email
                  </button>
                )
              }
            >
              <KeyValues
                rows={[
                  ["Delivered by", data.expertEdit.deliveredBy?.name],
                  ["Delivered", formatDateTime(data.expertEdit.deliveredAt)],
                  ["Customer emailed", formatDateTime(data.expertEdit.emailedAt)],
                  ["Edited size", data.expertEdit.dimensions ? `${data.expertEdit.dimensions} px · ${data.expertEdit.sizeKb} KB` : "—"],
                  ["Note", data.expertEdit.note || "—"],
                ]}
              />
            </Panel>
          )}
        </div>

        <Panel title={`Requirements${data.spec ? ` · ${data.spec.countryName}` : ""}`}>
          {data.spec ? (
            <KeyValues
              rows={[
                ["Size", `${data.spec.dimensions} px`],
                ["Print size", data.spec.widthMm && data.spec.heightMm ? `${data.spec.widthMm} × ${data.spec.heightMm} mm` : "—"],
                ["Max file", data.spec.maxFileSizeKb ? `${data.spec.maxFileSizeKb} KB` : "—"],
                ["Background", data.spec.background || "—"],
                ["Head height", data.spec.headHeightPct ? `${data.spec.headHeightPct[0]}–${data.spec.headHeightPct[1]}% of photo` : "—"],
                ["Eyes from bottom", data.spec.eyeFromBottomPct ? `${data.spec.eyeFromBottomPct[0]}–${data.spec.eyeFromBottomPct[1]}%` : "—"],
                ["Space above head", data.spec.topMarginMinPct !== undefined ? `at least ${data.spec.topMarginMinPct}%` : "—"],
                ["Print DPI", data.spec.printDpi ? String(data.spec.printDpi) : "—"],
              ]}
            />
          ) : (
            <p className="text-sm text-base-content/60">No spec found for this country.</p>
          )}
          <p className="mt-4 text-xs text-base-content/60">
            From the photo processing API’s country config. Rules can change, so check the issuing authority when in doubt.
          </p>
        </Panel>
      </div>
    </>
  );
}
