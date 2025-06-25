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
};

export default nextConfig;
