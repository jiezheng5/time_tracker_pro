/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  eslint: {
    dirs: ['src'],
  },
  output: 'standalone',
}

module.exports = nextConfig
