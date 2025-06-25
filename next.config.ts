import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tối ưu cho Cloudflare Pages
  output: "standalone",
  images: {
    unoptimized: true, // Cloudflare Pages không hỗ trợ Image Optimization
    domains: ["aekfivlrnrdzolsiipdf.supabase.co"], // Domain của Supabase storage
  },
  // Tắt một số tính năng không cần thiết
  poweredByHeader: false,
  eslint: {
    // Tạm thời bỏ qua lỗi ESLint trong quá trình build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tạm thời bỏ qua lỗi TypeScript trong quá trình build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
