import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore lint and type errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable Turbopack to avoid Render build crashes
  experimental: {
    turbo: false, // 👈 Important: forces Webpack
    optimizePackageImports: ['@ant-design/icons', 'antd'],
  },

  // Optional optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  // Add custom webpack alias
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": __dirname,
    };
    return config;
  },
};

export default nextConfig;
