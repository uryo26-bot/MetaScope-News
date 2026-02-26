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
};

export default nextConfig;
