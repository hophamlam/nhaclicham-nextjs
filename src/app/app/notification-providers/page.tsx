"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  Plus,
  Info,
  BellRing,
  Mail,
  Bot,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

interface Provider {
  id: string;
  type: string;
  name: string;
  config: any;
  created_at: string;
  is_default: boolean;
}

/**
 * Trang quản lý kênh thông báo với dialog thêm mới và tích hợp Supabase
 */
export default function NotificationProvidersPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(
    null
  );
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const providerTypes = [
    {
      value: "email",
      label: "Email",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      value: "discord_webhook",
      label: "Discord Webhook",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      value: "telegram_bot",
      label: "Telegram Bot",
      icon: <Bot className="h-4 w-4" />,
    },
  ];

  /**
   * Lấy danh sách providers từ database
   */
  const fetchProviders = useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("notification_providers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Lỗi lấy providers:", error);
        toast.error("Không thể tải danh sách kênh thông báo");
      } else {
        setProviders(data || []);
      }
    } catch (error) {
      console.error("Lỗi fetch providers:", error);
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router]);

  /**
   * Reset form về trạng thái ban đầu
   */
  const resetForm = () => {
    setType("");
    setName("");
    setEmailAddress("");
    setWebhookUrl("");
    setBotToken("");
    setChatId("");
    setShowSecrets(false);
    setIsDefault(false);
  };

  /**
   * Xử lý đóng dialog thêm mới
   */
  const handleCloseDialog = () => {
    resetForm();
    setShowAddDialog(false);
  };

  /**
   * Xử lý mở dialog edit provider
   */
  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setType(provider.type);
    setName(provider.name);

    // Load config values dựa trên type
    switch (provider.type) {
      case "email":
        setEmailAddress(provider.config.email_address || "");
        break;
      case "discord_webhook":
        setWebhookUrl(provider.config.webhook_url || "");
        break;
      case "telegram_bot":
        setBotToken(provider.config.bot_token || "");
        setChatId(provider.config.chat_id || "");
        break;
    }

    setIsDefault(provider.is_default || false);
    setShowEditDialog(true);
  };

  /**
   * Xử lý đóng dialog edit
   */
  const handleCloseEditDialog = () => {
    resetForm();
    setEditingProvider(null);
    setShowEditDialog(false);
  };

  /**
   * Xử lý mở dialog delete confirmation
   */
  const handleDeleteProvider = (provider: Provider) => {
    setDeletingProvider(provider);
    setShowDeleteDialog(true);
  };

  /**
   * Xử lý đóng dialog delete
   */
  const handleCloseDeleteDialog = () => {
    setDeletingProvider(null);
    setShowDeleteDialog(false);
  };

  /**
   * Xử lý xác nhận xóa provider
   */
  const handleConfirmDelete = async () => {
    if (!deletingProvider) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("notification_providers")
        .delete()
        .eq("id", deletingProvider.id);

      if (error) {
        console.error("Lỗi xóa provider:", error);
        toast.error("Không thể xóa kênh thông báo: " + error.message);
      } else {
        toast.success("Đã xóa kênh thông báo thành công!");
        handleCloseDeleteDialog();
        fetchProviders(); // Refresh danh sách
      }
    } catch (error) {
      console.error("Lỗi xóa provider:", error);
      toast.error("Đã có lỗi xảy ra khi xóa kênh thông báo");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Xử lý cập nhật provider
   */
  const handleUpdateProvider = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !name || !editingProvider) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
        return;
      }

      // Tạo config object dựa trên type
      let config = {};
      switch (type) {
        case "email":
          if (!emailAddress) {
            toast.error("Vui lòng nhập địa chỉ email");
            return;
          }
          config = { email_address: emailAddress };
          break;
        case "discord_webhook":
          if (!webhookUrl) {
            toast.error("Vui lòng nhập Discord Webhook URL");
            return;
          }
          config = { webhook_url: webhookUrl };
          break;
        case "telegram_bot":
          if (!botToken || !chatId) {
            toast.error("Vui lòng nhập Bot Token và Chat ID");
            return;
          }
          config = { bot_token: botToken, chat_id: chatId };
          break;
      }

      // Nếu đặt làm mặc định, uncheck tất cả providers khác
      if (isDefault) {
        await supabase
          .from("notification_providers")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .neq("id", editingProvider.id);
      }

      // Cập nhật trong database
      const { error } = await supabase
        .from("notification_providers")
        .update({
          type: type,
          name: name,
          config: config,
          is_default: isDefault,
        })
        .eq("id", editingProvider.id);

      if (error) {
        console.error("Lỗi cập nhật provider:", error);
        toast.error("Không thể cập nhật kênh thông báo: " + error.message);
      } else {
        toast.success("Đã cập nhật kênh thông báo thành công!");
        handleCloseEditDialog();
        fetchProviders(); // Refresh danh sách
      }
    } catch (error) {
      console.error("Lỗi cập nhật provider:", error);
      toast.error("Đã có lỗi xảy ra khi cập nhật kênh thông báo");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Xử lý submit form thêm provider
   */
  const handleSubmitProvider = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !name) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
        return;
      }

      // Tạo config object dựa trên type
      let config = {};
      switch (type) {
        case "email":
          if (!emailAddress) {
            toast.error("Vui lòng nhập địa chỉ email");
            return;
          }
          config = { email_address: emailAddress };
          break;
        case "discord_webhook":
          if (!webhookUrl) {
            toast.error("Vui lòng nhập Discord Webhook URL");
            return;
          }
          config = { webhook_url: webhookUrl };
          break;
        case "telegram_bot":
          if (!botToken || !chatId) {
            toast.error("Vui lòng nhập Bot Token và Chat ID");
            return;
          }
          config = { bot_token: botToken, chat_id: chatId };
          break;
      }

      // Nếu đặt làm mặc định, uncheck tất cả providers khác
      if (isDefault) {
        await supabase
          .from("notification_providers")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      // Lưu vào database
      const { error } = await supabase.from("notification_providers").insert({
        user_id: user.id,
        type: type,
        name: name,
        config: config,
        is_default: isDefault,
      });

      if (error) {
        console.error("Lỗi tạo provider:", error);
        toast.error("Không thể tạo kênh thông báo: " + error.message);
      } else {
        toast.success("Đã thêm kênh thông báo thành công!");
        handleCloseDialog();
        fetchProviders(); // Refresh danh sách
      }
    } catch (error) {
      console.error("Lỗi submit provider:", error);
      toast.error("Đã có lỗi xảy ra khi tạo kênh thông báo");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load providers khi component mount
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Memoize dialog content để tránh re-render
  const dialogContent = useMemo(() => {
    const renderFormFields = (isEdit = false) => {
      const prefix = isEdit ? "edit" : "add";

      return (
        <div className="space-y-6">
          {/* Tên định danh */}
          <div>
            <Label htmlFor={`${prefix}_name`}>Tên định danh</Label>
            <Input
              id={`${prefix}_name`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Email cá nhân, Discord lớp"
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tên để bạn dễ dàng nhận biết kênh thông báo này.
            </p>
          </div>

          {/* Loại kênh thông báo */}
          <div>
            <Label htmlFor={`${prefix}_type`}>Loại</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {providerTypes.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setType(p.value)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                    type === p.value
                      ? "border-red-600 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-600"
                  }`}
                >
                  {p.icon}
                  <span
                    className={`font-medium ${
                      type === p.value
                        ? "text-red-700 dark:text-red-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Các trường config theo từng type */}
          {type === "email" && (
            <div>
              <Label htmlFor={`${prefix}_email`}>Địa chỉ Email</Label>
              <Input
                id={`${prefix}_email`}
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="example@email.com"
                required
                className="mt-1"
              />
            </div>
          )}

          {type === "discord_webhook" && (
            <div>
              <Label htmlFor={`${prefix}_webhook`}>Discord Webhook URL</Label>
              <Input
                id={`${prefix}_webhook`}
                type={showSecrets ? "text" : "password"}
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                required
                className="mt-1"
              />
            </div>
          )}

          {type === "telegram_bot" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor={`${prefix}_bot_token`}>Bot Token</Label>
                <Input
                  id={`${prefix}_bot_token`}
                  type={showSecrets ? "text" : "password"}
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456:ABC-DEF1234..."
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`${prefix}_chat_id`}>Chat ID</Label>
                <Input
                  id={`${prefix}_chat_id`}
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="ID của cuộc trò chuyện hoặc kênh"
                  required
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Toggle hiển thị secrets */}
          {(type === "discord_webhook" || type === "telegram_bot") && (
            <div className="flex items-center justify-end gap-2">
              <Label htmlFor="show-secrets" className="text-sm">
                {showSecrets
                  ? "Ẩn thông tin nhạy cảm"
                  : "Hiện thông tin nhạy cảm"}
              </Label>
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="p-2 rounded-full hover:bg-muted"
              >
                {showSecrets ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          {/* Đặt làm mặc định */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <input
              type="checkbox"
              id={`${prefix}_is_default`}
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <Label
              htmlFor={`${prefix}_is_default`}
              className="text-sm font-medium"
            >
              Đặt làm kênh thông báo mặc định
            </Label>
          </div>
        </div>
      );
    };

    return { renderFormFields };
  }, [
    type,
    name,
    emailAddress,
    webhookUrl,
    botToken,
    chatId,
    showSecrets,
    isDefault,
  ]);

  // Dialog thêm kênh mới - dùng useMemo để tránh remount mỗi khi gõ phím
  const AddProviderDialog = useMemo(() => {
    if (!showAddDialog) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleCloseDialog}
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
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-6 w-6 text-blue-600" />
                Thêm kênh thông báo
              </h2>
              <button
                onClick={handleCloseDialog}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProvider} className="space-y-4">
              <div>
                <Label>Loại kênh thông báo</Label>
                <Select
                  value={type}
                  onValueChange={setType}
                  placeholder="Chọn loại kênh..."
                  options={providerTypes}
                  className="mt-1"
                />
              </div>

              {dialogContent.renderFormFields(false)}

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={!type || !name || isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang thêm...
                    </>
                  ) : (
                    "Thêm kênh"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }, [
    showAddDialog,
    type,
    name,
    emailAddress,
    webhookUrl,
    botToken,
    chatId,
    showSecrets,
    isDefault,
    isSubmitting,
  ]);

  // Dialog chỉnh sửa kênh - memoized để giữ focus
  const EditProviderDialog = useMemo(() => {
    if (!showEditDialog || !editingProvider) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleCloseEditDialog}
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
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Edit className="h-6 w-6 text-amber-600" />
                Chỉnh sửa kênh thông báo
              </h2>
              <button
                onClick={handleCloseEditDialog}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Đang chỉnh sửa:</strong> {editingProvider.name}
              </p>
            </div>

            <form onSubmit={handleUpdateProvider} className="space-y-4">
              <div>
                <Label>Loại kênh thông báo</Label>
                <Select
                  value={type}
                  onValueChange={setType}
                  placeholder="Chọn loại kênh..."
                  options={providerTypes}
                  className="mt-1"
                />
              </div>

              {dialogContent.renderFormFields(true)}

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseEditDialog}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={!type || !name || isSubmitting}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }, [
    showEditDialog,
    editingProvider,
    type,
    name,
    emailAddress,
    webhookUrl,
    botToken,
    chatId,
    showSecrets,
    isDefault,
    isSubmitting,
  ]);

  // Dialog xác nhận xóa - memoized để không remount khi nhập liệu
  const DeleteConfirmDialog = useMemo(() => {
    if (!showDeleteDialog || !deletingProvider) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleCloseDeleteDialog}
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
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
                <Trash2 className="h-6 w-6" />
                Xác nhận xóa
              </h2>
              <button
                onClick={handleCloseDeleteDialog}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      {deletingProvider.type === "email" && (
                        <Mail className="h-4 w-4 text-red-600" />
                      )}
                      {deletingProvider.type === "discord_webhook" && (
                        <MessageSquare className="h-4 w-4 text-red-600" />
                      )}
                      {deletingProvider.type === "telegram_bot" && (
                        <Bot className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-red-900">
                      {deletingProvider.name}
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      {deletingProvider.type === "email" && "Email"}
                      {deletingProvider.type === "discord_webhook" &&
                        "Discord Webhook"}
                      {deletingProvider.type === "telegram_bot" &&
                        "Telegram Bot"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-700 mb-2">
                  Bạn có chắc chắn muốn xóa kênh thông báo này không?
                </p>
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDeleteDialog}
                className="flex-1"
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa ngay
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [showDeleteDialog, deletingProvider, isDeleting]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <BellRing className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Kênh thông báo
            </h1>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-muted rounded-lg"></div>
          <div className="h-20 bg-muted rounded-lg"></div>
          <div className="h-20 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BellRing className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Kênh thông báo
            </h1>
            <p className="text-muted-foreground">
              Quản lý các kênh nhận lời nhắc của bạn
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm kênh mới
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              Kênh thông báo là gì?
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Đây là các kênh mà bạn sẽ nhận được lời nhắc, ví dụ như Email,
              Discord, Telegram, v.v. Bạn có thể chọn kênh mặc định để tự động
              thêm vào các sự kiện mới.
            </p>
          </div>
        </div>
      </div>

      {/* Providers List */}
      <div>
        {providers.length > 0 ? (
          <div className="space-y-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="bg-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-full">
                      {
                        providerTypes.find((p) => p.value === provider.type)
                          ?.icon
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {provider.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {
                          providerTypes.find((p) => p.value === provider.type)
                            ?.label
                        }
                      </p>
                    </div>
                    {provider.is_default && (
                      <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 rounded-full">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditProvider(provider)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteProvider(provider)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-6">
            <div className="bg-muted rounded-full w-24 h-24 flex items-center justify-center mx-auto">
              <BellRing className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Chưa có kênh thông báo nào
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Hãy thêm kênh đầu tiên để bắt đầu nhận lời nhắc cho các sự kiện
                quan trọng của bạn.
              </p>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm kênh đầu tiên
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit/Delete Dialogs */}
      {(showAddDialog || showEditDialog) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-lg w-full">
            <form
              onSubmit={
                showEditDialog ? handleUpdateProvider : handleSubmitProvider
              }
            >
              <h2 className="text-xl font-bold text-foreground mb-6">
                {showEditDialog
                  ? "Chỉnh sửa kênh thông báo"
                  : "Thêm kênh thông báo mới"}
              </h2>

              {dialogContent.renderFormFields(showEditDialog)}

              <div className="mt-8 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={
                    showEditDialog ? handleCloseEditDialog : handleCloseDialog
                  }
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteDialog && deletingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold text-foreground">
              Xác nhận xóa
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Bạn có chắc chắn muốn xóa kênh{" "}
              <strong>&quot;{deletingProvider.name}&quot;</strong>?
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
