import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf2pic", "tesseract.js"],
};

export default nextConfig;
