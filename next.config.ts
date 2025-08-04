import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Next.js looks in the src directory
  pageExtensions: ["tsx", "ts", "jsx", "js"],

  // For Azure Static Web Apps, use standard build (not static export)
  // Azure SWA can handle Next.js API routes as Azure Functions

  // Disable image optimization for Azure SWA compatibility
  images: {
    unoptimized: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  },

  // Configure for Azure SWA
  async rewrites() {
    return [
      // Keep API routes as-is
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
