/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['localhost', 'vercel.app'],
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
