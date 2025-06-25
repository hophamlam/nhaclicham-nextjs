import "./globals.css";
import { Nunito } from "next/font/google";
import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nhắc Lịch Âm - Lunar Calendar Reminders",
  description: "Ứng dụng nhắc nhở theo lịch âm Việt Nam",
};

/**
 * Layout chính của ứng dụng
 * Bao gồm QueryProvider và ToastProvider
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={nunito.className}>
        <ThemeProvider defaultTheme="system" storageKey="nhaclicham-theme">
          <QueryProvider>
            <div className="min-h-screen bg-background text-foreground">
              {children}
            </div>
            <ToastProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
