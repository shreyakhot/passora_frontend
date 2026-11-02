import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Globe2 } from "lucide-react";
import { LOGO_PATH, SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";
import { getPlanPricing } from "@/lib/config/pricing";

export interface FooterLinkItem {
  label: string;
  href: string;
  target?: string;
  rel?: string;
}

export const DEFAULT_FOOTER_LINKS: Record<string, FooterLinkItem[]> = {
  Product: [
    { label: "Photo Maker", href: "/passport-size-photo-maker" },
    { label: "Print Template Generator", href: "/passport-photo-print-template-generator" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ],
  Resources: [
    { label: "Photo Guides", href: "/tool" },
    { label: "Data Security & Privacy", href: "/data-security-privacy-safeguards" },
    { label: "XML Sitemap", href: "/sitemap.xml" },
  ],
  Company: [
    { label: "About Us", href: "/about-us" },
    { label: "Contact Us", href: "/contact-us" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Refund Policy", href: "/refund-policy" },
  ],
};

export interface FooterProps {
  brandName?: string;
  brandLogo?: string;
  brandLogoAlt?: string;
  brandDescription?: ReactNode;
  linkGroups?: Record<string, FooterLinkItem[]>;
  copyrightText?: string;
  regionNotice?: ReactNode;
  className?: string;
  children?: ReactNode;
  /** Show the "ready to make your photo?" band above the footer links. */
  showCta?: boolean;
}

export default function Footer({
  brandName = SITE_NAME,
  brandLogo = LOGO_PATH,
  brandLogoAlt = `${SITE_NAME} Logo`,
  brandDescription = `Independent passport and visa photo service for 50+ countries. Digital photos and 6×4″ print sheets sized to your country's rules for ${getPlanPricing("standard").amountFormatted}. Not affiliated with any government, passport office, embassy or consulate.`,
  linkGroups = DEFAULT_FOOTER_LINKS,
  copyrightText,
  regionNotice,
  className = "",
  children,
  showCta = true,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} ${brandName}. All rights reserved.`;

  return (
    <footer className={`relative overflow-hidden bg-ink-950 text-ink-200 ${className}`.trim()} role="contentinfo">

      <div className="container-narrow relative">
        {showCta && (
          <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 py-12 sm:py-14 md:flex-row md:items-center">
            <div className="max-w-xl">
              <p className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Your next passport photo is one upload away.
              </p>
              <p className="mt-2 text-sm text-ink-300 sm:text-base">
                Pick a country, upload a phone photo and preview the result before you pay.
              </p>
            </div>
            <Link href="/passport-size-photo-maker" className="btn-light btn-lg shrink-0">
              Create my photo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-10 py-12 sm:py-14 md:grid-cols-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-xl font-display text-xl font-extrabold tracking-tight text-white focus-ring"
              aria-label={`${brandName} homepage`}
            >
              {brandLogo && (
                <Image
                  src={brandLogo}
                  alt={brandLogoAlt}
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-[10px] object-cover ring-1 ring-white/20"
                />
              )}
              <span>{brandName}</span>
            </Link>
            <div className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">
              {typeof brandDescription === "string" ? <p>{brandDescription}</p> : brandDescription}
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          {Object.entries(linkGroups).map(([heading, links]) => (
            <nav key={heading} aria-label={`${heading} links`} className="md:col-span-2">
              <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.14em] text-white">{heading}</h2>
              <ul className="m-0 list-none space-y-2.5 p-0">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.target}
                      rel={link.rel}
                      className="block py-0.5 text-sm text-ink-300 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {children}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-center text-xs text-ink-400 sm:flex-row sm:text-left sm:text-sm">
          <p>{copyrightText ?? defaultCopyright}</p>
          <p className="flex items-center gap-1.5">
            {regionNotice ?? (
              <>
                <Globe2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
                <span>Passport &amp; visa photos for 50+ countries</span>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
