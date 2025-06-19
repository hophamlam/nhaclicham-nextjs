import { LunarDate } from "@/types/reminder";

export class LunarService {
  /**
   * Get today's lunar date (using actual current date)
   */
  static getTodayLunarDate(): LunarDate {
    const today = new Date();

    // For demo purposes, use a reasonable lunar date based on current date
    // In production, you'd use the actual lunar calendar library
    const solarDay = today.getDate();
    const solarMonth = today.getMonth() + 1;
    const solarYear = today.getFullYear();

    // Simple approximation - in production use proper lunar calendar conversion
    const lunarDay = Math.max(1, Math.min(30, solarDay));
    const lunarMonth = solarMonth;
    const lunarYear = solarYear - 621; // Approximate lunar year offset

    return {
      day: lunarDay,
      month: lunarMonth,
      year: lunarYear,
    };
  }

  /**
   * Convert solar date to lunar date (simplified but more realistic)
   */
  static convertSolarToLunar(date: Date): LunarDate {
    // More realistic conversion based on actual date
    const solarDay = date.getDate();
    const solarMonth = date.getMonth() + 1;
    const solarYear = date.getFullYear();

    // Simple approximation that makes more sense
    const lunarDay = Math.max(1, Math.min(30, solarDay));
    const lunarMonth = solarMonth;
    const lunarYear = solarYear - 621;

    return {
      day: lunarDay,
      month: lunarMonth,
      year: lunarYear,
    };
  }

  /**
   * Convert lunar date to solar date (simplified)
   */
  static convertLunarToSolar(
    lunarDay: number,
    lunarMonth: number,
    lunarYear: number
  ): Date {
    // Simplified conversion
    const solarYear = lunarYear + 621;
    const solarMonth = lunarMonth;
    const solarDay = lunarDay;

    return new Date(solarYear, solarMonth - 1, solarDay);
  }

  /**
   * Check if a reminder should be shown today
   */
  static shouldShowReminderToday(
    reminderLunarDay: number,
    reminderLunarMonth: number
  ): boolean {
    const today = this.getTodayLunarDate();
    return today.day === reminderLunarDay && today.month === reminderLunarMonth;
  }

  /**
   * Format lunar date to string
   */
  static formatLunarDate(lunarDate: LunarDate): string {
    return `${lunarDate.day}/${lunarDate.month}/${lunarDate.year}`;
  }

  /**
   * Get lunar date display text
   */
  static getLunarDateText(lunarDate: LunarDate): string {
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

    return `Ngày ${lunarDate.day} tháng ${monthNames[lunarDate.month]} năm ${
      lunarDate.year
    }`;
  }
}
