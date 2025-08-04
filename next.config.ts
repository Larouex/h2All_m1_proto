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

  // Optimize build output
  experimental: {
    // Enable modern JavaScript output
    esmExternals: true,
    // Disable webpack cache in CI to prevent large cache directories
    webpackBuildWorker: process.env.CI ? false : true,
  },

  // Disable caching in CI environments to reduce build size
  cacheHandler: process.env.CI
    ? undefined
    : require.resolve(
        "next/dist/server/lib/incremental-cache/file-system-cache.js"
      ),
  cacheMaxMemorySize: process.env.CI ? 0 : 50 * 1024 * 1024, // 50MB limit, 0 in CI

  // Minimize build output
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Configure webpack for smaller bundles
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Minimize client bundle size
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
          },
        },
      };
    }
    return config;
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
