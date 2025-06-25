/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tối ưu cho Cloudflare Pages
  output: "standalone",
  images: {
    unoptimized: true, // Cloudflare Pages không hỗ trợ Image Optimization
    domains: ["aekfivlrnrdzolsiipdf.supabase.co"], // Domain của Supabase storage
  },
  // Tắt một số tính năng không cần thiết
  poweredByHeader: false,
  eslint: {
    // Tắt hoàn toàn ESLint trong quá trình build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tắt hoàn toàn TypeScript check trong quá trình build
    ignoreBuildErrors: true,
  },
  // Tối ưu cho Cloudflare Pages - tắt cache để giảm kích thước
  experimental: {
    webpackBuildWorker: false,
  },
  webpack: (config, { isServer }) => {
    // Tắt cache trong production
    if (!isServer) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
