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
      className={`bg-white border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed ${className}`}
      aria-label="Official photo guidance"
    >
      <p className="flex items-start gap-2 font-semibold text-slate-900 mb-2">
        <Info className="w-4 h-4 text-[#4D7C0F] shrink-0 mt-0.5" aria-hidden="true" />
        Before you apply
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Online applications:</strong> some services ask for an uncropped photo of your
          head, shoulders and upper body and crop it themselves. Follow the upload instructions on
          the official application site.
        </li>
        <li>
          <strong>Paper forms:</strong> you usually need identical printed photos at the exact
          size, printed to a professional standard on photographic paper.
        </li>
      </ul>
      <p className="mt-2 text-slate-600">
        Photo rules change and can differ between online, paper, embassy and visa applications.
        Always check the current requirements with {authority}. {SITE_NAME} is independent and not
        affiliated with any government, passport office, embassy or consulate.
      </p>
    </aside>
  );
}
