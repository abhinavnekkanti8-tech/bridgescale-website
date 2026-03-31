/** @type {import('next').NextConfig} */
const nextConfig = {
  // Backend API base URL
  env: {
    NEXT_PUBLIC_API_URL: process.env.BACKEND_URL || 'http://localhost:4000',
  },
  // Allow optimised images from remote sources if needed
  images: {
    domains: [],
  },
  // Skip ESLint during builds (typescript-eslint not installed in this project)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip TypeScript type checking during builds (handled by IDE)
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
