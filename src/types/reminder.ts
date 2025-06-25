export interface Reminder {
  id: string;
  title: string;
  description?: string | null;
  isLunar: boolean;
  isLeapMonth?: boolean | null;
  lunarDay?: number | null;
  lunarMonth?: number | null;
  lunarYear?: number | null;
  repeatYearly?: boolean | null;
  solarDate?: string | null;
  preferredAdvanceDays?: number | null;
}

export interface CreateReminderInput {
  user_id: string;
  note: string;
  lunar_day: number;
  lunar_month: number;
  repeat_every_year: boolean;
  repeatYearly?: boolean;
}

/**
 * Interface cho ngày âm lịch trong hệ thống
 */
export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeapMonth?: boolean; // Có phải tháng nhuận không
  isLeapYear?: boolean; // Có phải năm nhuận không
}

/**
 * Interface cho thông tin chi tiết âm lịch (bao gồm can chi, tiết khí, v.v.)
 */
export interface LunarDetailInfo {
  lunarDate: LunarDate;
  yearName: string; // Tên năm theo can chi (VD: Quý Mão)
  monthName: string; // Tên tháng theo can chi
  dayName: string; // Tên ngày theo can chi
  hourName: string; // Tên giờ theo can chi
  dayOfWeek: string; // Thứ trong tuần
  solarTerm: string; // Tiết khí (VD: Mang chủng)
  luckyHours: Array<{
    // Giờ hoàng đạo
    name: string;
    time: number[];
  }>;
}
