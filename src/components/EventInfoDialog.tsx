"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, ArrowLeft, ArrowRight, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnifiedDatePicker } from "@/components/ui/unified-date-picker";

// Event template interface
export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  isLunar: boolean;
}

// Event info interface được truyền sang dialog tiếp theo
export interface EventInfo {
  title: string;
  description: string;
  isLunar: boolean;
  // Lunar fields
  lunarDay: number | "";
  lunarMonth: number | "";
  lunarYear: number | "";
  isLeapMonth: boolean;
  // Solar field
  solarDate: string;
  // Other
  repeatYearly: boolean;
}

/**
 * Dialog để nhập thông tin chi tiết sự kiện
 * Bước 2/3 trong flow tạo reminder
 */
interface EventInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: (eventInfo: EventInfo) => void;
  templateData: EventTemplate | null;
}

export function EventInfoDialog({
  isOpen,
  onClose,
  onBack,
  onNext,
  templateData,
}: EventInfoDialogProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLunar, setIsLunar] = useState(false);

  // Lunar date states
  const [lunarDay, setLunarDay] = useState<number | "">("");
  const [lunarMonth, setLunarMonth] = useState<number | "">("");
  const [lunarYear, setLunarYear] = useState<number | "">("");
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  // Solar date state - mặc định hôm nay
  const [solarDate, setSolarDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Notification settings

  // UI state
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from template nếu có
  useEffect(() => {
    if (templateData) {
      setIsLunar(templateData.isLunar);
    }
  }, [templateData]);

  // Set default values khi dialog mở
  useEffect(() => {
    if (isOpen) {
      // Mặc định: dương lịch = hôm nay, âm lịch = 1/1/năm hiện tại
      if (solarDate === "") {
        setSolarDate(format(new Date(), "yyyy-MM-dd"));
      }
      if (lunarDay === "" && lunarMonth === "" && lunarYear === "") {
        setLunarDay(1);
        setLunarMonth(1);
        setLunarYear(new Date().getFullYear());
      }
    }
  }, [isOpen, solarDate, lunarDay, lunarMonth, lunarYear]);

  /**
   * Reset form về trạng thái ban đầu với defaults
   */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIsLunar(false);
    // Set defaults: solar = hôm nay, lunar = 1/1/năm hiện tại
    setLunarDay(1);
    setLunarMonth(1);
    setLunarYear(new Date().getFullYear());
    setIsLeapMonth(false);
    setSolarDate(format(new Date(), "yyyy-MM-dd"));
    setError(null);
  };

  /**
   * Xử lý bước tiếp theo - validate form và chuyển data
   */
  const handleNext = () => {
    setError(null);

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề sự kiện");
      return;
    }

    if (isLunar && (!lunarDay || !lunarMonth)) {
      setError("Vui lòng chọn đủ ngày và tháng âm lịch");
      return;
    }

    if (!isLunar && !solarDate) {
      setError("Vui lòng chọn ngày dương lịch");
      return;
    }

    // Tạo eventInfo object để truyền sang dialog tiếp theo
    const eventInfo: EventInfo = {
      title: title.trim(),
      description: description.trim(),
      isLunar,
      lunarDay,
      lunarMonth,
      lunarYear,
      isLeapMonth,
      solarDate,
      repeatYearly: isLunar, // Auto: lunar = repeat yearly, solar = one-time
    };

    onNext(eventInfo);
  };

  /**
   * Đóng dialog và reset form
   */
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
            <CardTitle className="flex items-center gap-3 text-2xl text-blue-800 dark:text-blue-500">
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span>Thông tin sự kiện</span>
            </CardTitle>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent"
            >
              ✕
            </button>
          </div>

          {/* Template info */}
          {templateData && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border-l-4 border-green-400 dark:border-green-600">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p className="font-medium">Template: {templateData.name}</p>
                  <p className="text-xs mt-1">{templateData.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-8 h-1 bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-xs text-muted-foreground ml-2">
              Bước 2/3: Thông tin sự kiện
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Title input */}
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề sự kiện *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Giỗ ông nội"
                required
              />
            </div>

            {/* Description input */}
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

            {/* Unified Date Picker với built-in suggestions */}
            <UnifiedDatePicker
              isLunar={isLunar}
              onToggleLunar={setIsLunar}
              solarDate={solarDate}
              onSolarDateChange={setSolarDate}
              lunarDate={{
                day: typeof lunarDay === "number" ? lunarDay : 1,
                month: typeof lunarMonth === "number" ? lunarMonth : 1,
                year:
                  typeof lunarYear === "number"
                    ? lunarYear
                    : new Date().getFullYear(),
                isLeapMonth: isLeapMonth,
              }}
              onLunarDateChange={(date) => {
                setLunarDay(date.day || "");
                setLunarMonth(date.month || "");
                setLunarYear(date.year || "");
                setIsLeapMonth(date.isLeapMonth || false);
              }}
              showGuidance={true}
              showPreview={true}
            />

            {/* Error message */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button type="button" onClick={handleNext} className="flex-1">
                Tiếp theo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
