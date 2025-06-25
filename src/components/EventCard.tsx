import { type Reminder } from "@/types/reminder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Tag, CheckSquare, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface EventCardProps {
  event: Reminder;
  view: "grid" | "list";
  onEdit?: (event: Reminder) => void;
  onDelete?: (event: Reminder) => void;
}

export function EventCard({ event, view, onEdit, onDelete }: EventCardProps) {
  const isList = view === "list";

  if (isList) {
    return (
      <div className="flex items-center justify-between border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors duration-200 shadow-sm hover:shadow-md">
        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-medium text-sm mb-1 truncate">{event.title}</p>
          <p className="text-xs text-muted-foreground">
            Ngày {event.lunarDay}/{event.lunarMonth} Âm lịch
            {event.isLeapMonth && " (nhuận)"}
          </p>
        </div>
        <div className="flex gap-2 ml-4 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(event)}
            className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
          >
            <Edit className="h-4 w-4 mr-1" />
            Sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(event)}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Xóa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border hover:border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          {event.title}
        </CardTitle>
        {event.description && (
          <p className="text-sm text-muted-foreground pt-1">
            {event.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-500" />
            <span>
              Ngày {event.lunarDay}/{event.lunarMonth} Âm lịch
              {event.isLeapMonth && " (nhuận)"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-sky-500" />
            <span className="bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300 px-2 py-1 rounded-full text-xs font-medium">
              Hàng năm
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckSquare className="h-4 w-4 text-green-500" />
            <span className="text-green-700 dark:text-green-400 font-medium">
              Lịch Âm
            </span>
          </div>
        </div>

        <div className="pt-3 border-t flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(event)}
            className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
          >
            <Edit className="h-4 w-4 mr-2" />
            Sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(event)}
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
