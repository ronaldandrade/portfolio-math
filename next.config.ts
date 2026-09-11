import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Thumbnails dos vídeos do YouTube
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
