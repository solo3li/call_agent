import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  allowedDevOrigins: ['178.62.192.74'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'http://cpaas-backend:80/api/:path*' 
          : 'http://127.0.0.1:5246/api/:path*' // Proxy to Backend
      }
    ]
  }
};

export default nextConfig;
