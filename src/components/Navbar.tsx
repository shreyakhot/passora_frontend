"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import { LOGO_PATH, SITE_NAME } from "@/lib/site";
import { POPULAR_TOOLS } from "@/lib/tool-directory";

export interface NavLinkItem {
  label: string;
  href: string;
  target?: string;
  rel?: string;
}

export const PHOTO_TOOLS_MENU = {
  creators: [
    {
      title: "Passport Photo Maker Studio",
      description: "AI-powered biometric photo maker & background cleaner",
      href: "/passport-size-photo-maker",
      icon: "✨",
      badge: "Popular",
    },
    {
      title: "Print Template Generator",
      description: "4×6″, 5×7″ & A4 multi-photo printable tile sheet creator",
      href: "/passport-photo-print-template-generator",
      icon: "🖨️",
      badge: "New",
    },
    {
      title: "Photo Sizes by Country",
      description: "Passport & visa photo sizes for 50+ countries",
      href: "/tool",
      icon: "🌍",
    },
  ],
  countries: POPULAR_TOOLS.map((tool) => ({
    title: tool.title,
    spec: tool.spec,
    href: `/tool/${tool.slug}`,
    flag: tool.flag,
  })),
};

/** Brand name with the part after the first "-" or space in the accent colour. */
export function BrandWordmark({ name = SITE_NAME }: { name?: string }) {
  const match = name.match(/^(.+?)([- ].+)$/);
  if (!match) return <span>{name}</span>;
  return (
    <span>
      {match[1]}
      <span className="text-lime-600 font-extrabold">{match[2]}</span>
    </span>
  );
}

export const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },

  { label: "FAQ", href: "/#faq" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
];

export interface NavbarProps {
  brandName?: ReactNode;
  brandHref?: string;
  logoSrc?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  navLinks?: NavLinkItem[];
  showToolsDropdown?: boolean;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
  ariaLabel?: string;
}

export default function Navbar({
  brandName = <BrandWordmark />,
  brandHref = "/",
  logoSrc = LOGO_PATH,
  logoAlt = `${SITE_NAME} Logo`,
  logoWidth = 32,
  logoHeight = 32,
  navLinks = DEFAULT_NAV_LINKS,
  showToolsDropdown = true,
  ctaText = "Get Started",
  ctaHref = "/passport-size-photo-maker",
  className = "",
  ariaLabel = "Main site navigation",
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const isToolsActive =
    pathname === "/passport-size-photo-maker" ||
    pathname === "/passport-photo-print-template-generator" ||
    (pathname ? pathname.startsWith("/tool") : false);

  // Close menus on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setToolsDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseEnterTools = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setToolsDropdownOpen(true);
  };

  const handleMouseLeaveTools = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setToolsDropdownOpen(false);
    }, 150);
  };

  return (
    <header
      className={`navbar bg-base-100 border-b border-base-300 sticky top-0 z-50 px-0 ${className}`.trim()}
      role="banner"
    >
      <div className="container-narrow flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href={brandHref}
          className="flex items-center gap-2.5 text-lg sm:text-xl font-bold text-slate-900 focus-ring rounded-lg py-1 px-1.5 -ml-1.5 transition-opacity hover:opacity-90"
          aria-label={`${SITE_NAME} homepage`}
        >
          {logoSrc && (
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={logoWidth}
              height={logoHeight}
              priority
              className="w-8 h-8 rounded-lg object-cover shadow-xs border border-lime-600/30 shrink-0"
            />
          )}
          <span>{brandName}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label={ariaLabel}>
          {/* Tools Mega-Dropdown */}
          {showToolsDropdown && (
            <div
              className="relative"
              onMouseEnter={handleMouseEnterTools}
              onMouseLeave={handleMouseLeaveTools}
            >
              <button
                type="button"
                onClick={() => setToolsDropdownOpen((prev) => !prev)}
                className={`group relative inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md focus-ring ${
                  isToolsActive || toolsDropdownOpen
                    ? "text-lime-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                aria-expanded={toolsDropdownOpen}
                aria-haspopup="true"
              >
                <span className="relative inline-block py-0.5">
                  Tools
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-0 h-[2px] w-full bg-lime-600 rounded-full transition-transform duration-300 ease-out origin-left pointer-events-none ${
                      isToolsActive || toolsDropdownOpen
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    }`}
                  />
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    toolsDropdownOpen ? "rotate-180 text-lime-700" : "text-slate-500 group-hover:text-slate-700"
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Mega Dropdown Panel */}
              {toolsDropdownOpen && (
                <div
                  className="absolute top-full left-0 lg:left-1/2 lg:-translate-x-1/3 mt-1.5 w-[640px] lg:w-[720px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 sm:p-5 z-50 animate-fade-in text-left"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="grid grid-cols-12 gap-5">
                    {/* Left Column: Core Tools */}
                    <div className="col-span-6 space-y-1.5 border-r border-slate-100 pr-4">
                      <div className="px-2 pb-1 text-[11px] font-bold tracking-wider uppercase text-slate-600">
                        Photo Creation Tools
                      </div>
                      {PHOTO_TOOLS_MENU.creators.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setToolsDropdownOpen(false)}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-lime-50/50 transition-all group/item border border-transparent hover:border-lime-200/50"
                          role="menuitem"
                        >
                          <div className="w-7 h-7 rounded-lg bg-lime-100/70 border border-lime-200 flex items-center justify-center text-sm shrink-0 group-hover/item:scale-105 transition-transform">
                            {tool.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 group-hover/item:text-lime-700 transition-colors">
                                {tool.title}
                              </span>
                              {tool.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-lime-100 text-lime-800 border border-lime-200">
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                              {tool.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Right Column: Country Standards */}
                    <div className="col-span-6 space-y-1">
                      <div className="px-2 pb-1 text-[11px] font-bold tracking-wider uppercase text-slate-600">
                        Country &amp; Visa Standards
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {PHOTO_TOOLS_MENU.countries.map((tool) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            onClick={() => setToolsDropdownOpen(false)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors group/citem border border-transparent hover:border-slate-100"
                            role="menuitem"
                          >
                            <span className="text-sm shrink-0" role="img" aria-hidden="true">
                              {tool.flag}
                            </span>
                            <div className="min-w-0">
                              <span className="text-[11px] font-semibold text-slate-800 group-hover/citem:text-lime-700 block truncate">
                                {tool.title}
                              </span>
                              <span className="text-[9px] text-slate-600 font-mono block truncate">
                                {tool.spec}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Footer */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between px-2 bg-slate-50/70 -mx-4 -mb-4 p-3 rounded-b-2xl">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-lime-600 animate-pulse" />
                      <span className="text-[11px] font-medium">50+ Country Formats · Guaranteed Biometric Compliance</span>
                    </div>
                    <Link
                      href="/passport-size-photo-maker"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="text-xs font-bold text-lime-700 hover:text-lime-800 inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Create Photo Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Standard Navigation Links */}
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.target}
                rel={link.rel}
                className={`group relative inline-flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md focus-ring ${
                  isActive
                    ? "text-lime-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="relative inline-block py-0.5">
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-0 h-[2px] w-full bg-lime-600 rounded-full transition-transform duration-300 ease-out origin-left pointer-events-none ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    }`}
                  />
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        {ctaText && (
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={ctaHref}
              className="btn btn-primary btn-sm px-4 font-bold !text-white text-white shadow-xs hover:shadow-sm"
            >
              {ctaText}
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          className="btn btn-ghost btn-square btn-sm md:hidden text-slate-800"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation-drawer"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Menu className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile dropdown menu & backdrop */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-[57px] bg-slate-900/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-navigation-drawer"
            className="md:hidden bg-base-100 border-t border-base-300 absolute top-full left-0 right-0 z-50 shadow-xl animate-fade-in max-h-[calc(100vh-60px)] overflow-y-auto"
          >
            <nav
              className="menu menu-vertical p-4 gap-1.5"
              aria-label="Mobile navigation"
            >
              {/* Mobile Tools Accordion */}
              {showToolsDropdown && (
                <div className="mb-1">
                  <button
                    type="button"
                    onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-slate-800 font-bold text-base hover:bg-slate-50 transition-colors"
                    aria-expanded={mobileToolsOpen}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-lime-600" />
                      <span>Photo Tools &amp; Sizes</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        mobileToolsOpen ? "rotate-180 text-lime-600" : ""
                      }`}
                    />
                  </button>

                  {mobileToolsOpen && (
                    <div className="pl-3 pr-2 py-2 space-y-3 bg-slate-50/80 rounded-xl mt-1 border border-slate-200/60">
                      <div>
                        <div className="px-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Creation Tools
                        </div>
                        <div className="space-y-1">
                          {PHOTO_TOOLS_MENU.creators.map((tool) => (
                            <Link
                              key={tool.href}
                              href={tool.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-lime-700 hover:bg-white transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="shrink-0">{tool.icon}</span>
                                <span className="truncate">{tool.title}</span>
                              </div>
                              {tool.badge && (
                                <span className="ml-2 text-[9px] font-bold px-1.5 py-0.2 rounded bg-lime-100 text-lime-800 shrink-0">
                                  {tool.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="px-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Country &amp; Visa Standards
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {PHOTO_TOOLS_MENU.countries.map((tool) => (
                            <Link
                              key={tool.href}
                              href={tool.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-lime-700 hover:bg-white transition-colors"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="shrink-0">{tool.flag}</span>
                                <span className="truncate">{tool.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-600 font-mono shrink-0 ml-2">
                                {tool.spec}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Standard Nav Links */}
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.target}
                    rel={link.rel}
                    className={`group relative flex items-center justify-between py-2.5 px-3 rounded-lg font-medium text-base transition-colors ${
                      isActive
                        ? "text-lime-700 bg-lime-50 font-semibold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="relative inline-block py-0.5">
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={`absolute bottom-0 left-0 h-[2px] w-full bg-lime-600 rounded-full transition-transform duration-300 ease-out origin-left pointer-events-none ${
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </span>
                  </Link>
                );
              })}
              {ctaText && (
                <>
                  <div className="divider my-2" />
                  <Link
                    href={ctaHref}
                    className="btn btn-primary w-full text-base font-bold !text-white text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    {ctaText}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
