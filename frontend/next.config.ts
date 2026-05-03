import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "littlegeniusstorage.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "littlegeniusstorage01.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "little-genius-lab.vercel.app",
      },
      {
        protocol: "https",
        hostname: "littlegeniuslab.in",
      },
      {
        protocol: "https",
        hostname: "www.littlegeniuslab.in",
      },
      {
        protocol: "https",
        hostname: "littlegenius-lab.azurewebsites.net",
      },
    ],
  },
};

export default nextConfig;
