import type { NextConfig } from "next";
import createMDX from "@next/mdx";

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
    const uk = "/tool/united-kingdom-passport-photo";
    const us = "/tool/united-states-passport-photo";
    const schengen = "/tool/schengen-area-visa-photo";
    const india = "/tool/india-passport-photo";

    // Retired single-country (UK) pages and guides, mapped to the generated
    // per-country pages or the country hub.
    const retired: [string, string][] = [
      ["/uk-passport-photo", uk],
      ["/passport-renewal-photo-online", uk],
      ["/uk-baby-passport-photo", uk],
      ["/uk-driving-licence-photo", uk],
      ["/driving-licence-photo", uk],
      ["/us-visa-photo", us],
      ["/us-visa-photo-tool", us],
      ["/schengen-visa-photo", schengen],
      ["/indian-passport-photo", india],
      ["/indian-passport-photo-maker", india],
      ["/digital-passport-photo", "/passport-size-photo-maker"],
      ["/photo-size-35x45mm", "/passport-size-photo-maker"],
      ["/image-to-passport-size-converter", "/passport-size-photo-maker"],
      ["/passport-photo-at-home", "/passport-size-photo-maker"],
      ["/passport-photo-tool", "/passport-size-photo-maker"],
      ["/online-id-photo-maker", "/passport-size-photo-maker"],
      ["/order-passport-photos-online", "/passport-size-photo-maker"],
      ["/passport-size-photo-online", "/passport-size-photo-maker"],
      ["/tool/uk-passport-photo", uk],
      ["/tool/british-passport-picture-maker", uk],
      ["/tool/passport-photo-checker-uk", uk],
      ["/tool/uk-passport-photo-guidance-wizard", uk],
      ["/tool/digital-passport-photo", uk],
      ["/tool/passport-renewal-photo-online", uk],
      ["/tool/uk-baby-passport-photo", uk],
      ["/tool/uk-driving-licence-photo", uk],
      ["/tool/uk-visa-photo", uk],
      ["/tool/us-visa-photo-tool", us],
      ["/tool/schengen-visa-photo", schengen],
      ["/tool/indian-passport-photo-maker", india],
      ["/tool/take-a-passport-photo-on-iphone", "/passport-size-photo-maker"],
      ["/tool/passport-photo-at-home", "/passport-size-photo-maker"],
      ["/tool/photo-size-35x45mm", "/passport-size-photo-maker"],
      ["/tool/image-to-passport-size-converter", "/passport-size-photo-maker"],
      ["/tool/passport-photo-tool", "/passport-size-photo-maker"],
      ["/tool/online-id-photo-maker", "/passport-size-photo-maker"],
      ["/tool/order-passport-photos-online", "/passport-size-photo-maker"],
    ];

    return retired.map(([source, destination]) => ({ source, destination, permanent: true }));
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
