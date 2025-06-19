export interface Reminder {
  id: string;
  user_id: string;
  note: string;
  lunar_day: number;
  lunar_month: number;
  repeat_every_year: boolean;
  created_at: string;
}

export interface CreateReminderInput {
  user_id: string;
  note: string;
  lunar_day: number;
  lunar_month: number;
  repeat_every_year: boolean;
}

export interface LunarDate {
  day: number;
  month: number;
  year: number;
}
