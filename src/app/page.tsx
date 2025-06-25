"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import type { Session } from "@supabase/supabase-js";
import {
  Calendar,
  Bell,
  Check,
  Star,
  MessageCircle,
  Bot,
  Database,
  Github,
  Facebook,
  Gamepad2,
} from "lucide-react";
import LunarCalendarCard from "@/components/LunarCalendarCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomepageNavigation } from "@/components/HomepageNavigation";

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Lấy session hiện tại
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (!error) {
          setSession(session);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Lắng nghe thay đổi auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-red-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HomepageNavigation />
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section với Lịch Âm làm trọng tâm */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto text-center max-w-5xl">
            {/* Title & Description */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-foreground mb-6">
                Nhắc Lịch Âm
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                Ứng dụng nhắc nhở thông minh theo lịch âm Việt Nam
              </p>
            </div>

            {/* Lịch âm hôm nay - Component chính */}
            <div className="mb-12">
              <LunarCalendarCard className="max-w-2xl mx-auto" />
            </div>

            {/* Call to action nhẹ nhàng */}
            {session ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/app/dash">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Vào ứng dụng
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Khám phá tính năng
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                  onClick={() => {
                    const event = new CustomEvent("openAuthDialog", {
                      detail: { tab: "signup" },
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Bắt đầu miễn phí
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                  onClick={() => {
                    const event = new CustomEvent("openAuthDialog", {
                      detail: { tab: "login" },
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Đăng nhập
                </Button>
              </div>
            )}

            {!session && (
              <p className="text-sm text-muted-foreground mt-4">
                Miễn phí hoàn toàn • Không cần thẻ tín dụng
              </p>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4 bg-accent/50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Tính năng nổi bật
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center shadow-lg bg-background/70">
                <CardHeader>
                  <Bell className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">Nhắc nhở thông minh</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Nhận thông báo tự động cho các ngày lễ, giỗ chạp, và sự kiện
                    quan trọng theo lịch âm.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg bg-background/70">
                <CardHeader>
                  <Calendar className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">Lịch âm chính xác</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tính toán lịch âm Việt Nam chính xác, bao gồm năm nhuận và
                    các ngày đặc biệt.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg relative bg-background/70">
                <CardHeader>
                  <Database className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">Backup/Restore</CardTitle>
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sao lưu và khôi phục dữ liệu sự kiện của bạn một cách an
                    toàn và dễ dàng.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg relative bg-background/70">
                <CardHeader>
                  <Star className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">Dự báo ngày giờ tốt</CardTitle>
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tư vấn ngày giờ tốt dựa theo thông tin cá nhân và phong thủy
                    truyền thống Việt Nam.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg relative bg-background/70">
                <CardHeader>
                  <MessageCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">Thông báo Zalo OA</CardTitle>
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Nhận thông báo trực tiếp qua Zalo Official Account, tiện lợi
                    và nhanh chóng.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg relative bg-background/70">
                <CardHeader>
                  <Bot className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">Discord Bot</CardTitle>
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tích hợp Discord bot để nhận thông báo trong server của bạn
                    một cách tự động.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4 bg-background">
          <div className="container mx-auto text-center max-w-4xl">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Cách sử dụng
            </h2>
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-1/2 -ml-px h-full w-0.5 bg-border"
                aria-hidden="true"
              ></div>

              <div className="space-y-12">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-600 text-white font-bold text-xl">
                      1
                    </div>
                  </div>
                  <p className="md:w-1/2 md:pr-8 md:text-right text-lg text-muted-foreground">
                    Tạo tài khoản miễn phí chỉ trong vài giây với email của bạn.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-600 text-white font-bold text-xl">
                      2
                    </div>
                  </div>
                  <div className="md:w-1/2 md:ml-auto md:pl-8 md:text-left">
                    <p className="text-lg text-muted-foreground">
                      Tạo các lời nhắc cho ngày giỗ, sinh nhật, lễ tết theo lịch
                      âm.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-600 text-white font-bold text-xl">
                      3
                    </div>
                  </div>
                  <p className="md:w-1/2 md:pr-8 md:text-right text-lg text-muted-foreground">
                    Được nhắc nhở tự động qua email, SMS hoặc thông báo trên
                    web.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 px-4 bg-accent/50">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Bảng giá
            </h2>
            <p className="text-muted-foreground mb-8">
              Hiện tại hoàn toàn miễn phí! Sắp tới sẽ có gói Pro với nhiều tính
              năng hơn
            </p>
            <div className="flex justify-center mb-8">
              <span className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-sm font-medium px-4 py-2 rounded-full">
                <Check className="inline-block h-4 w-4 mr-2" />
                Thời gian beta - Tất cả tính năng miễn phí
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <Card className="p-8 shadow-lg bg-background/70">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Gói miễn phí
                  </h3>
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Hiện tại
                  </span>
                </div>
                <p className="text-muted-foreground mb-6">
                  Tất cả tính năng cần thiết để bạn không bỏ lỡ ngày quan trọng
                  nào.
                </p>
                <p className="text-4xl font-bold text-foreground mb-6">
                  0đ
                  <span className="text-lg font-normal text-muted-foreground">
                    /mãi mãi
                  </span>
                </p>
                <ul className="space-y-3 text-left text-muted-foreground mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Không giới hạn số lượng sự kiện
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Nhắc nhở qua Email
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Lịch âm chính xác
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    const event = new CustomEvent("openAuthDialog", {
                      detail: { tab: "signup" },
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Bắt đầu ngay
                </Button>
              </Card>

              {/* Pro Plan */}
              <Card className="p-8 shadow-lg border-red-500 border-2 relative bg-background/70">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Pro Plan
                  </h3>
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Sắp ra mắt
                  </span>
                </div>
                <p className="text-muted-foreground mb-6">
                  Mở khóa các tính năng nâng cao và nhận hỗ trợ ưu tiên.
                </p>
                <p className="text-4xl font-bold text-foreground mb-6">
                  TRA
                  <span className="text-lg font-normal text-muted-foreground">
                    /tháng
                  </span>
                </p>
                <ul className="space-y-3 text-left text-muted-foreground mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Mọi tính năng của gói miễn phí
                  </li>
                  <li className="flex items-center font-semibold text-primary">
                    <Star className="h-5 w-5 text-amber-500 mr-3" />
                    Thông báo qua Zalo & SMS
                  </li>
                  <li className="flex items-center font-semibold text-primary">
                    <Star className="h-5 w-5 text-amber-500 mr-3" />
                    Tích hợp Discord Bot
                  </li>
                  <li className="flex items-center font-semibold text-primary">
                    <Star className="h-5 w-5 text-amber-500 mr-3" />
                    Dự báo ngày giờ tốt
                  </li>
                  <li className="flex items-center font-semibold text-primary">
                    <Star className="h-5 w-5 text-amber-500 mr-3" />
                    Sao lưu và khôi phục dữ liệu
                  </li>
                </ul>
                <Button size="lg" className="w-full" disabled>
                  Coming Soon
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-8 px-4">
          <div className="container mx-auto text-center">
            <p>&copy; {new Date().getFullYear()} Nhắc Lịch Âm. </p>
            <p className="text-sm mt-2">
              Một dự án của{" "}
              <a
                href="https://hophamlam.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:underline"
              >
                HPL
              </a>
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <a
                href="https://github.com/hophamlam/nhaclicham-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                <Github />
              </a>
              <a href="#" className="hover:text-white">
                <Facebook />
              </a>
              <a href="#" className="hover:text-white">
                <Gamepad2 />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
