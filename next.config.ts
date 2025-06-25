/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tối ưu cho Cloudflare Pages - sử dụng export thay vì standalone
  output: "export",
  trailingSlash: true,
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
  webpack: (config) => {
    // Tắt hoàn toàn cache cho cả client và server
    config.cache = false;
    return config;
  },
};

export default nextConfig;
