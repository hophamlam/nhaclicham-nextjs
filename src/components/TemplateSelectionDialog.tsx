"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HeartCrack,
  FolderHeart,
  Sunrise,
  PlusCircle,
  ArrowRight,
  X,
} from "lucide-react";
import { useState } from "react";

/**
 * Định nghĩa cấu trúc dữ liệu cho một mẫu sự kiện.
 * Adapted to match new simplified structure
 */
export interface EventTemplate {
  id: string; // "death-anniversary", "funeral", etc.
  name: string; // "Ngày giỗ", "Tang lễ"
  description: string; // Mô tả ngắn gọn
  longDescription: string; // Mô tả chi tiết khi được chọn
  icon: React.ElementType; // Icon từ lucide-react

  // Direct properties (simplified from config)
  isLunar: boolean;

  // Advanced settings (optional)
  setDateToToday?: boolean; // Cờ để biết có cần đặt ngày là hôm nay không
  repeatYearly?: boolean;

  // Cài đặt thông báo mặc định cho template
  notifySettings?: Array<{
    advanceDays: number; // Sẽ dùng số âm để chỉ "ngày sau đó"
    note?: string;
    // 🔴 MỚI: Thêm setting nhắc lại hàng năm theo âm lịch cho từng notification
    isYearlyLunarRepeat?: boolean; // Default false nếu không có
  }>;
}

/**
 * Danh sách các mẫu sự kiện có sẵn.
 */
export const eventTemplates: EventTemplate[] = [
  {
    id: "death-anniversary",
    name: "Ngày giỗ",
    description: "Nhắc nhở ngày giỗ hàng năm",
    longDescription: `ℹ️ Mẫu phổ biến nhất - Tự động tạo nhắc nhở cho ngày giỗ theo truyền thống Việt Nam, lặp lại hàng năm theo ngày âm.
ℹ️ Nhắc trước 3 ngày (nhắc lại hàng năm).
ℹ️ Nhắc trước 1 ngày (nhắc lại hàng năm).`,
    icon: FolderHeart,
    isLunar: true,
    repeatYearly: true,
    notifySettings: [
      {
        advanceDays: 3,
        note: "Còn 3 ngày nữa là ngày giỗ của [Tên người giỗ]",
        isYearlyLunarRepeat: true, // 🔴 Chuẩn bị cũng lặp lại hàng năm
      },
      {
        advanceDays: 1,
        note: "Ngày mai là ngày giỗ của [Tên người giỗ]",
        isYearlyLunarRepeat: true, // 🔴 Ngày giỗ lặp lại hàng năm
      },
    ],
  },
  {
    id: "funeral",
    name: "Tang lễ",
    description:
      "Bao gồm nhắc nhở các lễ cúng cơm truyền thống tính theo ngày mất: 7, 49, 100 ngày và ngày giỗ hàng năm",
    longDescription: `ℹ️ Mẫu tự động tạo nhắc nhở cho các lễ cúng cơm truyền thống tính theo ngày mất (mà bạn sẽ chọn): 7, 49, 100 ngày (chưa trừ theo số ngày nhắc trước bạn sẽ chọn).
ℹ️ Tùy theo địa phương và truyền thống gia đình, các bạn có thể tạo thêm các nhắc nhở phù hợp nhé.
ℹ️ Nhắc nhở lễ cúng 7 ngày, 49 ngày, 100 ngày (không nhắc lại) - nhắc trước 1 ngày.
ℹ️ Nhắc nhở lễ ngày giỗ (nhắc lại hàng năm) - nhắc trước 1 ngày.`,
    icon: HeartCrack,
    isLunar: true,
    setDateToToday: false,
    repeatYearly: false,
    notifySettings: [
      {
        advanceDays: -6,
        note: "Ngày mai là lễ cúng 7 ngày",
        isYearlyLunarRepeat: false, // 🔴 Tang lễ KHÔNG lặp lại hàng năm
      },
      {
        advanceDays: -48,
        note: "Ngày mai là lễ cúng 49 ngày",
        isYearlyLunarRepeat: false, // 🔴 Tang lễ KHÔNG lặp lại hàng năm
      },
      {
        advanceDays: -99,
        note: "Ngày mai là lễ cúng 100 ngày (Tốt khốc)",
        isYearlyLunarRepeat: false, // 🔴 Tang lễ KHÔNG lặp lại hàng năm
      },
      {
        advanceDays: 1,
        note: "Ngày mai là ngày giỗ của [Tên người giỗ]",
        isYearlyLunarRepeat: true, // 🔴 Ngày giỗ lặp lại hàng năm
      },
    ],
  },
  {
    id: "newborn",
    name: "Em bé chào đời",
    description: "Theo dõi từ sinh → đầy tháng → sinh nhật đầu tiên",
    longDescription: `ℹ️ Mẫu tự động tạo nhắc nhở cho ngày đầy tháng và thôi nôi cho em bé vừa sinh ra theo truyền thống Việt Nam.
ℹ️ Nhắc nhở đầy tháng (không nhắc lại).
ℹ️ Nhắc nhở thôi nôi (không nhắc lại).
⚠️ Lưu ý về đầy tháng cho bé trai và bé gái, tùy theo địa phương và theo phong tục truyền thống: mẫu sẽ tạo nhắc nhở đầy tháng cho bé sau sinh 30 ngày, bạn tự điều chỉnh để phù hợp nhu cầu nhé.`,
    icon: Sunrise,
    isLunar: false, // Thường dùng dương lịch
    setDateToToday: true, // Mặc định hôm nay
    repeatYearly: true, // Để nhắc sinh nhật hàng năm
    notifySettings: [
      {
        advanceDays: 29,
        note: "Ngày mai là ngày đầy tháng của bé [Tên bé]",
        isYearlyLunarRepeat: false, // 🔴 Đầy tháng chỉ 1 lần
      },
      {
        advanceDays: 1,
        note: "Ngày mai là thôi nôi của bé [Tên bé]",
        isYearlyLunarRepeat: true, // 🔴 Sinh nhật lặp lại hàng năm (dương lịch)
      },
    ],
  },
];

interface TemplateSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: EventTemplate | null) => void; // null khi tạo tùy chỉnh
}

/**
 * Dialog để người dùng chọn một mẫu sự kiện có sẵn hoặc tạo mới.
 */
export function TemplateSelectionDialog({
  isOpen,
  onClose,
  onSelect,
}: TemplateSelectionDialogProps) {
  // State để quản lý template được chọn và hiển thị long description
  const [selectedTemplate, setSelectedTemplate] =
    useState<EventTemplate | null>(eventTemplates[0]); // Default select "Ngày giỗ"
  const [isCustomSelected, setIsCustomSelected] = useState(false);

  if (!isOpen) return null;

  // Handler khi click vào một template
  const handleTemplateClick = (template: EventTemplate) => {
    setSelectedTemplate(template);
    setIsCustomSelected(false);
  };

  // Handler khi click vào "Tạo tùy chỉnh"
  const handleCustomClick = () => {
    setSelectedTemplate(null);
    setIsCustomSelected(true);
  };

  // Handler cho nút Next
  const handleNext = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    } else if (isCustomSelected) {
      onSelect(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card
        className="rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl text-green-800 dark:text-green-500">
              <PlusCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              <span>Chọn loại sự kiện</span>
            </CardTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent"
            >
              ✕
            </button>
          </div>
          <CardDescription className="mt-2">
            Bắt đầu nhanh hơn bằng cách chọn một mẫu có sẵn.
          </CardDescription>

          {/* Progress indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-xs text-muted-foreground ml-2">
              Bước 1/3: Chọn template
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template selection grid - 4 cột, 1 hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Danh sách các template */}
            {eventTemplates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[160px] ${
                  selectedTemplate?.id === template.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-accent"
                }`}
                onClick={() => handleTemplateClick(template)}
              >
                <template.icon className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold text-base leading-tight">
                  {template.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-tight">
                  {template.description}
                </p>
              </div>
            ))}

            {/* Lựa chọn tạo tùy chỉnh */}
            <div
              className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[160px] ${
                isCustomSelected
                  ? "border-primary bg-primary/5"
                  : "border-primary/50 hover:bg-accent"
              }`}
              onClick={handleCustomClick}
            >
              <PlusCircle className="h-10 w-10 text-primary mb-2" />
              <h3 className="font-semibold text-base leading-tight">
                Tạo sự kiện tùy chỉnh
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-tight">
                Bắt đầu với một form trống để tự thiết kế sự kiện.
              </p>
            </div>
          </div>

          {/* Long description section - hiển thị khi có template được chọn */}
          {selectedTemplate && (
            <div className="border rounded-lg p-6 bg-muted/30">
              <div className="flex items-center gap-3 mb-3">
                <selectedTemplate.icon className="h-6 w-6 text-primary" />
                <h4 className="font-semibold text-lg">
                  {selectedTemplate.name}
                </h4>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {selectedTemplate.longDescription}
              </p>
            </div>
          )}

          {/* Custom selection description */}
          {isCustomSelected && (
            <div className="border rounded-lg p-6 bg-muted/30">
              <div className="flex items-center gap-3 mb-3">
                <PlusCircle className="h-6 w-6 text-primary" />
                <h4 className="font-semibold text-lg">Tạo sự kiện tùy chỉnh</h4>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                Bạn sẽ được đưa đến form tạo sự kiện trống, nơi bạn có thể tự do
                thiết kế sự kiện theo ý muốn với các thông tin như tên sự kiện,
                ngày tháng, và cài đặt thông báo hoàn toàn tùy chỉnh.
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button
              onClick={handleNext}
              disabled={!selectedTemplate && !isCustomSelected}
              className="flex items-center gap-2"
            >
              Tiếp theo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
