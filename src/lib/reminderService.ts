import { Reminder, CreateReminderInput } from "@/types/reminder";
import { API_BASE_URL, API_AUTH_HEADER } from "./supabase";
import { LunarService } from "./lunarService";

export class ReminderService {
  /**
   * Get all reminders for today (based on lunar date)
   */
  static async getTodayReminders(): Promise<Reminder[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reminders/today`, {
        headers: {
          Authorization: API_AUTH_HEADER,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reminders || [];
    } catch (error) {
      console.error("Error fetching today reminders:", error);
      // Return filtered mock data for development
      return this.getMockReminders().filter((reminder) =>
        LunarService.shouldShowReminderToday(
          reminder.lunarDay,
          reminder.lunarMonth,
          reminder.isLeapMonth || false
        )
      );
    }
  }

  /**
   * Get reminders for a specific user
   */
  static async getUserReminders(userId: string): Promise<Reminder[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reminders/user/${userId}`, {
        headers: {
          Authorization: API_AUTH_HEADER,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reminders || [];
    } catch (error) {
      console.error("Error fetching user reminders:", error);
      return this.getMockReminders();
    }
  }

  /**
   * Create a new reminder
   */
  static async createReminder(input: CreateReminderInput): Promise<Reminder> {
    try {
      const response = await fetch(`${API_BASE_URL}/reminders`, {
        method: "POST",
        headers: {
          Authorization: API_AUTH_HEADER,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reminder;
    } catch (error) {
      console.error("Error creating reminder:", error);
      throw error;
    }
  }

  /**
   * Update an existing reminder
   */
  static async updateReminder(
    id: string,
    input: Partial<CreateReminderInput>
  ): Promise<Reminder> {
    try {
      const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: "PUT",
        headers: {
          Authorization: API_AUTH_HEADER,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reminder;
    } catch (error) {
      console.error("Error updating reminder:", error);
      throw error;
    }
  }

  /**
   * Delete a reminder
   */
  static async deleteReminder(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: API_AUTH_HEADER,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
      throw error;
    }
  }

  /**
   * Mock reminders for development/testing
   */
  private static getMockReminders(): Reminder[] {
    return [
      {
        id: "1",
        user_id: "demo-user",
        note: "Ngày giỗ tổ tiên",
        isLunar: true,
        lunarDay: 10,
        lunarMonth: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        user_id: "demo-user",
        note: "Cúng rằm tháng",
        isLunar: true,
        lunarDay: 15,
        lunarMonth: 1,
        created_at: new Date().toISOString(),
      },
    ];
  }
}
