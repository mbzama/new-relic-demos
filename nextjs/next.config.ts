import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Instrumentation hook is stable in Next.js 15+
  // Required for @newrelic/next to initialize before request handling
  experimental: {},
};

export default nextConfig;
