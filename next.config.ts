import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rockproject-specimen-images-prod.s3.us-east-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rockproject-specimen-images-prod.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
