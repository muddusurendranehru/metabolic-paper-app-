import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf2pic", "tesseract.js", "pdfjs-dist"],
  // Use this project as the workspace root (absolute path silences turbopack warning)
  turbopack: { root: path.resolve(process.cwd()) },
};

export default nextConfig;
