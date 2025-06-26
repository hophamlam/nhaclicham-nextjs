"use client";

import { createClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, Plus, Users, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import LunarCalendarCard from "@/components/LunarCalendarCard";

export const dynamic = "force-dynamic";

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  notificationProviders: number;
  recentEvents: any[];
}

/**
 * Trang Dashboard chính cho user đã đăng nhập
 * Hiển thị thống kê và overview của hệ thống
 */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    notificationProviders: 0,
    recentEvents: [],
  });

  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Fetch total events
        const { count: totalEvents } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Fetch recent events (top 5)
        const { data: recentEvents } = await supabase
          .from("events")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch notification providers count
        const { count: notificationProvidersCount } = await supabase
          .from("notification_providers")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        setStats({
          totalEvents: totalEvents || 0,
          upcomingEvents: 0, // TODO: Calculate upcoming events
          notificationProviders: notificationProvidersCount || 0,
          recentEvents: recentEvents || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  // Tạm thời comment quickStats vì đã ẩn UI
  /*
  const quickStats = [
    {
      title: "Tổng sự kiện",
      value: stats.totalEvents,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Sự kiện sắp tới",
      value: stats.upcomingEvents,
      icon: Clock,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Kênh thông báo",
      value: stats.notificationProviders,
      icon: Bell,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Hoạt động",
      value: "Tốt",
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];
  */

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Tổng quan hệ thống nhắc lịch âm của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Today's Lunar Date */}
      <LunarCalendarCard />

      {/* Quick Stats - Tạm thời ẩn */}
      {/* 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      */}

      {/* Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sự kiện gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentEvents.length > 0 ? (
              <div className="space-y-3">
                {stats.recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {event.note}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.is_lunar ? "Âm lịch" : "Dương lịch"}
                        {event.is_lunar && (
                          <span>
                            {" "}
                            - {event.lunar_day}/{event.lunar_month}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                ))}
                <Link href="/app/events">
                  <Button variant="outline" className="w-full mt-4">
                    Xem tất cả sự kiện
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground">Chưa có sự kiện nào</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo sự kiện đầu tiên
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Thông báo và cài đặt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900 dark:text-blue-200">
                    Kênh thông báo
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {stats.notificationProviders > 0
                      ? `${stats.notificationProviders} kênh đã cấu hình`
                      : "Chưa có kênh thông báo nào"}
                  </p>
                </div>
                <Link href="/app/notification-providers">
                  <Button size="sm">Cấu hình</Button>
                </Link>
              </div>
            </div>

            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 dark:text-green-200">
                    Hồ sơ của bạn
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Quản lý thông tin cá nhân
                  </p>
                </div>
                <Link href="/app/profile">
                  <Button size="sm" variant="outline">
                    Xem
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
