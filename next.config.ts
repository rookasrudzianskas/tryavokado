import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Demo product/asset imagery (mock data only).
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Configure your storage/CDN host(s) here for real uploaded assets:
      // { protocol: "https", hostname: "<your-r2-public-host>" },
    ],
  },
};

export default nextConfig;
