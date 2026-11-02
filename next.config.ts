import fs from "fs";
import path from "path";
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/** Guide pages served at /tool/<slug>; they must never be redirected away. */
const toolGuideSlugs = new Set(
  fs.existsSync(path.join(process.cwd(), "src/content/tools"))
    ? fs
        .readdirSync(path.join(process.cwd(), "src/content/tools"))
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(/\.md$/, ""))
    : []
);

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    const maker = "/passport-size-photo-maker";

    // Slugs of the removed per-country pages, e.g. /tool/china-passport-photo.
    const countryPageSlugs = [
      "algeria-passport-photo", "australia-passport-photo", "austria-passport-photo",
      "belgium-passport-photo", "bhutan-passport-photo", "bulgaria-passport-photo",
      "canada-passport-photo", "china-passport-photo", "croatia-passport-photo",
      "czechia-passport-photo", "denmark-passport-photo", "estonia-passport-photo",
      "finland-passport-photo", "france-passport-photo", "germany-passport-photo",
      "greece-passport-photo", "hungary-passport-photo", "india-passport-photo",
      "indonesia-passport-photo", "iran-passport-photo", "iraq-passport-photo",
      "italy-passport-photo", "japan-passport-photo", "kazakhstan-passport-photo",
      "latvia-passport-photo", "lithuania-passport-photo", "luxembourg-passport-photo",
      "malawi-passport-photo", "malta-passport-photo", "mexico-passport-photo",
      "nepal-passport-photo", "netherlands-passport-photo", "new-zealand-passport-photo",
      "nigeria-passport-photo", "norway-passport-photo", "poland-passport-photo",
      "portugal-passport-photo", "romania-passport-photo", "schengen-area-visa-photo",
      "singapore-passport-photo", "slovakia-passport-photo", "slovenia-passport-photo",
      "south-korea-passport-photo", "spain-passport-photo", "sri-lanka-passport-photo",
      "sweden-passport-photo", "switzerland-passport-photo", "tajikistan-passport-photo",
      "thailand-passport-photo", "turkey-passport-photo", "united-arab-emirates-passport-photo",
      "united-kingdom-passport-photo", "united-states-passport-photo",
    ];

    // Retired pages (old UK guides and the /tool country pages) that may still
    // be indexed or bookmarked. All go to the photo maker.
    const retired = [
      "/uk-passport-photo",
      "/passport-renewal-photo-online",
      "/uk-baby-passport-photo",
      "/uk-driving-licence-photo",
      "/driving-licence-photo",
      "/us-visa-photo",
      "/us-visa-photo-tool",
      "/schengen-visa-photo",
      "/indian-passport-photo",
      "/indian-passport-photo-maker",
      "/digital-passport-photo",
      "/photo-size-35x45mm",
      "/image-to-passport-size-converter",
      "/passport-photo-at-home",
      "/passport-photo-tool",
      "/online-id-photo-maker",
      "/order-passport-photos-online",
      "/passport-size-photo-online",
      "/tool/uk-passport-photo",
      "/tool/british-passport-picture-maker",
      "/tool/passport-photo-checker-uk",
      "/tool/uk-passport-photo-guidance-wizard",
      "/tool/digital-passport-photo",
      "/tool/passport-renewal-photo-online",
      "/tool/uk-baby-passport-photo",
      "/tool/uk-driving-licence-photo",
      "/tool/uk-visa-photo",
      "/tool/us-visa-photo-tool",
      "/tool/schengen-visa-photo",
      "/tool/indian-passport-photo-maker",
      "/tool/take-a-passport-photo-on-iphone",
      "/tool/passport-photo-at-home",
      "/tool/photo-size-35x45mm",
      "/tool/image-to-passport-size-converter",
      "/tool/passport-photo-tool",
      "/tool/online-id-photo-maker",
      "/tool/order-passport-photos-online",
      ...countryPageSlugs.map((slug) => `/tool/${slug}`),
    ];

    return retired
      .filter((source) => !toolGuideSlugs.has(source.replace(/^\/tool\//, "")))
      .map((source) => ({ source, destination: maker, permanent: true }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/logo.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icon.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/apple-icon.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
