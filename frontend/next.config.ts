import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const getRoot = () => {
  if (typeof import.meta?.url === "string") {
    return path.dirname(fileURLToPath(import.meta.url));
  }
  return path.resolve(process.cwd());
};

const root = getRoot();

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  turbopack: {
    root,
  },
  // Vercel デプロイ時に backend/data を API のバンドルに含める（path は project root = frontend からの相対）
  outputFileTracingIncludes: {
    "/api/energy": ["../backend/data/EneChart/energy_mix_percentage.csv"],
  },
};

export default nextConfig;
