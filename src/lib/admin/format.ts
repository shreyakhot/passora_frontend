/**
 * Admin panel — display formatting.
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  INR: "₹",
  USD: "$",
  EUR: "€",
  CAD: "CA$",
  AUD: "A$",
};

/** Amount in the smallest currency unit → "$9.99" */
export function formatMoney(subunits: number | undefined, currency: string | undefined): string {
  const value = (subunits || 0) / 100;
  const code = (currency || "").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code];
  const num = value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return symbol ? `${symbol}${num}` : `${num} ${code}`;
}

/** Compact money for axes and tiles: "$1.2K" */
export function formatMoneyCompact(subunits: number, currency: string): string {
  const value = subunits / 100;
  const code = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] ?? "";
  const num =
    value >= 1000
      ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
      : value.toLocaleString("en-US", { maximumFractionDigits: value < 10 ? 2 : 0 });
  return symbol ? `${symbol}${num}` : `${num} ${code}`;
}

export function formatNumber(n: number | undefined): string {
  return (n || 0).toLocaleString("en-US");
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string | undefined): string {
  if (!iso) return "—";
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

export function formatDuration(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatMs(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`;
}

export function planLabel(plan: string | undefined): string {
  return plan === "expert_edit" ? "Expert Edit" : "Standard";
}

const EVENT_LABELS: Record<string, string> = {
  photo_processed: "Photo uploaded",
  photo_processing_failed: "Photo upload failed",
  checkout_initiated: "Checkout started",
  razorpay_order_created: "Payment order created",
  payment_success: "Payment completed",
  payment_failed: "Payment failed",
  image_downloaded: "Photo downloaded",
  download_link_expired: "Expired download link used",
  expert_edit_delivered: "Expert Edit delivered",
};

/** Readable name for an activity event */
export function eventLabel(event: string): string {
  return EVENT_LABELS[event] || humanize(event);
}

export function humanize(value: string | undefined): string {
  if (!value) return "—";
  const s = value.replace(/[_.]/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
