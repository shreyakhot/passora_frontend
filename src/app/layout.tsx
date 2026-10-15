import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LOGO_PATH, SITE_NAME, SITE_URL } from "@/lib/site";
import { getPlanPricing } from "@/lib/config/pricing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4D7C0F",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `Passport & Visa Photo Online for 50+ Countries | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },

  description: `Make a passport, visa or ID photo online for 50+ countries. Upload a phone photo, get it sized to your country's rules with a compliant background, and download for ${getPlanPricing("standard").amountFormatted}.`,

  authors: [{ name: SITE_NAME, url: SITE_URL }],

  creator: SITE_NAME,
  publisher: SITE_NAME,

  // Canonical is set per page. A canonical here would be inherited by every
  // route that does not define its own and point it at the homepage.

  openGraph: {
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_PATH,
        width: 640,
        height: 640,
        alt: `${SITE_NAME} — passport and visa photo maker`,
      },
    ],
  },

  twitter: {
    card: "summary",
    images: [LOGO_PATH],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="brand"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-full flex flex-col bg-base-100 text-base-content">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}

        {/* Microsoft Clarity - deferred until browser is idle */}
        {CLARITY_ID && (
          <Script id="microsoft-clarity" strategy="lazyOnload">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            `}
          </Script>
        )}

        {/* Google tag (gtag.js) - deferred until browser is idle */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
