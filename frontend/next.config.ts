import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  allowedDevOrigins: ['178.62.192.74'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: (process.env.BACKEND_URL || 'http://cpaas-backend:8080') + '/api/:path*'
      }
    ]
  }
};

export default nextConfig;
