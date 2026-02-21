import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf2pic", "tesseract.js", "pdfjs-dist"],
};

export default nextConfig;
