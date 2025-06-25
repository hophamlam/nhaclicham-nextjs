import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LunarService } from "@/lib/lunarService";

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeapMonth: boolean;
}

interface LunarDatePickerProps {
  value?: LunarDate;
  onChange: (date: LunarDate) => void;
  disabled?: boolean;
  showYear?: boolean; // Có hiển thị picker năm không
  className?: string;
}

/**
 * Component picker cho ngày âm lịch
 * Hỗ trợ chọn ngày, tháng, năm và tháng nhuận
 */
export function LunarDatePicker({
  value,
  onChange,
  disabled = false,
  showYear = true,
  className = "",
}: LunarDatePickerProps) {
  const currentYear = new Date().getFullYear();
  const [selectedDay, setSelectedDay] = useState(value?.day || 1);
  const [selectedMonth, setSelectedMonth] = useState(value?.month || 1);
  const [selectedYear, setSelectedYear] = useState(value?.year || currentYear);
  const [isLeapMonth, setIsLeapMonth] = useState(value?.isLeapMonth || false);
  const [leapMonths, setLeapMonths] = useState<number[]>([]);

  // Load tháng nhuận cho năm được chọn
  useEffect(() => {
    const loadLeapMonths = async () => {
      try {
        const leaps = LunarService.getLeapMonths(selectedYear);
        setLeapMonths(leaps);

        // Reset leap month nếu tháng hiện tại không phải tháng nhuận
        if (!leaps.includes(selectedMonth)) {
          setIsLeapMonth(false);
        }
      } catch (error) {
        console.error("Lỗi load tháng nhuận:", error);
        setLeapMonths([]);
        setIsLeapMonth(false);
      }
    };

    loadLeapMonths();
  }, [selectedYear, selectedMonth]);

  // Trigger onChange khi có thay đổi (bỏ onChange khỏi dependencies để tránh infinite loop)
  useEffect(() => {
    onChange({
      day: selectedDay,
      month: selectedMonth,
      year: selectedYear,
      isLeapMonth: isLeapMonth,
    });
  }, [selectedDay, selectedMonth, selectedYear, isLeapMonth]);

  // Tên tháng âm lịch
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

  // Tính số ngày tối đa trong tháng âm lịch
  const getMaxDaysInMonth = () => {
    // Âm lịch: tháng có thể có 29 hoặc 30 ngày
    // Để đơn giản, cho phép chọn 1-30, validation sẽ ở backend
    return 30;
  };

  const maxDays = getMaxDaysInMonth();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        {/* Ngày */}
        <div>
          <Label className="text-sm font-medium">Ngày âm lịch</Label>
          <Select
            value={selectedDay.toString()}
            onValueChange={(value) => setSelectedDay(parseInt(value))}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn ngày" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: maxDays }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tháng */}
        <div>
          <Label className="text-sm font-medium">Tháng âm lịch</Label>
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.slice(1).map((name, index) => {
                const monthNumber = index + 1;
                return (
                  <SelectItem key={monthNumber} value={monthNumber.toString()}>
                    {name} ({monthNumber})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Năm (optional) */}
      {showYear && (
        <div>
          <Label className="text-sm font-medium">Năm âm lịch</Label>
          <Input
            type="number"
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(parseInt(e.target.value) || currentYear)
            }
            disabled={disabled}
            min={currentYear - 10}
            max={currentYear + 10}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Mặc định: {currentYear} (năm hiện tại)
          </p>
        </div>
      )}

      {/* Tháng nhuận */}
      {leapMonths.includes(selectedMonth) && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="leap-month"
            checked={isLeapMonth}
            onChange={(e) => setIsLeapMonth(e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
          />
          <Label htmlFor="leap-month" className="text-sm">
            Tháng {monthNames[selectedMonth]} nhuận
          </Label>
        </div>
      )}
    </div>
  );
}
