"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Link2, Mail, RotateCcw, Undo2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { adminFetch, AdminApiError, useAdminQuery } from "@/lib/admin/client";
import { eventLabel, formatDateTime, formatMoney, humanize, timeAgo } from "@/lib/admin/format";
import type { OrderDetailResponse } from "@/lib/admin/types";
import {
  CopyButton,
  ErrorAlert,
  KeyValues,
  Loading,
  Modal,
  Mono,
  PageHeader,
  Panel,
  PlanBadge,
  StatusBadge,
} from "@/components/admin/ui";

type Dialog = null | "resend" | "retry" | "link" | "refund";

function errorText(err: unknown): string {
  return err instanceof AdminApiError ? err.message : "Something went wrong.";
}

function ImageTile({ src, label }: { src?: string; label: string }) {
  if (!src) return null;
  return (
    <figure className="w-36">
      <a href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-base-300 bg-base-200">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary/data URLs, admin only */}
        <img src={src} alt={label} className="aspect-[3/4] w-full object-contain" loading="lazy" />
      </a>
      <figcaption className="mt-1 text-center text-xs text-base-content/60">{label}</figcaption>
    </figure>
  );
}

export default function OrderDetailView({ paymentId }: { paymentId: string }) {
  const { can, toast } = useAdmin();
  const { data, error, reload } = useAdminQuery<OrderDetailResponse>(`/orders/${encodeURIComponent(paymentId)}`);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState("");

  // Download link dialog
  const [hours, setHours] = useState(72);
  const [newLink, setNewLink] = useState<{ downloadUrl: string; expiresAt: string } | null>(null);

  // Refund dialog
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [revokeDownload, setRevokeDownload] = useState(true);

  // Notes
  const [note, setNote] = useState("");

  if (error) return <ErrorAlert error={error} onRetry={reload} />;
  if (!data) return <Loading />;

  const { order, activity, webhooks, relatedOrders } = data;
  const isPaid = order.status === "paid";
  const refundable = order.amount - (order.refundedAmount || 0);
  const canRefund = can("owner") && (order.status === "paid" || order.status === "refunded") && refundable > 0 && !!order.razorpayPaymentId;

  function open(d: Dialog) {
    setDialogError("");
    setNewLink(null);
    if (d === "refund") {
      setRefundAmount((refundable / 100).toFixed(2));
      setRefundReason("");
      setRevokeDownload(true);
    }
    setDialog(d);
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setDialogError("");
    try {
      await action();
    } catch (err) {
      setDialogError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  const base = `/orders/${encodeURIComponent(paymentId)}`;

  const timeline = [
    ...activity.map((a) => ({
      at: a.createdAt,
      title: eventLabel(a.event),
      status: a.status,
      detail: a.metadata ? JSON.stringify(a.metadata) : "",
    })),
    ...webhooks.map((w) => ({
      at: w.createdAt,
      title: `Webhook: ${w.eventType}`,
      status: w.status,
      detail: w.eventId,
    })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <>
      <PageHeader
        title={order.email}
        description={`Order ${order.paymentId} · created ${formatDateTime(order.createdAt)}`}
        back={{ href: "/admin/orders", label: "Orders" }}
        actions={
          <>
            {isPaid && (
              <button type="button" className="btn btn-sm" onClick={() => open("resend")}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                Resend email
              </button>
            )}
            {isPaid && order.fulfillmentStatus !== "completed" && (
              <button type="button" className="btn btn-sm" onClick={() => open("retry")}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Retry fulfilment
              </button>
            )}
            {isPaid && (
              <button type="button" className="btn btn-sm" onClick={() => open("link")}>
                <Link2 className="h-4 w-4" aria-hidden="true" />
                New download link
              </button>
            )}
            {canRefund && (
              <button type="button" className="btn btn-sm btn-error btn-outline" onClick={() => open("refund")}>
                <Undo2 className="h-4 w-4" aria-hidden="true" />
                Refund
              </button>
            )}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <StatusBadge value={order.status} label={`Payment: ${humanize(order.status)}`} />
        {(isPaid || order.status === "refunded") && (
          <StatusBadge value={order.fulfillmentStatus} label={`Fulfilment: ${humanize(order.fulfillmentStatus)}`} />
        )}
        {isPaid && order.emailDelivery?.status && (
          <StatusBadge value={order.emailDelivery.status} label={`Email: ${humanize(order.emailDelivery.status)}`} />
        )}
        <PlanBadge plan={order.planType} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Photos">
            <div className="flex flex-wrap gap-4">
              <ImageTile src={order.image?.previewUrl} label="Preview" />
              <ImageTile src={order.image?.imageUrl} label={order.expertEdit?.editedImageUrl ? "Delivered (edited)" : "Full resolution"} />
              <ImageTile src={order.expertEdit?.aiImageUrl} label="AI result" />
              <ImageTile src={order.image?.originalImageUrl} label="Original upload" />
            </div>
            <p className="mt-3 text-xs text-base-content/60">
              {order.image?.dimensions && `${order.image.dimensions} px · `}
              {order.image?.format && `${order.image.format} · `}
              {order.image?.sizeKb !== undefined && `${order.image.sizeKb} KB · `}
              Result ID <Mono>{order.image?.resultId || "—"}</Mono>
            </p>
          </Panel>

          <Panel title="Payment">
            <KeyValues
              rows={[
                ["Amount", formatMoney(order.amount, order.currency)],
                ...(order.refundedAmount
                  ? ([["Refunded", formatMoney(order.refundedAmount, order.currency)]] as [string, string][])
                  : []),
                ["Paid", formatDateTime(order.paidAt)],
                ["Product", order.productType || "—"],
                ["Razorpay order", order.razorpayOrderId ? <Mono>{order.razorpayOrderId}</Mono> : "—"],
                ["Razorpay payment", order.razorpayPaymentId ? <Mono>{order.razorpayPaymentId}</Mono> : "—"],
                [
                  "Invoice",
                  order.invoice?.invoiceNumber ? (
                    <span className="flex flex-wrap gap-x-3">
                      <span>#{order.invoice.invoiceNumber}</span>
                      {isPaid && (
                        <a className="link inline-flex items-center gap-1" href={`/api/invoices/${order.paymentId}`} target="_blank" rel="noopener noreferrer">
                          Web <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                      {order.invoice.invoicePdfUrl && (
                        <a className="link inline-flex items-center gap-1" href={order.invoice.invoicePdfUrl} target="_blank" rel="noopener noreferrer">
                          PDF <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                    </span>
                  ) : (
                    "—"
                  ),
                ],
              ]}
            />
          </Panel>

          <Panel title="Delivery">
            <KeyValues
              rows={[
                ["Email", order.emailDelivery?.status ? humanize(order.emailDelivery.status) : "—"],
                ["Attempts", String(order.emailDelivery?.attempts ?? 0)],
                ["Sent", formatDateTime(order.emailDelivery?.sentAt)],
                ...(order.emailDelivery?.lastError
                  ? ([["Last error", <span key="e" className="text-error">{order.emailDelivery.lastError}</span>]] as [string, React.ReactNode][])
                  : []),
                [
                  "Download link",
                  order.downloadUrl ? (
                    <span className="flex items-center gap-1">
                      <Mono>{order.downloadUrl}</Mono>
                      <CopyButton value={order.downloadUrl} label="Copy download link" />
                    </span>
                  ) : (
                    "None"
                  ),
                ],
                [
                  "Link expires",
                  order.downloadTokenExpiresAt
                    ? `${formatDateTime(order.downloadTokenExpiresAt)} (${new Date(order.downloadTokenExpiresAt) < new Date() ? "expired" : "active"})`
                    : "—",
                ],
              ]}
            />
            {order.downloadUrl && (
              <button
                type="button"
                className="btn btn-ghost btn-xs mt-3 text-error"
                onClick={() =>
                  run(async () => {
                    await adminFetch(`${base}/revoke-download`, { method: "POST" });
                    toast("Download link revoked.");
                    reload();
                  })
                }
                disabled={busy}
              >
                Revoke download link
              </button>
            )}
          </Panel>

          <Panel title="Timeline">
            {timeline.length === 0 ? (
              <p className="text-sm text-base-content/60">No events recorded.</p>
            ) : (
              <ol className="space-y-3">
                {timeline.map((t, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-base-content/30" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{t.title}</span>
                        <StatusBadge value={t.status} />
                        <span className="text-xs text-base-content/60">{formatDateTime(t.at)}</span>
                      </p>
                      {t.detail && <p className="mt-0.5 truncate font-mono text-[11px] text-base-content/50" title={t.detail}>{t.detail}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Customer">
            <KeyValues
              rows={[
                [
                  "Email",
                  <Link key="c" href={`/admin/customers/${encodeURIComponent(order.email)}`} className="link">
                    {order.email}
                  </Link>,
                ],
                ["Country", order.metadata?.countryName || order.metadata?.countryCode || "—"],
                ["Browser", <span key="ua" className="text-xs font-normal">{order.metadata?.userAgent || "—"}</span>],
              ]}
            />
            {relatedOrders.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase text-base-content/60">Other orders</p>
                <ul className="space-y-1 text-sm">
                  {relatedOrders.map((r) => (
                    <li key={r.paymentId} className="flex items-center justify-between gap-2">
                      <Link href={`/admin/orders/${r.paymentId}`} className="link link-hover">
                        {formatMoney(r.amount, r.currency)} · {timeAgo(r.createdAt)}
                      </Link>
                      <StatusBadge value={r.status} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>

          {order.planType === "expert_edit" && (
            <Panel
              title="Expert Edit"
              actions={
                isPaid && (
                  <Link href={`/admin/expert/${order.paymentId}`} className="link text-sm">
                    Open in queue
                  </Link>
                )
              }
            >
              <KeyValues
                rows={[
                  ["Status", <StatusBadge key="s" value={order.expertReviewStatus || "pending"} />],
                  ["Editor", order.expertEdit?.assignee?.name || "Unassigned"],
                  ["Claimed", formatDateTime(order.expertEdit?.claimedAt)],
                  ["Delivered", formatDateTime(order.expertEdit?.deliveredAt)],
                  ["Customer emailed", formatDateTime(order.expertEdit?.emailedAt)],
                ]}
              />
            </Panel>
          )}

          {!!order.refunds?.length && (
            <Panel title="Refunds">
              <ul className="space-y-3 text-sm">
                {order.refunds.map((r, i) => (
                  <li key={r.refundId || i}>
                    <p className="flex items-center justify-between gap-2">
                      <span className="font-medium">{formatMoney(r.amount, r.currency)}</span>
                      <StatusBadge value={r.status} />
                    </p>
                    <p className="text-base-content/70">{r.reason}</p>
                    <p className="text-xs text-base-content/60">
                      {r.adminName} · {formatDateTime(r.createdAt)} · <Mono>{r.refundId}</Mono>
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="Internal notes">
            {order.adminNotes?.length ? (
              <ul className="mb-4 space-y-3 text-sm">
                {order.adminNotes.map((n) => (
                  <li key={n.id}>
                    <p className="whitespace-pre-wrap">{n.text}</p>
                    <p className="text-xs text-base-content/60">
                      {n.adminName} · {formatDateTime(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-3 text-sm text-base-content/60">No notes yet. Customers never see these.</p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                run(async () => {
                  await adminFetch(`${base}/notes`, { json: { text: note } });
                  setNote("");
                  reload();
                });
              }}
            >
              <label htmlFor="order-note" className="sr-only">
                Add a note
              </label>
              <textarea
                id="order-note"
                className="textarea textarea-sm w-full"
                rows={2}
                maxLength={2000}
                placeholder="Add a note for the team"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button type="submit" className="btn btn-sm mt-2" disabled={busy || !note.trim()}>
                Add note
              </button>
            </form>
          </Panel>
        </div>
      </div>

      {/* ─── Dialogs ─── */}

      <Modal
        open={dialog === "resend"}
        title="Resend the customer email?"
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await adminFetch(`${base}/resend-email`, { method: "POST" });
                  toast(`Email sent to ${order.email}.`);
                  setDialog(null);
                  reload();
                })
              }
            >
              {busy ? "Sending…" : "Send email"}
            </button>
          </>
        }
      >
        <p className="text-sm">
          Sends the payment confirmation again to <strong>{order.email}</strong>, with the invoice PDF and a download link. A link that has expired is replaced with a new 72-hour one.
        </p>
        {dialogError && <p className="mt-3 text-sm text-error">{dialogError}</p>}
      </Modal>

      <Modal
        open={dialog === "retry"}
        title="Retry fulfilment?"
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await adminFetch(`${base}/retry-fulfillment`, { method: "POST" });
                  toast("Fulfilment completed.");
                  setDialog(null);
                  reload();
                })
              }
            >
              {busy ? "Running…" : "Retry"}
            </button>
          </>
        }
      >
        <p className="text-sm">
          Runs the fulfilment steps that have not finished yet: invoice, download link and customer email. Steps that already ran are skipped, so the customer is not emailed twice.
        </p>
        {dialogError && <p className="mt-3 text-sm text-error">{dialogError}</p>}
      </Modal>

      <Modal
        open={dialog === "link"}
        title="New download link"
        onClose={() => setDialog(null)}
        footer={
          newLink ? (
            <button type="button" className="btn" onClick={() => setDialog(null)}>
              Done
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setDialog(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const res = await adminFetch<{ downloadUrl: string; expiresAt: string }>(`${base}/download-link`, {
                      json: { hours },
                    });
                    setNewLink(res);
                    reload();
                  })
                }
              >
                Create link
              </button>
            </>
          )
        }
      >
        {newLink ? (
          <div className="space-y-2 text-sm">
            <p>Send this link to the customer. It expires {formatDateTime(newLink.expiresAt)}.</p>
            <div className="flex items-center gap-1 rounded-lg bg-base-200 p-2">
              <Mono>{newLink.downloadUrl}</Mono>
              <CopyButton value={newLink.downloadUrl} label="Copy link" />
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <p>Creates a new link and stops the current one from working. No email is sent.</p>
            <label className="flex items-center gap-2">
              Valid for
              <select className="select select-sm w-auto" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                <option value={24}>24 hours</option>
                <option value={72}>72 hours</option>
                <option value={168}>7 days</option>
                <option value={720}>30 days</option>
              </select>
            </label>
          </div>
        )}
        {dialogError && <p className="mt-3 text-sm text-error">{dialogError}</p>}
      </Modal>

      <Modal
        open={dialog === "refund"}
        title="Refund through Razorpay"
        onClose={() => setDialog(null)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-error"
              disabled={busy || refundReason.trim().length < 3 || !(Number(refundAmount) > 0)}
              onClick={() =>
                run(async () => {
                  const subunits = Math.round(Number(refundAmount) * 100);
                  await adminFetch(`${base}/refund`, {
                    json: {
                      amount: subunits === refundable ? null : subunits,
                      reason: refundReason.trim(),
                      revokeDownload,
                    },
                  });
                  toast(`Refunded ${formatMoney(subunits, order.currency)}.`);
                  setDialog(null);
                  reload();
                })
              }
            >
              {busy ? "Refunding…" : `Refund ${formatMoney(Math.round(Number(refundAmount) * 100) || 0, order.currency)}`}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div role="alert" className="alert alert-warning alert-soft">
            This sends real money back to the customer and cannot be undone.
          </div>
          <label className="block">
            <span className="mb-1 block font-medium">Amount ({order.currency})</span>
            <input
              type="number"
              className="input w-full"
              min={0.01}
              max={refundable / 100}
              step={0.01}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
            <span className="mt-1 block text-xs text-base-content/60">
              Up to {formatMoney(refundable, order.currency)} can be refunded.
            </span>
          </label>
          <label className="block">
            <span className="mb-1 block font-medium">Reason</span>
            <textarea
              className="textarea w-full"
              rows={2}
              maxLength={500}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Photo rejected by the passport office"
            />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="checkbox checkbox-sm" checked={revokeDownload} onChange={(e) => setRevokeDownload(e.target.checked)} />
            Revoke the download link after a full refund
          </label>
        </div>
        {dialogError && <p className="mt-3 text-sm text-error">{dialogError}</p>}
      </Modal>
    </>
  );
}
