import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    // Only apply rewrites in development mode
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/api/:path*', // Point to the local API server
        },
      ];
    }
    return [];
  },
  env: {
    // Add environment variables that will be available on the client-side
    API_URL: process.env.API_URL || 'https://api.supacards.com',
  },
};

export default nextConfig;
