import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [320, 420, 640, 768, 1024],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Minimize JavaScript bundle
  productionBrowserSourceMaps: false,
  
  // Optimize for production
  swcMinify: true,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Add trailing slashes for better static hosting
  trailingSlash: true,
  
  // Skip TypeScript errors in production build (be careful with this)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Skip ESLint during builds for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },

  // Webpack optimizations for smaller bundles
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module: any) {
                return module.size() > 160000 &&
                  /node_modules[/\\]/.test(module.identifier());
              },
              name(module: any) {
                const hash = require('crypto').createHash('sha1');
                hash.update(module.identifier());
                return hash.digest('hex').substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
        },
        runtimeChunk: {
          name: 'runtime',
        },
      };
    }
    return config;
  },
};

export default nextConfig;