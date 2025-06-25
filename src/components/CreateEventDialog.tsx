"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Save, Plus, Edit, Copy, Trash2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LunarService } from "@/lib/lunarService";
import { differenceInCalendarDays, format } from "date-fns";
import { type Reminder } from "@/types/reminder";
import { type EventTemplate } from "./TemplateSelectionDialog";

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
  editingEvent?: Reminder;
  templateData?: EventTemplate | null;
}

/**
 * Dialog component để tạo sự kiện mới
 * Chuyển đổi từ trang /create thành dialog
 */
export function CreateEventDialog({
  isOpen,
  onClose,
  onEventCreated,
  editingEvent,
  templateData,
}: CreateEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLunar, setIsLunar] = useState(true);
  // lunar fields
  const [lunarDay, setLunarDay] = useState<number | "">("");
  const [lunarMonth, setLunarMonth] = useState<number | "">("");
  const [lunarYear, setLunarYear] = useState<number | "">("");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [repeatYearly, setRepeatYearly] = useState(false);
  // solar field
  const [solarDate, setSolarDate] = useState<string>(""); // yyyy-mm-dd
  // preferred notification
  const [preferredAdvanceDays, setPreferredAdvanceDays] = useState<number>(1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Notification settings list
  interface NotifySetting {
    advanceDays: number;
    providerId: string;
    note: string;
  }
  const [notifySettings, setNotifySettings] = useState<NotifySetting[]>([
    { advanceDays: 0, providerId: "", note: "" },
  ]);
  const [providers, setProviders] = useState<
    Array<{ id: string; name: string; is_default: boolean }>
  >([]);

  const supabase = createClient();
  const isEditMode = !!editingEvent;

  // Load dữ liệu khi edit
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || "");
      setIsLunar(editingEvent.isLunar);
      setLunarDay(editingEvent.lunarDay || "");
      setLunarMonth(editingEvent.lunarMonth || "");
      setLunarYear(editingEvent.lunarYear || "");
      setIsLeapMonth(editingEvent.isLeapMonth || false);
      setRepeatYearly(editingEvent.repeatYearly || false);
      setPreferredAdvanceDays(editingEvent.preferredAdvanceDays || 1);
      // TODO: Load solar date if needed
    }
  }, [editingEvent]);

  // Áp dụng dữ liệu từ template khi dialog mở (chỉ ở chế độ tạo mới)
  useEffect(() => {
    if (isOpen && templateData && !isEditMode) {
      const { config } = templateData;
      setTitle(config.note || "");
      setDescription("");
      setIsLunar(config.isLunar);
      setRepeatYearly(config.repeatYearly ?? false);
      setPreferredAdvanceDays(config.defaultAdvanceDays || 1);

      // Xử lý ngày tháng
      if (config.setDateToToday) {
        const today = new Date();
        if (config.isLunar) {
          const lunarDate = LunarService.convertSolarToLunar(today);
          setLunarDay(lunarDate.day);
          setLunarMonth(lunarDate.month);
          setLunarYear(""); // Không đặt năm để áp dụng hàng năm
          setSolarDate("");
        } else {
          setSolarDate(format(today, "yyyy-MM-dd"));
          setLunarDay("");
          setLunarMonth("");
          setLunarYear("");
        }
      }
    }
  }, [isOpen, templateData, isEditMode]);

  // Load providers list for select
  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from("notification_providers")
          .select("id, name, is_default")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false });

        if (!error && data) {
          const providersList = data as Array<{
            id: string;
            name: string;
            is_default: boolean;
          }>;
          setProviders(providersList);

          const defaultProvider = providersList.find((p) => p.is_default);
          const defaultProviderId = defaultProvider?.id || "";

          if (templateData && !isEditMode) {
            const templateNotifySettings =
              templateData.notifySettings?.map((s) => ({
                advanceDays: s.advanceDays,
                note: s.note || "",
                providerId: defaultProviderId,
              })) || [];
            setNotifySettings(
              templateNotifySettings.length > 0
                ? templateNotifySettings
                : [{ advanceDays: 0, providerId: defaultProviderId, note: "" }]
            );
          } else if (
            !isEditMode &&
            notifySettings.length === 1 &&
            !notifySettings[0].providerId
          ) {
            setNotifySettings([
              {
                ...notifySettings[0],
                providerId: defaultProviderId,
              },
            ]);
          }
        }
      } catch (e) {
        console.error("Load providers error", e);
      }
    })();
  }, [supabase, templateData, isEditMode]);

  // Reset form khi đóng dialog
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIsLunar(true);
    setLunarDay("");
    setLunarMonth("");
    setLunarYear("");
    setIsLeapMonth(false);
    setRepeatYearly(false);
    setSolarDate("");
    setPreferredAdvanceDays(1);
    setSuggestions([]);
    setError(null);
    setLoading(false);
    setNotifySettings([{ advanceDays: 0, providerId: "", note: "" }]);
  };

  // compute suggestions whenever relevant fields change
  useEffect(() => {
    const today = new Date();
    // helper to get next/prev occurrence of a given lunar date
    const computeSuggestionDates = (d: number, m: number, leap: boolean) => {
      const currentYear = today.getFullYear();
      let thisYearSolar: Date;
      try {
        thisYearSolar = LunarService.convertLunarToSolar(
          d,
          m,
          currentYear,
          leap
        );
      } catch {
        // Nếu năm hiện tại không có tháng nhuận tương ứng, fallback
        thisYearSolar = new Date(NaN);
      }
      let future: Date;
      let past: Date;
      if (!isNaN(thisYearSolar.getTime()) && thisYearSolar >= today) {
        future = thisYearSolar;
        past = LunarService.convertLunarToSolar(d, m, currentYear - 1, leap);
      } else if (!isNaN(thisYearSolar.getTime()) && thisYearSolar < today) {
        past = thisYearSolar;
        future = LunarService.convertLunarToSolar(d, m, currentYear + 1, leap);
      } else {
        // trong trường hợp tháng nhuận không tồn tại năm hiện tại
        future = LunarService.convertLunarToSolar(d, m, currentYear + 1, leap);
        past = LunarService.convertLunarToSolar(d, m, currentYear - 1, leap);
      }
      return { future, past };
    };

    try {
      if (isLunar) {
        if (!lunarDay || !lunarMonth) {
          setSuggestions([]);
          return;
        }
        const { future, past } = computeSuggestionDates(
          Number(lunarDay),
          Number(lunarMonth),
          isLeapMonth
        );
        const diffF = differenceInCalendarDays(future, today);
        const diffP = differenceInCalendarDays(today, past);
        setSuggestions([
          `Ngày DL sắp đến: ${format(future, "dd/MM/yyyy")} (còn ${diffF} ngày)`,
          `Ngày DL đã qua gần nhất: ${format(past, "dd/MM/yyyy")} (cách đây ${diffP} ngày)`,
        ]);
      } else {
        if (!solarDate) {
          setSuggestions([]);
          return;
        }
        const solar = new Date(solarDate);
        const lunar = LunarService.convertSolarToLunar(solar);
        const lunarDetailInfo = LunarService.getLunarDetailInfo(solar);
        const yearName = lunarDetailInfo?.yearName || "";
        const diffDays = differenceInCalendarDays(solar, today);
        const timeDescription =
          diffDays > 0
            ? `sắp đến, còn ${diffDays} ngày`
            : diffDays < 0
              ? `đã qua, cách hiện tại ${Math.abs(diffDays)} ngày`
              : "hôm nay";

        setSuggestions([
          `Ngày ÂL chuyển đổi: ${lunar.day}/${lunar.month} năm ${lunar.year} (${yearName}) (${timeDescription})`,
        ]);
      }
    } catch {
      setSuggestions([]);
    }
  }, [isLunar, lunarDay, lunarMonth, isLeapMonth, solarDate]);

  // Tính số năm đã qua nếu nhập năm âm lịch
  const lunarYearDiff = useMemo(() => {
    if (!lunarYear) return null;
    const diff = new Date().getFullYear() - Number(lunarYear);
    return diff >= 0 ? diff : null;
  }, [lunarYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!title) {
      setError("Vui lòng nhập tiêu đề sự kiện");
      setLoading(false);
      return;
    }

    if (isLunar && (!lunarDay || !lunarMonth)) {
      setError("Vui lòng chọn đủ ngày và tháng âm lịch");
      setLoading(false);
      return;
    }

    if (!isLunar && !solarDate) {
      setError("Vui lòng chọn ngày dương lịch");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Cần đăng nhập");
      setLoading(false);
      return;
    }

    const payload: any = {
      user_id: user.id,
      title: title,
      description: description || null,
      is_lunar: isLunar,
      is_leap_month: isLeapMonth,
      lunar_repeat_yearly: repeatYearly,
      preferred_advance_days: preferredAdvanceDays,
    };

    if (isLunar) {
      payload.lunar_day = Number(lunarDay);
      payload.lunar_month = Number(lunarMonth);
      payload.lunar_year = lunarYear ? Number(lunarYear) : null;
    } else {
      payload.solar_date = solarDate;
    }

    try {
      let dbError;

      if (isEditMode && editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", editingEvent.id)
          .eq("user_id", user.id);
        dbError = error;
      } else {
        // Create new event
        const { error } = await supabase.from("events").insert(payload);
        dbError = error;
      }

      if (dbError) {
        setError(dbError.message);
        setLoading(false);
      } else {
        const eventResponse = isEditMode
          ? { data: [editingEvent], error: null }
          : await supabase
              .from("events")
              .select("id")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

        const eventId = eventResponse.data?.id;

        if (eventId) {
          // First, remove old settings for this event if in edit mode
          if (isEditMode) {
            await supabase
              .from("notification_settings")
              .delete()
              .eq("event_id", eventId);
          }
          // Then, insert new settings
          for (const s of notifySettings) {
            if (s.providerId) {
              // Only insert if a provider is selected
              await supabase.from("notification_settings").insert({
                user_id: user.id,
                event_id: eventId,
                advance_days: s.advanceDays,
                provider_id: s.providerId,
                note: s.note || null,
              });
            }
          }
        }

        resetForm();
        onClose();
        onEventCreated?.();
      }
    } catch (error) {
      setError("Đã có lỗi xảy ra");
      setLoading(false);
    }
  };

  // helper arrays
  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  // Đóng dialog và reset form
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: "1rem",
      }}
    >
      <Card
        className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl text-red-800 dark:text-red-500">
              {isEditMode ? (
                <>
                  <Edit className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  <span>Chỉnh sửa sự kiện</span>
                </>
              ) : (
                <>
                  <Plus className="h-8 w-8 text-red-600 dark:text-red-400" />
                  <span>Tạo sự kiện mới</span>
                </>
              )}
            </CardTitle>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent"
            >
              ✕
            </button>
          </div>

          {/* Info section */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-400 dark:border-blue-600">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • <strong>Năm Âm:</strong> dùng để nhắc số năm đã qua khi
                    nhận nhắc nhở (tùy chọn)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Giỗ ông nội"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả (tùy chọn)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Thêm các chi tiết, ghi chú cho sự kiện này..."
                className="w-full min-h-[80px] border border-input bg-background rounded-md px-3 py-2 text-sm"
              />
            </div>

            {/* Switch calendar type */}
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!isLunar}
                  onChange={(e) => setIsLunar(!e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span
                className={`text-sm font-medium ${isLunar ? "text-red-600 dark:text-red-400" : "hidden"}`}
              >
                Âm lịch
              </span>
              <span
                className={`text-sm font-medium ${!isLunar ? "text-blue-600 dark:text-blue-400" : "hidden"}`}
              >
                Dương lịch
              </span>
            </div>

            {/* Repeat yearly switch */}
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={repeatYearly}
                  onChange={(e) => setRepeatYearly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
              <span
                className={`text-sm font-medium ${!repeatYearly ? "text-orange-600 dark:text-orange-400" : "hidden"}`}
              >
                Không nhắc lại hàng năm (thôi nôi, đầy tháng)
              </span>
              <span
                className={`text-sm font-medium ${repeatYearly ? "text-green-600 dark:text-green-400" : "hidden"}`}
              >
                Nhắc lại hàng năm (ngày giỗ,...)
              </span>
            </div>

            {isLunar ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày Âm</Label>
                    <select
                      className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm h-10"
                      value={lunarDay}
                      onChange={(e) => setLunarDay(Number(e.target.value))}
                    >
                      <option value="">Chọn</option>
                      {days.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tháng Âm</Label>
                    <select
                      className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm h-10"
                      value={lunarMonth}
                      onChange={(e) => setLunarMonth(Number(e.target.value))}
                    >
                      <option value="">Chọn</option>
                      {months.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Năm Âm</Label>
                    <Input
                      type="number"
                      placeholder="Tuỳ chọn"
                      value={lunarYear}
                      onChange={(e) =>
                        setLunarYear(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="h-10"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Ngày dương</Label>
                <Input
                  type="date"
                  value={solarDate}
                  onChange={(e) => setSolarDate(e.target.value)}
                />
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-muted p-4 rounded-md space-y-1 text-sm text-muted-foreground">
                {suggestions.map((s, idx) => (
                  <p key={idx}>{s}</p>
                ))}
              </div>
            )}

            {/* Basic Notification Settings */}
            <hr className="my-4" />
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <span>🔔</span> Thông báo cơ bản
            </h3>
            {/* Hiển thị kênh mặc định */}
            {providers.find((p) => p.is_default) && (
              <p className="text-sm text-muted-foreground mb-3">
                Sẽ gửi thông báo qua kênh mặc định:{" "}
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {providers.find((p) => p.is_default)?.name}
                </span>
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 p-4 border border-input rounded-md bg-muted/30">
              <div>
                <Label htmlFor="preferredAdvanceDays">Nhắc trước (ngày)</Label>
                <Input
                  id="preferredAdvanceDays"
                  type="number"
                  min="0"
                  value={preferredAdvanceDays}
                  onChange={(e) =>
                    setPreferredAdvanceDays(Number(e.target.value))
                  }
                  placeholder="1"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Thông báo chính sẽ được gửi trước sự kiện số ngày này
                </p>
              </div>
            </div>

            {/* Advanced Notification Settings */}
            <details className="mt-4">
              <summary className="font-medium text-foreground flex items-center gap-2 cursor-pointer hover:text-primary">
                <span>⚙️</span> Cài đặt nâng cao (tùy chọn)
              </summary>
              <div className="mt-4 space-y-4">
                {notifySettings.map((s, idx) => (
                  <div
                    key={idx}
                    className="border border-input rounded-md p-4 relative space-y-4"
                  >
                    {/* Action icons */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setNotifySettings((prev) => [...prev, { ...s }])
                        }
                        title="Nhân bản"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {idx === notifySettings.length - 1 && (
                        <button
                          type="button"
                          className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-500"
                          onClick={() => {
                            const defaultProvider = providers.find(
                              (p) => p.is_default
                            );
                            setNotifySettings((prev) => [
                              ...prev,
                              {
                                advanceDays: 0,
                                providerId: defaultProvider?.id || "",
                                note: "",
                              },
                            ]);
                          }}
                          title="Thêm nhắc"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                      {notifySettings.length > 1 && (
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                          onClick={() =>
                            setNotifySettings((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4">
                      <div>
                        <Label>Nhắc trước (ngày)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={s.advanceDays}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNotifySettings((prev) => {
                              const copy = [...prev];
                              copy[idx].advanceDays = val;
                              return copy;
                            });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Ghi chú khi gửi</Label>
                        <Input
                          value={s.note}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNotifySettings((prev) => {
                              const copy = [...prev];
                              copy[idx].note = val;
                              return copy;
                            });
                          }}
                          placeholder="Ví dụ: Đừng quên mua hoa"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className={`flex-1 ${isEditMode ? "bg-amber-600 text-primary-foreground hover:bg-amber-700" : "bg-red-600 text-destructive-foreground hover:bg-red-700"}`}
                disabled={loading}
              >
                {isEditMode ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    {loading ? "Đang cập nhật..." : "Cập nhật sự kiện"}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Đang lưu..." : "Lưu sự kiện"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
