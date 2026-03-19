// next.config.js
import path from "path";
import { fileURLToPath } from "url";

/** Resolve __dirname manually in ESM */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  //basePath: "/front",
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // For increasing payload size limits
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // For API routes body size (if using pages/api)
  // server: {
  //   maxRequestBodySize: "10mb",
  // },

  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
};

export default nextConfig;
