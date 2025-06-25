import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nhắc Lịch Âm - Ứng dụng nhắc nhở theo lịch âm",
  description:
    "Ứng dụng giúp bạn thiết lập và quản lý các nhắc nhở theo lịch âm Việt Nam",
};

/**
 * Root layout cho toàn bộ ứng dụng
 * Cung cấp các provider cần thiết và cấu trúc HTML cơ bản
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="nhaclicham-theme">
          <QueryProvider>
            <div className="min-h-screen bg-background">{children}</div>
            <ToastProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
