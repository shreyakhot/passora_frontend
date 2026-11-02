"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ArrowRight, Wand2, Printer, type LucideIcon } from "lucide-react";
import { LOGO_PATH, SITE_NAME } from "@/lib/site";

export interface NavLinkItem {
  label: string;
  href: string;
  target?: string;
  rel?: string;
}

export interface PhotoToolMenuItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const PHOTO_TOOLS_MENU: { creators: PhotoToolMenuItem[] } = {
  creators: [
    {
      title: "Passport Photo Maker",
      description: "Upload a photo, get it sized for your country",
      href: "/passport-size-photo-maker",
      icon: Wand2,
      badge: "Popular",
    },
    {
      title: "Print Template Generator",
      description: "4×6″, 5×7″ & A4 multi-photo print sheets",
      href: "/passport-photo-print-template-generator",
      icon: Printer,
      badge: "Free",
    },
  ],
};

/** Brand name with the part after the first "-" or space in the brand colour. */
export function BrandWordmark({ name = SITE_NAME }: { name?: string }) {
  const match = name.match(/^(.+?)([- ].+)$/);
  if (!match) return <span>{name}</span>;
  return (
    <span>
      {match[1]}
      <span className="text-brand-600">{match[2]}</span>
    </span>
  );
}

export const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Guides", href: "/tool" },
  { label: "FAQ", href: "/#faq" },
  { label: "About", href: "/about-us" },
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
  const [scrolled, setScrolled] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const isToolsActive =
    pathname === "/passport-size-photo-maker" ||
    pathname === "/passport-photo-print-template-generator";

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

  // Stronger surface once the page has scrolled
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const linkBase =
    "relative inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-ring";
  const linkIdle = "text-ink-600 hover:text-ink-950 hover:bg-ink-100";
  const linkActive = "text-brand-700 bg-brand-50";

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-200 ${
        scrolled || mobileOpen
          ? "bg-white/90 border-ink-200 backdrop-blur-md"
          : "bg-white/70 border-transparent backdrop-blur-sm"
      } ${className}`.trim()}
      role="banner"
    >
      <div className="container-narrow flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href={brandHref}
          className="flex items-center gap-2.5 rounded-xl py-1 pr-2 font-display text-lg font-extrabold tracking-tight text-ink-950 focus-ring"
          aria-label={`${SITE_NAME} homepage`}
        >
          {logoSrc && (
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={logoWidth}
              height={logoHeight}
              priority
              className="h-8 w-8 shrink-0 rounded-[10px] object-cover ring-1 ring-ink-200"
            />
          )}
          <span>{brandName}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label={ariaLabel}>
          {showToolsDropdown && (
            <div
              className="relative"
              onMouseEnter={handleMouseEnterTools}
              onMouseLeave={handleMouseLeaveTools}
            >
              <button
                type="button"
                onClick={() => setToolsDropdownOpen((prev) => !prev)}
                className={`${linkBase} ${isToolsActive || toolsDropdownOpen ? linkActive : linkIdle}`}
                aria-expanded={toolsDropdownOpen}
                aria-haspopup="true"
              >
                Tools
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${toolsDropdownOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {toolsDropdownOpen && (
                <div
                  className="absolute left-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-2xl border border-ink-200 bg-white p-2 text-left shadow-lift animate-fade-in"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {PHOTO_TOOLS_MENU.creators.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setToolsDropdownOpen(false)}
                        className="group/item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-brand-50"
                        role="menuitem"
                      >
                        <span className="icon-tile h-10 w-10 group-hover/item:bg-brand-600 group-hover/item:text-white group-hover/item:border-brand-600 transition-colors">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-bold text-ink-950">{tool.title}</span>
                            {tool.badge && (
                              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                                {tool.badge}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs text-ink-500">{tool.description}</span>
                        </span>
                      </Link>
                    );
                  })}
                  <div className="mt-1 flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2.5">
                    <span className="text-xs font-medium text-ink-600">50+ country photo formats</span>
                    <Link
                      href="/passport-size-photo-maker"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800"
                    >
                      Create a photo
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.target}
                rel={link.rel}
                className={`${linkBase} ${isActive ? linkActive : linkIdle}`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {ctaText && (
            <Link href={ctaHref} className="btn-brand hidden min-h-10 px-4 py-2 text-sm sm:inline-flex">
              {ctaText}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-900 focus-ring lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer & backdrop */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-ink-950/40 backdrop-blur-xs animate-fade-in lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-navigation-drawer"
            className="absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-ink-200 bg-white shadow-lift animate-fade-in lg:hidden"
          >
            <nav className="container-narrow flex flex-col gap-1 py-4" aria-label="Mobile navigation">
              {showToolsDropdown && (
                <div className="mb-1">
                  <button
                    type="button"
                    onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-base font-bold text-ink-950 hover:bg-ink-50"
                    aria-expanded={mobileToolsOpen}
                  >
                    <span className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-brand-600" aria-hidden="true" />
                      Photo tools
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-ink-500 transition-transform duration-200 ${mobileToolsOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {mobileToolsOpen && (
                    <div className="mt-1 space-y-1 rounded-2xl border border-ink-200 bg-ink-50 p-2">
                      {PHOTO_TOOLS_MENU.creators.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-ink-800 hover:bg-white"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                            <span className="truncate">{tool.title}</span>
                            {tool.badge && (
                              <span className="ml-auto shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700">
                                {tool.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.target}
                    rel={link.rel}
                    className={`rounded-xl px-3 py-3 text-base font-semibold transition-colors ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-50 hover:text-ink-950"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {ctaText && (
                <Link
                  href={ctaHref}
                  className="btn-brand btn-lg mt-3 w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  {ctaText}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
