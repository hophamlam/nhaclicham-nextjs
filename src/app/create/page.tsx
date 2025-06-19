"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { ReminderService } from "@/lib/reminderService";
import { CreateReminderInput } from "@/types/reminder";

export default function CreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    note: "",
    lunar_day: 1,
    lunar_month: 1,
    repeat_every_year: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const input: CreateReminderInput = {
        user_id: "demo-user", // In production, get from auth
        note: formData.note,
        lunar_day: formData.lunar_day,
        lunar_month: formData.lunar_month,
        repeat_every_year: formData.repeat_every_year,
      };

      await ReminderService.createReminder(input);
      router.push("/");
    } catch (error) {
      console.error("Error creating reminder:", error);
      alert("Có lỗi xảy ra khi tạo lời nhắc!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Tạo lời nhắc mới</h1>
          <p className="text-muted-foreground">
            Tạo lời nhắc theo ngày âm lịch
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Thông tin lời nhắc
          </CardTitle>
          <CardDescription>Nhập thông tin cho lời nhắc mới</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Note */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium mb-2">
                Nội dung lời nhắc *
              </label>
              <textarea
                id="note"
                required
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ví dụ: Ngày giỗ tổ tiên, Cúng rằm tháng..."
              />
            </div>

            {/* Lunar Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="lunar_day"
                  className="block text-sm font-medium mb-2"
                >
                  Ngày âm lịch *
                </label>
                <select
                  id="lunar_day"
                  required
                  value={formData.lunar_day}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lunar_day: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      Ngày {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="lunar_month"
                  className="block text-sm font-medium mb-2"
                >
                  Tháng âm lịch *
                </label>
                <select
                  id="lunar_month"
                  required
                  value={formData.lunar_month}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lunar_month: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[
                    "Tháng Giêng",
                    "Tháng Hai",
                    "Tháng Ba",
                    "Tháng Tư",
                    "Tháng Năm",
                    "Tháng Sáu",
                    "Tháng Bảy",
                    "Tháng Tám",
                    "Tháng Chín",
                    "Tháng Mười",
                    "Tháng 11",
                    "Tháng Chạp",
                  ].map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Repeat Yearly */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="repeat"
                checked={formData.repeat_every_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    repeat_every_year: e.target.checked,
                  })
                }
                className="rounded"
              />
              <label htmlFor="repeat" className="text-sm font-medium">
                Lặp lại hàng năm
              </label>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Xem trước:</h3>
              <p className="text-sm text-gray-600">
                <strong>Nội dung:</strong> {formData.note || "Chưa nhập"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Ngày:</strong> {formData.lunar_day}/
                {formData.lunar_month}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Lặp lại:</strong>{" "}
                {formData.repeat_every_year ? "Hàng năm" : "Chỉ một lần"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading || !formData.note}>
                {loading ? "Đang tạo..." : "Tạo lời nhắc"}
              </Button>
              <Link href="/">
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
