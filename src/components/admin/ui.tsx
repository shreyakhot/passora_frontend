"use client";

/**
 * Admin panel — shared building blocks (DaisyUI).
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Copy, Inbox, Loader2, ShieldOff } from "lucide-react";
import type { AdminApiError } from "@/lib/admin/client";
import { humanize } from "@/lib/admin/format";

// ─── Page structure ───

export interface PageHeaderProps {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
}

export function PageHeader({ title, description, back, actions }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {back && (
        <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm text-base-content/60 hover:text-base-content">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl! leading-tight! tracking-tight! font-bold break-words">{title}</h1>
          {description && <p className="mt-1 text-sm text-base-content/60">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function Panel({
  title,
  actions,
  children,
  className = "",
  bodyClassName = "p-4 sm:p-5",
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-box border border-base-300 bg-base-100 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-300 px-4 py-3 sm:px-5">
          {title && <h2 className="text-sm! leading-snug! tracking-normal! font-semibold!">{title}</h2>}
          {actions}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Two-column label/value list */
export function KeyValues({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 gap-y-2 text-sm">
      {rows.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="text-base-content/60">{k}</dt>
          <dd className="min-w-0 break-words font-medium">{v ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

// ─── States ───

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-base-content/60" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorAlert({ error, onRetry }: { error: AdminApiError | Error | string; onRetry?: () => void }) {
  const status = typeof error === "object" && "status" in error ? error.status : undefined;
  const message = typeof error === "string" ? error : error.message;
  if (status === 403) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-base-content/60">
        <ShieldOff className="h-8 w-8" aria-hidden="true" />
        <p className="font-medium text-base-content">You don’t have access to this page</p>
        <p className="text-sm">Ask an owner to change your role if you need it.</p>
      </div>
    );
  }
  return (
    <div role="alert" className="alert alert-error alert-soft">
      <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-base-content/60">
      <Inbox className="h-8 w-8" aria-hidden="true" />
      <p className="font-medium text-base-content">{title}</p>
      {hint && <p className="text-sm">{hint}</p>}
    </div>
  );
}

// ─── Badges ───

const BADGE_TONES: Record<string, string> = {
  paid: "badge-success",
  completed: "badge-success",
  sent: "badge-success",
  processed: "badge-success",
  success: "badge-success",
  active: "badge-success",
  pending: "badge-warning",
  in_review: "badge-info",
  processing: "badge-info",
  sending: "badge-info",
  authorized: "badge-info",
  failed: "badge-error",
  error: "badge-error",
  rejected: "badge-warning",
  refunded: "badge-neutral",
  cancelled: "badge-ghost",
  disabled: "badge-ghost",
};

export function StatusBadge({ value, label }: { value: string | undefined; label?: string }) {
  if (!value) return <span className="text-base-content/40">—</span>;
  const tone = BADGE_TONES[value] || "badge-ghost";
  return <span className={`badge badge-sm badge-soft whitespace-nowrap ${tone}`}>{label || humanize(value)}</span>;
}

export function PlanBadge({ plan }: { plan: string | undefined }) {
  return plan === "expert_edit" ? (
    <span className="badge badge-sm badge-accent badge-soft whitespace-nowrap">Expert Edit</span>
  ) : (
    <span className="badge badge-sm badge-ghost whitespace-nowrap">Standard</span>
  );
}

// ─── Stat tile ───

export function StatTile({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  tone?: "warning" | "error";
}) {
  const ring = tone === "error" ? "border-error/40" : tone === "warning" ? "border-warning/40" : "border-base-300";
  const body = (
    <>
      <p className="text-sm text-base-content/60">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-base-content/60">{hint}</p>}
    </>
  );
  const cls = `block rounded-box border ${ring} bg-base-100 p-4`;
  return href ? (
    <Link href={href} className={`${cls} transition hover:border-primary`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

// ─── Pagination ───

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav className="flex flex-wrap items-center justify-between gap-2 px-1 pt-4 text-sm" aria-label="Pagination">
      <span className="text-base-content/60">
        {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
      </span>
      <div className="join">
        <button
          type="button"
          className="btn btn-sm join-item"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="btn btn-sm join-item pointer-events-none">
          {page} / {pages}
        </span>
        <button
          type="button"
          className="btn btn-sm join-item"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

// ─── Copy ───

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-ghost btn-xs"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      aria-label={label}
      title={label}
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-xs break-all">{children}</span>;
}

// ─── Modal ───

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="modal" onClose={onClose} aria-labelledby="admin-modal-title">
      <div className="modal-box max-w-lg">
        <h3 id="admin-modal-title" className="text-lg! leading-snug! font-bold">
          {title}
        </h3>
        <div className="mt-4">{children}</div>
        {footer && <div className="modal-action">{footer}</div>}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" aria-label="Close">
          close
        </button>
      </form>
    </dialog>
  );
}

// ─── Filters ───

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  // Local draft so typing doesn't refetch on every key; submit on Enter or blur
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }
  return (
    <form
      role="search"
      className="w-full sm:w-72"
      onSubmit={(e) => {
        e.preventDefault();
        onChange(draft.trim());
      }}
    >
      <input
        type="search"
        className="input input-sm w-full"
        placeholder={placeholder}
        aria-label={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft.trim() !== value && onChange(draft.trim())}
      />
    </form>
  );
}

export function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      className="select select-sm w-auto"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{label}: all</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
