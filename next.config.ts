import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/ui",
  output: "standalone",

  // Performance optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
