import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Performance/security polish (docs/11_DEPLOYMENT_ROADMAP.MD — Phase 7):
  // remove the informational X-Powered-By header and let the image optimizer
  // prefer modern formats (AVIF/WebP) automatically.
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
