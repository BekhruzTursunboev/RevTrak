/** @type {import('next').NextConfig} */
const nextConfig = {
  // Recommended for development to catch potential issues
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Ensure Prisma Client is properly bundled
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}

module.exports = nextConfig

