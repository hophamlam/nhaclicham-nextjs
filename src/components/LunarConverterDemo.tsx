"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, CalendarDays, Info } from "lucide-react";
import { LunarService } from "@/lib/lunarService";
import { LunarDate, LunarDetailInfo } from "@/types/reminder";

/**
 * Component demo để showcase các tính năng của thư viện @nghiavuive/lunar_date_vi
 * Cho phép chuyển đổi giữa dương lịch và âm lịch, xem thông tin chi tiết
 */
export default function LunarConverterDemo() {
  const [solarDate, setSolarDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [lunarDate, setLunarDate] = useState<LunarDate | null>(null);
  const [lunarDetailInfo, setLunarDetailInfo] =
    useState<LunarDetailInfo | null>(null);
  const [error, setError] = useState<string>("");

  // Chuyển đổi từ dương lịch sang âm lịch
  const handleSolarToLunar = () => {
    try {
      setError("");
      const date = new Date(solarDate);

      // Kiểm tra ngày hợp lệ
      if (isNaN(date.getTime())) {
        setError("Ngày dương lịch không hợp lệ");
        return;
      }

      // Chuyển đổi
      const lunar = LunarService.convertSolarToLunar(date);
      const detail = LunarService.getLunarDetailInfo(date);

      setLunarDate(lunar);
      setLunarDetailInfo(detail);
    } catch (err) {
      console.error("Lỗi chuyển đổi:", err);
      setError("Có lỗi xảy ra khi chuyển đổi");
    }
  };

  // Reset form
  const handleReset = () => {
    setSolarDate(new Date().toISOString().split("T")[0]);
    setLunarDate(null);
    setLunarDetailInfo(null);
    setError("");
  };

  // Lấy thông tin hôm nay
  const handleToday = () => {
    const today = new Date();
    setSolarDate(today.toISOString().split("T")[0]);
    handleSolarToLunar();
  };

  return (
    <div className="space-y-6">
      {/* Card chuyển đổi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            Chuyển đổi Dương lịch ↔ Âm lịch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input ngày dương lịch */}
          <div className="space-y-2">
            <Label htmlFor="solar-date">Ngày dương lịch:</Label>
            <div className="flex gap-2">
              <Input
                id="solar-date"
                type="date"
                value={solarDate}
                onChange={(e) => setSolarDate(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSolarToLunar} className="px-6">
                Chuyển đổi
              </Button>
            </div>
          </div>

          {/* Buttons tiện ích */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleToday} size="sm">
              Hôm nay
            </Button>
            <Button variant="outline" onClick={handleReset} size="sm">
              Reset
            </Button>
          </div>

          {/* Hiển thị lỗi */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card kết quả âm lịch */}
      {lunarDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-red-600" />
              Kết quả Âm lịch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ngày âm lịch cơ bản */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-2xl font-bold text-red-700 mb-2">
                {LunarService.getLunarDateText(lunarDate)}
              </p>
              <p className="text-sm text-red-600">
                Định dạng: {LunarService.formatLunarDate(lunarDate)}
              </p>
              {lunarDate.isLeapYear && (
                <p className="text-sm text-orange-600 mt-1">
                  ✨ Năm nhuận âm lịch
                </p>
              )}
            </div>

            {/* Thông tin chi tiết */}
            {lunarDetailInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Can Chi */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Can Chi
                  </h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>
                      <strong>Năm:</strong> {lunarDetailInfo.yearName}
                    </p>
                    <p>
                      <strong>Tháng:</strong> {lunarDetailInfo.monthName}
                    </p>
                    <p>
                      <strong>Ngày:</strong> {lunarDetailInfo.dayName}
                    </p>
                    <p>
                      <strong>Giờ:</strong> {lunarDetailInfo.hourName}
                    </p>
                  </div>
                </div>

                {/* Thông tin khác */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Thông tin khác
                  </h4>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>
                      <strong>Thứ:</strong> {lunarDetailInfo.dayOfWeek}
                    </p>
                    {lunarDetailInfo.solarTerm && (
                      <p>
                        <strong>Tiết khí:</strong> {lunarDetailInfo.solarTerm}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Giờ hoàng đạo */}
            {lunarDetailInfo?.luckyHours &&
              lunarDetailInfo.luckyHours.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-3">
                    🌟 Giờ hoàng đạo trong ngày:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {lunarDetailInfo.luckyHours.map((hour, index) => (
                      <div
                        key={index}
                        className="p-2 bg-yellow-100 text-yellow-800 rounded text-center"
                      >
                        <div className="font-semibold">{hour.name}</div>
                        <div className="text-xs">
                          {hour.time[0]}:00 - {hour.time[1]}:00
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    💡 Các giờ hoàng đạo thích hợp cho việc khởi sự, làm việc
                    quan trọng
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Card hướng dẫn */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📚 Hướng dẫn sử dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • Chọn ngày dương lịch và nhấn "Chuyển đổi" để xem thông tin âm
              lịch tương ứng
            </p>
            <p>
              • Thông tin bao gồm: ngày âm lịch, can chi, tiết khí, giờ hoàng
              đạo
            </p>
            <p>
              • Sử dụng thư viện{" "}
              <code className="bg-gray-100 px-1 rounded">
                @nghiavuive/lunar_date_vi
              </code>{" "}
              cho độ chính xác cao
            </p>
            <p>• Hỗ trợ năm nhuận và tháng nhuận âm lịch</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
