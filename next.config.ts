/** @type {import('next').NextConfig} */
const nextConfig = {
  // Loại bỏ output: 'export' để Next.js build chế độ SSR/Edge (Cloudflare Pages Functions)
  trailingSlash: false, // Tắt trailing slash
  images: {
    unoptimized: true, // Cloudflare Pages không hỗ trợ Image Optimization
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
  webpack: (config: any) => {
    // Tắt hoàn toàn cache cho cả client và server
    config.cache = false;
    return config;
  },
};

export default nextConfig;
