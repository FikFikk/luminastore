import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "localhost",
          port: "3000",
          pathname: "/assets/"
        }
    ]
  }
};

export default nextConfig;
