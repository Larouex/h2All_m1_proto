/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for Railway compatibility
  images: {
    unoptimized: true,
  },

  // Simple output configuration
  output: "standalone",

  // Disable experimental features that can cause build issues
  experimental: {
    webpackBuildWorker: false,
  },
};

module.exports = nextConfig;
