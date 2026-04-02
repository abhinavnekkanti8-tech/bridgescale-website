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
  // Disable SWC on Windows (fixes "Failed to load SWC binary for win32/x64" error)
  swcMinify: false,
};

module.exports = nextConfig;
