"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Moon, Sun, Clock, Info } from "lucide-react";
import { LunarService } from "@/lib/lunarService";
import { LunarDetailInfo } from "@/types/reminder";

interface LunarCalendarCardProps {
  className?: string;
}

/**
 * Component hiển thị thông tin lịch âm hôm nay với thông tin tháng nhuận chi tiết
 * Sử dụng LunarService để lấy thông tin chính xác từ thư viện @nghiavuive/lunar_date_vi
 * Hiển thị cụ thể thông tin tháng nhuận trong năm và đánh dấu tháng hiện tại
 */
export default function LunarCalendarCard({
  className = "",
}: LunarCalendarCardProps) {
  const [todayLunar, setTodayLunar] = useState<LunarDetailInfo | null>(null);
  const [leapMonthInfo, setLeapMonthInfo] = useState<{
    hasLeapYear: boolean;
    leapMonths: number[];
    currentMonthIsLeap: boolean;
    leapMonthDetails: string;
  }>({
    hasLeapYear: false,
    leapMonths: [],
    currentMonthIsLeap: false,
    leapMonthDetails: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTooltip, setShowTooltip] = useState(false);

  // Cập nhật thời gian thực mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLunarData = () => {
      try {
        setIsLoading(true);

        // Lấy thông tin chi tiết âm lịch hôm nay
        const today = new Date();
        const lunarDetailInfo = LunarService.getLunarDetailInfo(today);

        if (lunarDetailInfo) {
          console.log("Thông tin âm lịch chi tiết:", lunarDetailInfo);
          setTodayLunar(lunarDetailInfo);

          // Lấy thông tin tháng nhuận trong năm
          const currentYear = lunarDetailInfo.lunarDate.year;
          const leapMonths = LunarService.getLeapMonths(currentYear);
          const hasLeapYear = leapMonths.length > 0;
          const currentMonthIsLeap =
            lunarDetailInfo.lunarDate.isLeapMonth || false;

          // Tạo thông tin chi tiết về tháng nhuận
          let leapMonthDetails = "";
          if (hasLeapYear && leapMonths.length > 0 && lunarDetailInfo) {
            const monthNames = [
              "",
              "Giêng",
              "Hai",
              "Ba",
              "Tư",
              "Năm",
              "Sáu",
              "Bảy",
              "Tám",
              "Chín",
              "Mười",
              "Mười một",
              "Chạp",
            ];
            const leapMonth = leapMonths[0]; // Thường chỉ có 1 tháng nhuận
            const monthName = monthNames[leapMonth] || `tháng ${leapMonth}`;

            // Tính toán ngày dương lịch của tháng chuẩn (leap_month: false)
            try {
              const normalMonthStart = LunarService.convertLunarToSolar(
                1,
                leapMonth,
                currentYear,
                false
              );
              const normalMonthEnd = LunarService.convertLunarToSolar(
                30,
                leapMonth,
                currentYear,
                false
              );

              // Tính toán ngày dương lịch của tháng nhuận (leap_month: true)
              const leapMonthStart = LunarService.convertLunarToSolar(
                1,
                leapMonth,
                currentYear,
                true
              );
              const leapMonthEnd = LunarService.convertLunarToSolar(
                29,
                leapMonth,
                currentYear,
                true
              );

              leapMonthDetails = `Năm ${lunarDetailInfo.yearName} (${currentYear}) có tháng ${monthName} nhuận:\n• Tháng ${monthName} chuẩn: ${normalMonthStart.toLocaleDateString("vi-VN")} - ${normalMonthEnd.toLocaleDateString("vi-VN")}.\n• Tháng ${monthName} nhuận: ${leapMonthStart.toLocaleDateString("vi-VN")} - ${leapMonthEnd.toLocaleDateString("vi-VN")}.\n• Trong năm này sẽ có hai tháng ${monthName} âm lịch.`;
            } catch (error) {
              leapMonthDetails = `Năm ${lunarDetailInfo.yearName} (${currentYear}) có tháng ${monthName} nhuận.`;
            }
          }

          setLeapMonthInfo({
            hasLeapYear,
            leapMonths,
            currentMonthIsLeap,
            leapMonthDetails,
          });

          console.log("Thông tin tháng nhuận:", {
            hasLeapYear,
            leapMonths,
            currentMonthIsLeap,
            leapMonthDetails,
          });
        } else {
          console.error("Không thể lấy thông tin âm lịch");
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu âm lịch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLunarData();
  }, []);

  // Component loading
  if (isLoading || !todayLunar) {
    return (
      <Card className={`lunar-card shadow-lg ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-red-800 dark:text-red-300">
            <Moon className="h-8 w-8 text-red-600 dark:text-red-400" />
            <span>Lịch âm hôm nay</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              {isLoading ? "Đang tải..." : "Không thể tải thông tin âm lịch"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format thời gian hiện tại
  const currentTimeFormatted = currentTime.toLocaleTimeString("vi-VN", {
    hour12: false, // Định dạng 24h
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Lấy ngày dương lịch hiện tại để hiển thị
  const solarDateFormatted = currentTime.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className={`lunar-card shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl text-red-800 dark:text-red-300">
          <Moon className="h-8 w-8 text-red-600 dark:text-red-400" />
          <span>Lịch âm hôm nay</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          {/* Ngày âm lịch chính */}
          <p className="lunar-date mb-2">
            Ngày {todayLunar.lunarDate.day} tháng {todayLunar.lunarDate.month}
            {leapMonthInfo.currentMonthIsLeap && (
              <span className="text-orange-600 dark:text-orange-400">
                {" "}
                (nhuận)
              </span>
            )}
          </p>

          {/* Năm can chi với tooltip thông tin tháng nhuận */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-xl text-red-700 dark:text-red-300 font-medium">
              Năm {todayLunar.yearName} ({todayLunar.lunarDate.year})
            </p>
            {leapMonthInfo.hasLeapYear && (
              <div className="relative">
                <Info
                  className="h-4 w-4 text-orange-600 dark:text-orange-400 cursor-help"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-popover text-popover-foreground text-sm rounded-lg w-96 z-[100] shadow-xl border pointer-events-none">
                    <div className="whitespace-pre-line leading-relaxed text-left">
                      {leapMonthInfo.leapMonthDetails}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Đánh dấu nếu tháng hiện tại là tháng nhuận */}
          {leapMonthInfo.currentMonthIsLeap && (
            <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-2">
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 rounded-full text-xs">
                Đây là tháng nhuận
              </span>
            </p>
          )}

          {/* Thông tin can chi chi tiết */}
          <div className="space-y-1 mb-4 text-sm text-red-600 dark:text-red-400">
            <p>
              Tháng {todayLunar.monthName} • Ngày {todayLunar.dayName}
            </p>
            {todayLunar.solarTerm && (
              <p className="text-orange-600 dark:text-orange-400 font-medium">
                Tiết khí: {todayLunar.solarTerm}
              </p>
            )}
          </div>

          {/* Ngày dương lịch */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground border-t border-red-200/50 dark:border-red-800/50 pt-3">
            <Sun className="h-4 w-4" />
            <span>{solarDateFormatted}</span>
          </div>

          {/* Giờ hoàng đạo (nếu có) */}
          {todayLunar.luckyHours && todayLunar.luckyHours.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                {currentTimeFormatted} - Giờ hoàng đạo hôm nay:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {todayLunar.luckyHours.map((hour, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs"
                  >
                    {hour.name} ({hour.time[0]}h-{hour.time[1]}h)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
