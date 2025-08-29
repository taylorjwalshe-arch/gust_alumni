/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure prisma/dev.db (and anything else in prisma/) is copied into the serverless functions
  experimental: {
    outputFileTracingIncludes: {
      // apply to all app/api/server routes
      '*': ['./prisma/**'],
    },
  },
};

module.exports = nextConfig;
