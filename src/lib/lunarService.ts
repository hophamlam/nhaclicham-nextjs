import {
  SolarDate,
  LunarDate as LunarCalendarDate,
} from "@nghiavuive/lunar_date_vi";
import { LunarDate, LunarDetailInfo } from "@/types/reminder";

/**
 * Service xử lý chuyển đổi và thao tác với lịch âm Việt Nam
 * Sử dụng thư viện @nghiavuive/lunar_date_vi để chuyển đổi chính xác
 */
export class LunarService {
  /**
   * Lấy ngày âm lịch hôm nay (sử dụng ngày hiện tại thực)
   * @returns {LunarDate} Ngày âm lịch hôm nay
   */
  static getTodayLunarDate(): LunarDate {
    const today = new Date();
    return this.convertSolarToLunar(today);
  }

  /**
   * Chuyển đổi từ dương lịch sang âm lịch
   * @param {Date} date - Ngày dương lịch cần chuyển đổi
   * @returns {LunarDate} Ngày âm lịch tương ứng
   */
  static convertSolarToLunar(date: Date): LunarDate {
    try {
      // Tạo instance SolarDate từ Date object
      const solarDate = new SolarDate(date);

      // Chuyển đổi sang âm lịch
      const lunarCalendarDate = solarDate.toLunarDate();

      // Sử dụng method get() để lấy thông tin public
      const lunarInfo = lunarCalendarDate.get();

      return {
        day: lunarInfo.day,
        month: lunarInfo.month,
        year: lunarInfo.year,
        isLeapMonth: lunarInfo.leap_month || false,
        isLeapYear: lunarInfo.leap_year || false,
      };
    } catch (error) {
      console.error("Lỗi chuyển đổi dương lịch sang âm lịch:", error);
      // Fallback về ngày hiện tại nếu có lỗi
      const fallbackDay = date.getDate();
      const fallbackMonth = date.getMonth() + 1;
      const fallbackYear = date.getFullYear() - 621;

      return {
        day: Math.max(1, Math.min(30, fallbackDay)),
        month: fallbackMonth,
        year: fallbackYear,
        isLeapMonth: false,
        isLeapYear: false,
      };
    }
  }

  /**
   * Chuyển đổi từ âm lịch sang dương lịch
   * @param {number} lunarDay - Ngày âm lịch
   * @param {number} lunarMonth - Tháng âm lịch
   * @param {number} lunarYear - Năm âm lịch
   * @param {boolean} isLeapMonth - Có phải tháng nhuận không (mặc định false)
   * @returns {Date} Ngày dương lịch tương ứng
   */
  static convertLunarToSolar(
    lunarDay: number,
    lunarMonth: number,
    lunarYear: number,
    isLeapMonth: boolean = false
  ): Date {
    try {
      // Tạo instance LunarDate
      const lunarDate = new LunarCalendarDate({
        day: lunarDay,
        month: lunarMonth,
        year: lunarYear,
        leap_month: isLeapMonth,
      });

      // Khởi tạo và chuyển đổi sang dương lịch
      lunarDate.init();
      const solarDate = lunarDate.toSolarDate();

      // Sử dụng method get() để lấy thông tin public
      const solarInfo = solarDate.get();

      return new Date(solarInfo.year, solarInfo.month - 1, solarInfo.day);
    } catch (error) {
      console.error("Lỗi chuyển đổi âm lịch sang dương lịch:", error);
      // Fallback về ngày gần đúng
      const solarYear = lunarYear + 621;
      return new Date(solarYear, lunarMonth - 1, lunarDay);
    }
  }

  /**
   * Tính ngày âm lịch sắp tới gần nhất (next occurrence)
   * Hàm re-usable để tính toán ngày thông báo
   *
   * @param {number} lunarDay - Ngày âm lịch (1-30)
   * @param {number} lunarMonth - Tháng âm lịch (1-12)
   * @param {boolean} isLeapMonth - Có phải tháng nhuận không
   * @param {Date} referenceDate - Ngày tham chiếu (mặc định là hôm nay)
   * @returns {Date} Ngày dương lịch sắp tới gần nhất
   */
  static getNextLunarOccurrence(
    lunarDay: number,
    lunarMonth: number,
    isLeapMonth: boolean = false,
    referenceDate: Date = new Date()
  ): Date {
    const currentYear = referenceDate.getFullYear();

    try {
      // Thử tính với năm hiện tại
      const thisYearDate = this.convertLunarToSolar(
        lunarDay,
        lunarMonth,
        currentYear,
        isLeapMonth
      );

      // Nếu ngày trong năm nay chưa qua, trả về ngày đó
      if (thisYearDate >= referenceDate) {
        return thisYearDate;
      }

      // Nếu đã qua, tính với năm sau
      return this.convertLunarToSolar(
        lunarDay,
        lunarMonth,
        currentYear + 1,
        isLeapMonth
      );
    } catch (error) {
      // Nếu năm hiện tại không có tháng nhuận tương ứng
      // hoặc có lỗi khác, thử với năm sau
      try {
        return this.convertLunarToSolar(
          lunarDay,
          lunarMonth,
          currentYear + 1,
          isLeapMonth
        );
      } catch (nextYearError) {
        // Fallback: trả về ngày hiện tại nếu không tính được
        console.error("Không thể tính ngày âm lịch sắp tới:", {
          lunarDay,
          lunarMonth,
          isLeapMonth,
          currentYear,
          error,
          nextYearError,
        });
        return referenceDate;
      }
    }
  }

  /**
   * Tính ngày thông báo dựa trên eventInfo và notification settings
   * Logic phức tạp xử lý 4 trường hợp:
   * 1. Lunar event + yearly repeat = false → Dùng converted solar date
   * 2. Solar event + yearly repeat = false → Dùng solar date gốc
   * 3. Lunar event + yearly repeat = true → Dùng lunar date với current year
   * 4. Solar event + yearly repeat = true → Convert sang lunar rồi dùng current year
   *
   * @param eventInfo - Thông tin sự kiện
   * @param isYearlyLunarRepeat - Có lặp lại hàng năm theo âm lịch không
   * @param referenceDate - Ngày tham chiếu (mặc định hôm nay)
   * @returns Ngày dương lịch để tính toán thông báo
   */
  static calculateNotificationBaseDate(
    eventInfo: {
      isLunar: boolean;
      lunarDay: number | "";
      lunarMonth: number | "";
      lunarYear: number | "";
      isLeapMonth: boolean;
      solarDate: string;
    },
    isYearlyLunarRepeat: boolean,
    referenceDate: Date = new Date()
  ): Date {
    if (eventInfo.isLunar) {
      // Event dựa trên âm lịch
      const lunarDay = Number(eventInfo.lunarDay);
      const lunarMonth = Number(eventInfo.lunarMonth);
      const lunarYear = eventInfo.lunarYear
        ? Number(eventInfo.lunarYear)
        : referenceDate.getFullYear();

      if (!isYearlyLunarRepeat) {
        // Trường hợp 1: Lunar event + yearly repeat = false
        // → Sử dụng dương converted để làm ngày tính toán
        try {
          return this.convertLunarToSolar(
            lunarDay,
            lunarMonth,
            lunarYear,
            eventInfo.isLeapMonth
          );
        } catch (error) {
          console.error("Error converting lunar to solar (case 1):", error);
          return referenceDate;
        }
      } else {
        // Trường hợp 3: Lunar event + yearly repeat = true
        // → Sử dụng lunar_date với current_year, is_leap = false
        return this.getNextLunarOccurrence(
          lunarDay,
          lunarMonth,
          false,
          referenceDate
        );
      }
    } else {
      // Event dựa trên dương lịch
      const solarDate = new Date(eventInfo.solarDate);

      if (!isYearlyLunarRepeat) {
        // Trường hợp 2: Solar event + yearly repeat = false
        // → Sử dụng ngày dương lịch gốc
        return solarDate;
      } else {
        // Trường hợp 4: Solar event + yearly repeat = true
        // → Convert sang âm lịch rồi dùng current_year, is_leap = false
        try {
          const lunarConverted = this.convertSolarToLunar(solarDate);
          return this.getNextLunarOccurrence(
            lunarConverted.day,
            lunarConverted.month,
            false, // is_leap = false như yêu cầu
            referenceDate
          );
        } catch (error) {
          console.error("Error converting solar to lunar (case 4):", error);
          // Fallback: dùng solar date gốc
          return solarDate;
        }
      }
    }
  }

  /**
   * Kiểm tra có nên hiển thị nhắc nhở hôm nay không
   * @param {number} reminderLunarDay - Ngày âm lịch của nhắc nhở
   * @param {number} reminderLunarMonth - Tháng âm lịch của nhắc nhở
   * @param {boolean} isLeapMonth - Có phải tháng nhuận không (mặc định false)
   * @returns {boolean} True nếu nên hiển thị nhắc nhở hôm nay
   */
  static shouldShowReminderToday(
    reminderLunarDay: number,
    reminderLunarMonth: number,
    isLeapMonth: boolean = false
  ): boolean {
    const today = this.getTodayLunarDate();
    return (
      today.day === reminderLunarDay &&
      today.month === reminderLunarMonth &&
      today.isLeapMonth === isLeapMonth
    );
  }

  /**
   * Định dạng ngày âm lịch thành chuỗi dạng dd/mm/yyyy
   * @param {LunarDate} lunarDate - Ngày âm lịch
   * @returns {string} Chuỗi ngày âm lịch định dạng
   */
  static formatLunarDate(lunarDate: LunarDate): string {
    const leapText = lunarDate.isLeapMonth ? " (nhuận)" : "";
    return `${lunarDate.day}/${lunarDate.month}/${lunarDate.year}${leapText}`;
  }

  /**
   * Lấy văn bản hiển thị ngày âm lịch bằng tiếng Việt
   * @param {LunarDate} lunarDate - Ngày âm lịch
   * @returns {string} Văn bản mô tả ngày âm lịch
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

    const leapText = lunarDate.isLeapMonth ? " nhuận" : "";
    return `Ngày ${lunarDate.day} tháng ${monthNames[lunarDate.month]}${leapText} năm ${lunarDate.year}`;
  }

  /**
   * Lấy thông tin chi tiết về ngày âm lịch (bao gồm can chi, giờ hoàng đạo, v.v.)
   * @param {Date} date - Ngày dương lịch để lấy thông tin
   * @returns {LunarDetailInfo | null} Thông tin chi tiết về ngày âm lịch
   */
  static getLunarDetailInfo(date: Date): LunarDetailInfo | null {
    try {
      const solarDate = new SolarDate(date);
      const lunarDate = solarDate.toLunarDate();

      // Sử dụng method get() để lấy thông tin cơ bản
      const lunarInfo = lunarDate.get();

      return {
        lunarDate: {
          day: lunarInfo.day,
          month: lunarInfo.month,
          year: lunarInfo.year,
          isLeapMonth: lunarInfo.leap_month || false,
          isLeapYear: lunarInfo.leap_year || false,
        },
        yearName: lunarDate.getYearName(), // Tên năm theo can chi (VD: Quý Mão)
        monthName: lunarDate.getMonthName(), // Tên tháng theo can chi
        dayName: lunarDate.getDayName(), // Tên ngày theo can chi
        hourName: lunarDate.getHourName(), // Tên giờ theo can chi
        dayOfWeek: lunarDate.getDayOfWeek(), // Thứ trong tuần
        solarTerm: lunarDate.getSolarTerm(), // Tiết khí (VD: Mang chủng)
        luckyHours: lunarDate.getLuckyHours(), // Giờ hoàng đạo
      };
    } catch (error) {
      console.error("Lỗi lấy thông tin chi tiết âm lịch:", error);
      return null;
    }
  }

  /**
   * Kiểm tra năm âm lịch có phải năm nhuận không
   * @param {number} lunarYear - Năm âm lịch
   * @returns {boolean} True nếu là năm nhuận
   */
  static isLeapYear(lunarYear: number): boolean {
    try {
      // Tạo ngày đầu năm âm lịch
      const lunarDate = new LunarCalendarDate({
        day: 1,
        month: 1,
        year: lunarYear,
      });
      lunarDate.init();

      const lunarInfo = lunarDate.get();
      return lunarInfo.leap_year || false;
    } catch (error) {
      console.error("Lỗi kiểm tra năm nhuận:", error);
      return false;
    }
  }

  /**
   * Lấy danh sách tháng nhuận trong năm (nếu có)
   * @param {number} lunarYear - Năm âm lịch
   * @returns {number[]} Mảng các tháng nhuận trong năm
   */
  static getLeapMonths(lunarYear: number): number[] {
    const leapMonths: number[] = [];

    try {
      // Năm âm lịch tương ứng với năm dương lịch cùng số
      const solarYear = lunarYear;

      const foundLeapMonths = new Set<number>();

      // Scan qua từng tuần trong năm dương lịch để tìm tháng nhuận
      for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= 28; day += 7) {
          // Scan từng tuần trong tháng
          try {
            const date = new Date(solarYear, month - 1, day);
            const solarDate = new SolarDate(date);
            const lunarDate = solarDate.toLunarDate();
            const lunarInfo = lunarDate.get();

            // Kiểm tra nếu là năm âm lịch mong muốn và có tháng nhuận
            if (lunarInfo.year === lunarYear && lunarInfo.leap_month) {
              foundLeapMonths.add(lunarInfo.month);
            }
          } catch (error) {
            // Bỏ qua lỗi conversion
            continue;
          }
        }
      }

      leapMonths.push(...Array.from(foundLeapMonths).sort((a, b) => a - b));
    } catch (error) {
      console.error("Lỗi lấy tháng nhuận:", error);
    }

    return leapMonths;
  }
}
