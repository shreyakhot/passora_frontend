import type { Metadata } from "next";
import Link from "next/link";
import { Home, Camera } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page Not Found (404)",
  description: `The page you are looking for does not exist or has been moved. Create a compliant passport or visa photo online with ${SITE_NAME}.`,
  alternates: {
    canonical: undefined,
    languages: undefined,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <>
      <Navbar ctaText="Create Photo" ctaHref="/passport-size-photo-maker" />

      <main
        className="flex-1 bg-slate-50 min-h-[65vh] flex items-center justify-center py-12 px-4 sm:px-6"
        id="main-content"
      >
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-xs">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wider uppercase mb-4">
            Error 404
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Page Not Found
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed mb-8">
            The page or document you are looking for does not exist, has been moved, or the link may be outdated.
          </p>

          <div className="space-y-3">
            <Link
              href="/passport-size-photo-maker"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#4D7C0F] hover:bg-[#3F650C] !text-white text-white font-bold text-sm sm:text-base py-3.5 rounded-xl transition-colors text-center shadow-xs focus-ring"
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              <span>Create Passport Photo</span>
            </Link>

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base py-3 rounded-xl border border-slate-300 transition-colors text-center focus-ring"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Return to Homepage</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center gap-4">
            <Link
              href="/#faq"
              className="hover:text-lime-800 hover:underline transition-colors"
            >
              Help &amp; FAQ
            </Link>
            <span aria-hidden="true">•</span>
            <Link
              href="/contact-us"
              className="hover:text-lime-800 hover:underline transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

