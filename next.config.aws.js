/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during AWS builds
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during AWS builds
  },
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
