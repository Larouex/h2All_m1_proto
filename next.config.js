/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next.js looks in the src directory
  pageExtensions: ["tsx", "ts", "jsx", "js"],

  // Disable image optimization for better compatibility
  images: {
    unoptimized: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  },

  // Railway-specific optimizations
  // Remove standalone output as it can cause API route issues
  // output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

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
};

module.exports = nextConfig;
