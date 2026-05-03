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
      {
        protocol: "https",
        hostname: "littlegenius-lab-f5e2fpb4chf7h0hg.southindia-01.azurewebsites.net",
      },
    ],
  },
};

export default nextConfig;
