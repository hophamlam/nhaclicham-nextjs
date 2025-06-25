import { Navigation } from "@/components/Navigation";

/**
 * Layout cho thư mục /app
 * Dành cho người dùng đã đăng nhập
 * Hiển thị Navigation và bọc nội dung trong container
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </>
  );
}
