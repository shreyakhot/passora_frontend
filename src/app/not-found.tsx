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
        className="relative flex flex-1 items-center overflow-hidden bg-white text-ink-950 min-h-[65vh]"
        id="main-content"
      >
        <div className="pointer-events-none absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-200/50 blur-3xl" aria-hidden="true" />

        <div className="container-narrow relative py-16 sm:py-24">
          <div className="mx-auto max-w-xl text-center">
            <span className="eyebrow">Error 404</span>

            <p
              className="mt-6 font-display text-[6rem] font-extrabold leading-none tracking-tighter text-ink-950 sm:text-[9rem]"
              aria-hidden="true"
            >
              4<span className="text-brand-600">0</span>4
            </p>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
              Page Not Found
            </h1>

            <p className="lead mx-auto mt-4 max-w-md">
              The page or document you are looking for does not exist, has been moved, or the link may be outdated.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/" className="btn-brand btn-lg focus-ring">
                <Home className="h-5 w-5" aria-hidden="true" />
                <span>Return to Homepage</span>
              </Link>

              <Link href="/passport-size-photo-maker" className="btn-outline-brand btn-lg focus-ring">
                <Camera className="h-5 w-5" aria-hidden="true" />
                <span>Create Passport Photo</span>
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 border-t border-ink-200 pt-6 text-sm text-ink-500">
              <Link
                href="/#faq"
                className="inline-flex min-h-11 items-center rounded-lg px-2 font-semibold text-ink-600 transition-colors hover:text-brand-700 focus-ring"
              >
                Help &amp; FAQ
              </Link>
              <span aria-hidden="true">&middot;</span>
              <Link
                href="/contact-us"
                className="inline-flex min-h-11 items-center rounded-lg px-2 font-semibold text-ink-600 transition-colors hover:text-brand-700 focus-ring"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

