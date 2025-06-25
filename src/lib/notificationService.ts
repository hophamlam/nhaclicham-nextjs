/**
 * Service xử lý logic thông báo và lặp lại âm lịch
 */

import { LunarService } from "./lunarService";
import { addYears, format } from "date-fns";

export interface NotificationRepeatConfig {
  id: string;
  user_id: string;
  event_id: string;
  lunar_repeat_yearly: boolean;
  advance_days: number;
  provider_id: string;
  note?: string;
}

export interface LunarNotificationEvent {
  lunar_day: number;
  lunar_month: number;
  lunar_year: number;
  is_leap_month: boolean;
  title: string;
  description?: string;
}

export class NotificationService {
  /**
   * Tính toán ngày thông báo tiếp theo cho lunar event với yearly repeat
   * @param event - Thông tin event âm lịch
   * @param config - Cấu hình thông báo
   * @param fromYear - Năm bắt đầu tính (mặc định là năm hiện tại)
   */
  static calculateNextLunarNotification(
    event: LunarNotificationEvent,
    config: NotificationRepeatConfig,
    fromYear?: number
  ): {
    nextSolarDate: Date;
    nextLunarYear: number;
    isValid: boolean;
    error?: string;
  } {
    try {
      const currentYear = fromYear || new Date().getFullYear();
      const today = new Date();

      // Thử convert năm hiện tại trước
      let nextYear = currentYear;
      let nextSolarDate: Date;
      let attempts = 0;
      const maxAttempts = 5; // Tránh infinite loop

      while (attempts < maxAttempts) {
        try {
          // Convert lunar date sang solar cho năm nextYear
          nextSolarDate = LunarService.convertLunarToSolar(
            event.lunar_day,
            event.lunar_month,
            nextYear,
            event.is_leap_month
          );

          // Trừ advance_days để tính ngày thông báo
          const notificationDate = new Date(nextSolarDate);
          notificationDate.setDate(
            notificationDate.getDate() - config.advance_days
          );

          // Nếu ngày thông báo đã qua, thử năm tiếp theo
          if (notificationDate <= today) {
            nextYear++;
            attempts++;
            continue;
          }

          return {
            nextSolarDate: notificationDate,
            nextLunarYear: nextYear,
            isValid: true,
          };
        } catch (error) {
          // Năm này không có tháng nhuận tương ứng, thử năm tiếp theo
          nextYear++;
          attempts++;
        }
      }

      return {
        nextSolarDate: new Date(),
        nextLunarYear: currentYear,
        isValid: false,
        error: "Không thể tìm được ngày thông báo tiếp theo trong 5 năm tới",
      };
    } catch (error) {
      return {
        nextSolarDate: new Date(),
        nextLunarYear: fromYear || new Date().getFullYear(),
        isValid: false,
        error: `Lỗi tính toán: ${error}`,
      };
    }
  }

  /**
   * Tạo description cho notification kế tiếp
   * @param originalTitle - Tiêu đề notification gốc
   * @param nextSolarDate - Ngày dương lịch kế tiếp
   * @param nextLunarYear - Năm âm lịch kế tiếp
   */
  static generateNextNotificationDescription(
    originalTitle: string,
    nextSolarDate: Date,
    nextLunarYear: number
  ): string {
    const solarDateStr = format(nextSolarDate, "dd/MM/yyyy");

    return [
      originalTitle,
      "",
      `🔄 Lặp lại hàng năm theo âm lịch`,
      `📅 Thông báo kế tiếp: ${solarDateStr}`,
      `🌙 Năm âm lịch: ${nextLunarYear}`,
    ].join("\n");
  }

  /**
   * Kiểm tra xem notification có cần tạo instance tiếp theo không
   * @param config - Cấu hình notification
   * @param lastTriggeredYear - Năm cuối được trigger (optional)
   */
  static shouldCreateNextInstance(
    config: NotificationRepeatConfig,
    lastTriggeredYear?: number
  ): boolean {
    if (!config.lunar_repeat_yearly) {
      return false;
    }

    const currentYear = new Date().getFullYear();

    // Nếu chưa có lịch sử trigger, hoặc đã qua năm cuối trigger
    return !lastTriggeredYear || lastTriggeredYear < currentYear;
  }

  /**
   * Batch tạo notifications cho tất cả lunar repeat yearly settings
   * @param supabaseClient - Client để query database
   * @param targetYear - Năm target để tạo notifications (mặc định năm sau)
   */
  static async batchCreateYearlyLunarNotifications(
    supabaseClient: any, // Type sẽ được define từ Supabase client
    targetYear?: number
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const year = targetYear || new Date().getFullYear() + 1;
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      // Query tất cả notification settings có lunar_repeat_yearly = true
      const { data: lunarRepeats, error: queryError } = await supabaseClient
        .from("notification_settings")
        .select(
          `
          id,
          user_id,
          event_id,
          advance_days,
          provider_id,
          note,
          lunar_repeat_yearly,
          events!inner(
            lunar_day,
            lunar_month,
            is_leap_month,
            title,
            description
          )
        `
        )
        .eq("lunar_repeat_yearly", true)
        .eq("is_enabled", true);

      if (queryError) {
        results.errors.push(`Query error: ${queryError.message}`);
        return results;
      }

      if (!lunarRepeats || lunarRepeats.length === 0) {
        return results;
      }

      // Process từng notification setting
      for (const setting of lunarRepeats) {
        try {
          const event = setting.events;

          // Tính ngày thông báo cho năm target
          const nextNotification = this.calculateNextLunarNotification(
            {
              lunar_day: event.lunar_day,
              lunar_month: event.lunar_month,
              lunar_year: year,
              is_leap_month: event.is_leap_month,
              title: event.title,
              description: event.description,
            },
            {
              id: setting.id,
              user_id: setting.user_id,
              event_id: setting.event_id,
              lunar_repeat_yearly: setting.lunar_repeat_yearly,
              advance_days: setting.advance_days,
              provider_id: setting.provider_id,
              note: setting.note,
            },
            year
          );

          if (!nextNotification.isValid) {
            results.failed++;
            results.errors.push(
              `Failed to calculate next notification for setting ${setting.id}: ${nextNotification.error}`
            );
            continue;
          }

          // Tạo notification event mới cho năm target
          // Logic này sẽ được implement khi integrate với notification system thực tế

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(
            `Error processing setting ${setting.id}: ${error}`
          );
        }
      }

      return results;
    } catch (error) {
      results.errors.push(`Batch process error: ${error}`);
      return results;
    }
  }
}

/**
 * Hook để sử dụng trong React components
 */
export function useNotificationService() {
  return {
    calculateNextLunarNotification:
      NotificationService.calculateNextLunarNotification,
    generateNextNotificationDescription:
      NotificationService.generateNextNotificationDescription,
    shouldCreateNextInstance: NotificationService.shouldCreateNextInstance,
  };
}
