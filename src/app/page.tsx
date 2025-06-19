"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Bell } from "lucide-react";
import Link from "next/link";
import { LunarService } from "@/lib/lunarService";
import { ReminderService } from "@/lib/reminderService";
import { Reminder } from "@/types/reminder";

export default function HomePage() {
  const [lunarDate, setLunarDate] = useState<string>("");
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get today's lunar date
    const today = LunarService.getTodayLunarDate();
    setLunarDate(`${today.day}/${today.month}/${today.year}`);

    // Load today's reminders
    loadTodayReminders();
  }, []);

  const loadTodayReminders = async () => {
    try {
      const reminders = await ReminderService.getTodayReminders();
      setTodayReminders(reminders);
    } catch (error) {
      console.error("Error loading reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Nhắc Lịch Âm</h1>
        <p className="text-muted-foreground">Nhắc nhở theo lịch âm Việt Nam</p>
      </div>

      {/* Today's Lunar Date */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Ngày âm lịch</p>
            <p className="text-4xl font-bold text-red-600 mb-2">{lunarDate}</p>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Reminders */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Lời nhắc hôm nay
          </CardTitle>
          <CardDescription>
            {loading ? "Đang tải..." : `${todayReminders.length} lời nhắc`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          ) : todayReminders.length > 0 ? (
            <div className="space-y-3">
              {todayReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-3 bg-white rounded-lg border shadow-sm"
                >
                  <p className="font-medium">{reminder.note}</p>
                  <p className="text-sm text-muted-foreground">
                    Ngày {reminder.lunar_day}/{reminder.lunar_month}
                    {reminder.repeat_every_year && " • Hàng năm"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Không có lời nhắc nào cho hôm nay
              </p>
              <Link href="/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo lời nhắc mới
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-4 justify-center">
        <Link href="/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tạo lời nhắc
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline">Hồ sơ của tôi</Button>
        </Link>
      </div>
    </div>
  );
}
