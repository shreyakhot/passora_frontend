import { Info } from "lucide-react";
import { SITE_NAME } from "@/lib/site";

export interface OfficialPhotoNoticeProps {
  /** Country or area the photo is for, e.g. "Canada". Omit for a general notice. */
  countryName?: string;
  className?: string;
}

/**
 * Reminder shown beside the photo maker: rules vary by country and application
 * route, so applicants should confirm them with the issuing authority.
 */
export default function OfficialPhotoNotice({
  countryName,
  className = "",
}: OfficialPhotoNoticeProps) {
  const authority = countryName
    ? `the ${countryName} authority that issues your document`
    : "the authority that issues your document";

  return (
    <aside
      className={`rounded-2xl border border-ink-200 bg-ink-50 p-4 text-xs leading-relaxed text-ink-700 sm:p-5 sm:text-sm ${className}`}
      aria-label="Official photo guidance"
    >
      <p className="mb-2.5 flex items-center gap-2 font-bold text-ink-950">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700" aria-hidden="true">
          <Info className="h-3.5 w-3.5" />
        </span>
        Before you apply
      </p>
      <ul className="list-disc space-y-1 pl-5 marker:text-brand-500">
        <li>
          <strong className="text-ink-900">Online applications:</strong> some services ask for an uncropped photo of
          your head, shoulders and upper body and crop it themselves. Follow the upload instructions on the official
          application site.
        </li>
        <li>
          <strong className="text-ink-900">Paper forms:</strong> you usually need identical printed photos at the exact
          size, printed to a professional standard on photographic paper.
        </li>
      </ul>
      <p className="mt-2.5 text-ink-500">
        Photo rules change and can differ between online, paper, embassy and visa applications. Always check the current
        requirements with {authority}. {SITE_NAME} is independent and not affiliated with any government, passport
        office, embassy or consulate.
      </p>
    </aside>
  );
}
