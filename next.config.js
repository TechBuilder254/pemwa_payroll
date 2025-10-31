/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  onDemandEntries: {
    // Keep pages in memory longer and more of them to avoid recompile on first click
    maxInactiveAge: 15 * 60 * 1000, // 15 minutes
    pagesBufferLength: 10,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@tanstack/react-query',
      'framer-motion',
    ],
  },
}

module.exports = nextConfig
