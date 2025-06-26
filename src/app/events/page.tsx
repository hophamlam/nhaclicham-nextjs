"use client";

import { createClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type Reminder } from "@/types/reminder";
import { EventsList } from "@/components/EventsList";
import { Button } from "@/components/ui/button";
import { Plus, Info, Calendar } from "lucide-react";

import {
  TemplateSelectionDialog,
  type EventTemplate,
} from "@/components/TemplateSelectionDialog";
import { EventInfoDialog, type EventInfo } from "@/components/EventInfoDialog";
import { NotificationSettingsDialog } from "@/components/NotificationSettingsDialog";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

/**
 * Trang quản lý tất cả sự kiện của người dùng
 * Hiển thị danh sách sự kiện và cho phép tạo mới qua dialog
 */
export default function EventsPage() {
  const [events, setEvents] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  // States for dialogs
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showEventInfoDialog, setShowEventInfoDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Data for dialogs
  const [selectedTemplate, setSelectedTemplate] =
    useState<EventTemplate | null>(null);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [editingEvent, setEditingEvent] = useState<Reminder | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Reminder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();
  const router = useRouter();

  // Lấy tất cả sự kiện của người dùng
  const fetchEvents = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*, notification_settings(*)")
        .eq("user_id", userId)
        .order("lunar_month", { ascending: true })
        .order("lunar_day", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        return [];
      }

      return data.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        isLunar: event.is_lunar,
        isLeapMonth: event.is_leap_month,
        lunarDay: event.lunar_day,
        lunarMonth: event.lunar_month,
        lunarYear: event.lunar_year,
        repeatYearly: event.lunar_repeat_yearly,
        solarDate: event.solar_date,
        preferredAdvanceDays: event.preferred_advance_days,
        notification_settings: event.notification_settings,
      }));
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };

  useEffect(() => {
    const checkAuthAndFetchEvents = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/");
          return;
        }

        setUser(session.user);
        const userEvents = await fetchEvents(session.user.id);
        setEvents(userEvents);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchEvents();
  }, [supabase, router]);

  // Reload events sau khi tạo mới/sửa
  const handleEventUpserted = async () => {
    if (user) {
      toast.success(
        editingEvent ? "Cập nhật sự kiện thành công!" : "Đã tạo sự kiện mới!"
      );
      const updatedEvents = await fetchEvents(user.id);
      setEvents(updatedEvents);
    }
  };

  // Mở dialog chọn template
  const handleOpenCreateFlow = () => {
    console.log("DEBUG: EventsPage -> handleOpenCreateFlow called");
    setShowTemplateDialog(true);
  };

  // Xử lý khi chọn template xong
  const handleTemplateSelect = (template: EventTemplate | null) => {
    setSelectedTemplate(template);
    setShowTemplateDialog(false);
    // Mở dialog thông tin sự kiện (bước 2)
    setShowEventInfoDialog(true);
  };

  // Xử lý khi hoàn thành nhập thông tin sự kiện
  const handleEventInfoNext = (eventInfoData: EventInfo) => {
    setEventInfo(eventInfoData);
    setShowEventInfoDialog(false);
    // Mở dialog notification settings (bước 3)
    setShowNotificationDialog(true);
  };

  // Xử lý quay lại từ NotificationSettingsDialog
  const handleNotificationBack = () => {
    setShowNotificationDialog(false);
    setShowEventInfoDialog(true);
  };

  // Xử lý hoàn thành tạo event từ NotificationSettingsDialog
  const handleNotificationComplete = () => {
    setShowNotificationDialog(false);
    setSelectedTemplate(null);
    setEventInfo(null);
    handleEventUpserted(); // Refresh danh sách
  };

  // Xử lý quay lại từ EventInfoDialog
  const handleEventInfoBack = () => {
    setShowEventInfoDialog(false);
    setShowTemplateDialog(true);
  };

  // Xử lý mở dialog edit
  const handleEditEvent = (event: Reminder) => {
    setEditingEvent(event);
    setShowEditDialog(true);
  };

  // Xử lý đóng dialog edit
  const handleCloseEditDialog = () => {
    setEditingEvent(null);
    setShowEditDialog(false);
  };

  // Xử lý mở dialog delete
  const handleDeleteEvent = (event: Reminder) => {
    setDeletingEvent(event);
    setShowDeleteDialog(true);
  };

  // Xử lý đóng dialog delete
  const handleCloseDeleteDialog = () => {
    setDeletingEvent(null);
    setShowDeleteDialog(false);
  };

  // Xử lý xác nhận xóa event
  const handleConfirmDelete = async () => {
    if (!deletingEvent || !user) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", deletingEvent.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Lỗi xóa event:", error);
        toast.error("Không thể xóa sự kiện: " + error.message);
      } else {
        toast.success("Đã xóa sự kiện thành công!");
        handleCloseDeleteDialog();
        handleEventUpserted(); // Refresh danh sách
      }
    } catch (error) {
      console.error("Lỗi xóa event:", error);
      toast.error("Đã có lỗi xảy ra khi xóa sự kiện");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Tất cả Sự kiện
            </h1>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Tất cả Sự kiện
            </h1>
            <p className="text-muted-foreground">
              Quản lý các sự kiện và lời nhắc của bạn
            </p>
          </div>
        </div>
        <Button onClick={handleOpenCreateFlow}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo sự kiện mới
        </Button>
      </div>

      {/* Events List */}
      {events.length > 0 ? (
        <div className="space-y-4">
          <EventsList
            events={events}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </div>
      ) : (
        <div className="text-center py-16 space-y-6">
          <div className="bg-muted rounded-full w-24 h-24 flex items-center justify-center mx-auto">
            <Info className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Chưa có sự kiện nào
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Hãy bắt đầu bằng cách tạo sự kiện đầu tiên của bạn. Bạn có thể tạo
              lời nhắc cho ngày giỗ, sinh nhật, kỷ niệm theo lịch âm.
            </p>
          </div>
          <Button onClick={handleOpenCreateFlow}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo sự kiện đầu tiên
          </Button>
        </div>
      )}

      {/* Template Selection Dialog */}
      <TemplateSelectionDialog
        isOpen={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Event Info Dialog */}
      <EventInfoDialog
        isOpen={showEventInfoDialog}
        onClose={() => setShowEventInfoDialog(false)}
        onBack={handleEventInfoBack}
        onNext={handleEventInfoNext}
        templateData={selectedTemplate}
      />

      {/* Notification Settings Dialog */}
      {eventInfo && (
        <NotificationSettingsDialog
          isOpen={showNotificationDialog}
          onClose={() => setShowNotificationDialog(false)}
          onBack={handleNotificationBack}
          onComplete={handleNotificationComplete}
          templateData={selectedTemplate}
          eventInfo={eventInfo}
        />
      )}

      {/* Edit Event Dialog */}
      {editingEvent && (
        <CreateEventDialog
          isOpen={showEditDialog}
          onClose={handleCloseEditDialog}
          onEventCreated={() => {
            handleCloseEditDialog();
            handleEventUpserted();
          }}
          editingEvent={editingEvent}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold text-foreground">
              Xác nhận xóa
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Bạn có chắc chắn muốn xóa sự kiện{" "}
              <strong>&quot;{deletingEvent.title}&quot;</strong>? Hành động này
              không thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleCloseDeleteDialog}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
