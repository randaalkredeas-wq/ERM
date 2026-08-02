import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" produces the self-contained .next/standalone bundle the
  // Dockerfile copies for self-hosted deployment (node server.js). Vercel
  // builds and serves Next.js through its own pipeline and does not need
  // this bundle - leaving it on unconditionally is what caused every route
  // to 404 there. Vercel sets VERCEL=1 in every build/runtime, so this
  // keeps the Docker path unchanged while skipping standalone on Vercel.
  output: process.env.VERCEL ? undefined : "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
