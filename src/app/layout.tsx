import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { QueryProvider } from "@/providers/QueryProvider";

/**
 * Layout cho thư mục /app
 * Dành cho người dùng đã đăng nhập
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </>
  );
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nhắc Lịch Âm",
};
