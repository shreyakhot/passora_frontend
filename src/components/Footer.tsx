import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { LOGO_PATH, SITE_NAME } from "@/lib/site";
import { POPULAR_TOOLS } from "@/lib/tool-directory";
import { getPlanPricing } from "@/lib/config/pricing";

export interface FooterLinkItem {
  label: string;
  href: string;
  target?: string;
  rel?: string;
}

export const DEFAULT_FOOTER_LINKS: Record<string, FooterLinkItem[]> = {
  Product: [
    { label: "Photo Maker Studio", href: "/passport-size-photo-maker" },
    { label: "Print Template Generator (4×6″)", href: "/passport-photo-print-template-generator" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
    { label: "XML Sitemap", href: "/sitemap.xml" },
  ],
  "Popular Countries": POPULAR_TOOLS.slice(0, 6).map((tool) => ({
    label: tool.title,
    href: `/tool/${tool.slug}`,
  })),
  "More Countries": [
    ...POPULAR_TOOLS.slice(6).map((tool) => ({
      label: tool.title,
      href: `/tool/${tool.slug}`,
    })),
    { label: "All Countries", href: "/tool" },
  ],
  "Company & Legal": [
    { label: "About Us", href: "/about-us" },
    { label: "Contact Us", href: "/contact-us" },
    { label: "Data Security & Privacy", href: "/data-security-privacy-safeguards" },
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
}

export default function Footer({
  brandName = SITE_NAME,
  brandLogo = LOGO_PATH,
  brandLogoAlt = `${SITE_NAME} Logo`,
  brandDescription = `Independent passport and visa photo service for 50+ countries. Create digital photos and 6×4″ print sheets sized to your country's rules for ${getPlanPricing("standard").amountFormatted}. Not affiliated with any government, passport office, embassy or consulate.`,
  linkGroups = DEFAULT_FOOTER_LINKS,
  copyrightText,
  regionNotice,
  className = "",
  children,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} ${brandName}. All rights reserved.`;

  return (
    <footer
      className={`bg-[#111827] text-slate-100 ${className}`.trim()}
      role="contentinfo"
    >
      <div className="container-narrow section-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-xl font-bold mb-4 text-white hover:text-lime-400 transition-colors focus-ring rounded-lg"
              aria-label={`${brandName} homepage`}
            >
              {brandLogo && (
                <Image
                  src={brandLogo}
                  alt={brandLogoAlt}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/20 shrink-0"
                />
              )}
              <span>{brandName}</span>
            </Link>
            <div className="text-slate-300 text-sm leading-relaxed max-w-sm">
              {typeof brandDescription === "string" ? (
                <p>{brandDescription}</p>
              ) : (
                brandDescription
              )}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(linkGroups).map(([heading, links]) => (
            <nav key={heading} aria-label={`${heading} links`}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
                {heading}
              </h2>
              <ul className="space-y-2.5 list-none p-0 m-0">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.target}
                      rel={link.rel}
                      className="text-slate-300 hover:text-white hover:underline text-sm transition-colors block py-0.5"
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

        <div className="border-t border-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-300 text-center sm:text-left">
          <p>{copyrightText ?? defaultCopyright}</p>
          <p className="flex items-center gap-1.5 text-slate-300">
            {regionNotice ?? (
              <>
                <span>Passport &amp; visa photos for 50+ countries</span>
                <span className="inline-block text-base" aria-hidden="true">
                  🌍
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
