import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-API-Key, x-api-key',
          },
        ],
      },
    ]
  },
  images: {
      remotePatterns: [
        {
          protocol: "http",
          hostname: "http://localhost",
          port: "8080",
          pathname: "/assets/**"
        }
    ]
  }
};

export default nextConfig;
