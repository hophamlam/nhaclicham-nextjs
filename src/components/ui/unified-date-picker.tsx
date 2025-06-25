"use client";

import * as React from "react";
import { format, parse, isValid, differenceInCalendarDays } from "date-fns";
import { Sun, Moon, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { LunarDatePicker } from "@/components/ui/lunar-date-picker";
import { LunarService } from "@/lib/lunarService";
import { type LunarDate } from "@/types/reminder";

interface UnifiedDatePickerProps {
  // Control props
  isLunar: boolean;
  onToggleLunar: (isLunar: boolean) => void;

  // Solar date props
  solarDate: string;
  onSolarDateChange: (date: string) => void;

  // Lunar date props
  lunarDate: LunarDate;
  onLunarDateChange: (date: LunarDate) => void;

  // Style props
  className?: string;
  showGuidance?: boolean;
  showPreview?: boolean;
}

/**
 * Component UnifiedDatePicker kết hợp picker dương lịch và âm lịch
 * Có switch để chuyển đổi giữa 2 loại lịch + preview unified suggestions
 */
export function UnifiedDatePicker({
  isLunar,
  onToggleLunar,
  solarDate,
  onSolarDateChange,
  lunarDate,
  onLunarDateChange,
  className,
  showGuidance = true,
  showPreview = true,
}: UnifiedDatePickerProps) {
  const [unifiedSuggestion, setUnifiedSuggestion] = React.useState<string>("");

  // Calculate unified suggestion with selected date + upcoming/past
  React.useEffect(() => {
    const calculateUnifiedSuggestion = async () => {
      const today = new Date();
      const parts: string[] = [];

      try {
        if (isLunar && lunarDate.day && lunarDate.month) {
          // Current selected lunar date
          const selectedLunarFormatted = `${lunarDate.day}/${lunarDate.month}`;
          const yearPart = lunarDate.year ? ` năm ${lunarDate.year}` : "";
          const leapPart = lunarDate.isLeapMonth ? " (nhuận)" : "";

          parts.push(
            `🌙 Đã chọn: ${selectedLunarFormatted}${yearPart}${leapPart}`
          );

          // Helper to get next/prev occurrence
          const calculateOccurrences = (
            day: number,
            month: number,
            isLeap: boolean
          ) => {
            const currentYear = today.getFullYear();

            let thisYearSolar: Date | null = null;
            try {
              thisYearSolar = LunarService.convertLunarToSolar(
                day,
                month,
                currentYear,
                isLeap
              );
            } catch {
              // Leap month doesn't exist this year
            }

            let future: Date;
            let past: Date;

            if (thisYearSolar && thisYearSolar >= today) {
              future = thisYearSolar;
              past = LunarService.convertLunarToSolar(
                day,
                month,
                currentYear - 1,
                isLeap
              );
            } else if (thisYearSolar && thisYearSolar < today) {
              past = thisYearSolar;
              future = LunarService.convertLunarToSolar(
                day,
                month,
                currentYear + 1,
                isLeap
              );
            } else {
              // Current year doesn't have this leap month
              future = LunarService.convertLunarToSolar(
                day,
                month,
                currentYear + 1,
                isLeap
              );
              past = LunarService.convertLunarToSolar(
                day,
                month,
                currentYear - 1,
                isLeap
              );
            }

            return { future, past };
          };

          const { future, past } = calculateOccurrences(
            lunarDate.day,
            lunarDate.month,
            lunarDate.isLeapMonth || false
          );

          const futureDiff = differenceInCalendarDays(future, today);
          const pastDiff = differenceInCalendarDays(today, past);

          // Add upcoming and past
          if (futureDiff === 0) {
            parts.push(`🎯 Hôm nay: ${format(future, "dd/MM/yyyy")}`);
          } else if (futureDiff > 0) {
            parts.push(
              `📅 Sắp đến: ${format(future, "dd/MM/yyyy")} (${futureDiff} ngày nữa)`
            );
          }

          if (pastDiff > 0) {
            parts.push(
              `⏪ Gần nhất: ${format(past, "dd/MM/yyyy")} (${pastDiff} ngày trước)`
            );
          }
        } else if (!isLunar && solarDate) {
          // Solar date handling
          const solarDateObj = parse(solarDate, "yyyy-MM-dd", new Date());
          if (isValid(solarDateObj)) {
            parts.push(`☀️ Đã chọn: ${format(solarDateObj, "dd/MM/yyyy")}`);

            const diffDays = differenceInCalendarDays(solarDateObj, today);

            if (diffDays === 0) {
              parts.push(`🎯 Hôm nay`);
            } else if (diffDays > 0) {
              parts.push(`📅 Còn ${diffDays} ngày nữa`);
            } else {
              parts.push(`⏪ Đã qua ${Math.abs(diffDays)} ngày`);
            }

            // Add lunar equivalent
            try {
              const lunarEquivalent =
                LunarService.convertSolarToLunar(solarDateObj);
              const lunarFormatted =
                LunarService.formatLunarDate(lunarEquivalent);
              parts.push(`🌙 Âm lịch: ${lunarFormatted}`);
            } catch {
              // Ignore lunar conversion errors
            }
          }
        }
      } catch (error) {
        console.error("Error calculating suggestions:", error);
        parts.push("⚠️ Không thể tính toán gợi ý");
      }

      setUnifiedSuggestion(parts.join("\n"));
    };

    calculateUnifiedSuggestion();
  }, [isLunar, solarDate, lunarDate]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Switch calendar type */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Label className="text-sm font-medium">Chọn loại lịch:</Label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isLunar || false}
              onChange={(e) => onToggleLunar(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
          <button
            type="button"
            onClick={() => onToggleLunar(!isLunar)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              isLunar
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {isLunar ? (
              <>
                <Moon className="h-4 w-4" />
                Âm lịch
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                Dương lịch
              </>
            )}
          </button>
        </div>

        {/* Guidance info */}
        {showGuidance && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-400 dark:border-blue-600">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">
                  Chọn loại lịch để xác định ngày của sự kiện. Khuyến nghị:
                </p>
                <ul className="list-disc list-inside text-xs mt-1">
                  <li>
                    Nếu sự kiện diễn ra đã lâu, sử dụng Âm lịch (ngày giỗ,...).
                  </li>
                  <li>
                    Nếu sự kiện diễn ra gần đây, hãy sử dụng Dương Lịch tương
                    đương (tang, em bé vừa chào đời,...).
                  </li>
                  <li>
                    Nếu sự kiện diễn ra vào tháng nhuận âm lịch, hãy sử dụng
                    Dương Lịch tương đương.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Date picker based on type */}
      <div className="space-y-2">
        {isLunar ? (
          <LunarDatePicker
            value={{
              day: lunarDate.day || 1,
              month: lunarDate.month || 1,
              year: lunarDate.year || new Date().getFullYear(),
              isLeapMonth: lunarDate.isLeapMonth || false,
            }}
            onChange={onLunarDateChange}
          />
        ) : (
          <DatePicker
            value={solarDate || ""}
            onChange={onSolarDateChange}
            placeholder="Chọn ngày dương lịch"
          />
        )}
      </div>

      {/* Unified suggestion box với breaklines */}
      {showPreview && unifiedSuggestion && (
        <div className="bg-muted/50 p-3 rounded-md text-sm space-y-1">
          {unifiedSuggestion.split("\n").map((line, index) => (
            <p key={index} className="text-muted-foreground">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
