/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  reactStrictMode: true,
  transpilePackages: ['@mss/shared', '@mss/api-client', '@mss/ui'],
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
