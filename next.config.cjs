/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "*": ["./prisma/**"],
  },
};
module.exports = nextConfig;
