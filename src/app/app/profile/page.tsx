"use client";

import { createClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Key,
  Save,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// List of timezones
const timezones = [
  { value: "Etc/GMT+12", label: "(GMT-12:00) International Date Line West" },
  { value: "Etc/GMT+11", label: "(GMT-11:00) Midway Island, Samoa" },
  { value: "Etc/GMT+10", label: "(GMT-10:00) Hawaii" },
  { value: "Etc/GMT+9", label: "(GMT-09:00) Alaska" },
  { value: "Etc/GMT+8", label: "(GMT-08:00) Pacific Time (US & Canada)" },
  { value: "Etc/GMT+7", label: "(GMT-07:00) Mountain Time (US & Canada)" },
  {
    value: "Etc/GMT+6",
    label: "(GMT-06:00) Central Time (US & Canada), Mexico City",
  },
  {
    value: "Etc/GMT+5",
    label: "(GMT-05:00) Eastern Time (US & Canada), Bogota, Lima",
  },
  {
    value: "Etc/GMT+4",
    label: "(GMT-04:00) Atlantic Time (Canada), Caracas, La Paz",
  },
  { value: "Etc/GMT+3", label: "(GMT-03:00) Brazil, Buenos Aires, Georgetown" },
  { value: "Etc/GMT+2", label: "(GMT-02:00) Mid-Atlantic" },
  { value: "Etc/GMT+1", label: "(GMT-01:00) Azores, Cape Verde Islands" },
  {
    value: "Etc/GMT",
    label: "(GMT+00:00) Western Europe Time, London, Lisbon, Casablanca",
  },
  {
    value: "Etc/GMT-1",
    label: "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris",
  },
  { value: "Etc/GMT-2", label: "(GMT+02:00) Kaliningrad, South Africa" },
  {
    value: "Etc/GMT-3",
    label: "(GMT+03:00) Baghdad, Riyadh, Moscow, St. Petersburg",
  },
  { value: "Etc/GMT-4", label: "(GMT+04:00) Abu Dhabi, Muscat, Baku, Tbilisi" },
  {
    value: "Etc/GMT-5",
    label: "(GMT+05:00) Ekaterinburg, Islamabad, Karachi, Tashkent",
  },
  { value: "Etc/GMT-6", label: "(GMT+06:00) Almaty, Dhaka, Colombo" },
  { value: "Etc/GMT-7", label: "(GMT+07:00) Bangkok, Hanoi, Jakarta" },
  {
    value: "Etc/GMT-8",
    label: "(GMT+08:00) Beijing, Perth, Singapore, Hong Kong",
  },
  {
    value: "Etc/GMT-9",
    label: "(GMT+09:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk",
  },
  {
    value: "Etc/GMT-10",
    label: "(GMT+10:00) Eastern Australia, Guam, Vladivostok",
  },
  {
    value: "Etc/GMT-11",
    label: "(GMT+11:00) Magadan, Solomon Islands, New Caledonia",
  },
  {
    value: "Etc/GMT-12",
    label: "(GMT+12:00) Auckland, Wellington, Fiji, Kamchatka",
  },
];

// Interface cho profile data từ database
interface ProfileData {
  id: string;
  display_name?: string;
  gender?: string;
  birth_date?: string;
  birth_time?: string;
  birth_timezone?: string;
  personal_info_updated_at?: string;
  timezone_auto_detected?: boolean;
  default_notify_time?: string;
}

/**
 * Trang hồ sơ người dùng
 * Cho phép cập nhật thông tin cá nhân, ngày sinh, múi giờ và đổi mật khẩu
 * Tích hợp với table profiles theo db schema mới
 */
export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthTimezone, setBirthTimezone] = useState("Asia/Ho_Chi_Minh");
  const [defaultNotifyTime, setDefaultNotifyTime] = useState("07:00");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI states
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    /**
     * Lấy thông tin người dùng và profile từ database
     */
    const getUserAndProfile = async () => {
      try {
        // Lấy user từ auth
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push("/");
          return;
        }
        setUser(user);

        // Lấy profile từ table profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Lỗi lấy profile:", profileError);
        } else if (profileData) {
          setProfile(profileData);
          // Set form values
          setDisplayName(profileData.display_name || "");
          setGender(profileData.gender || "");
          setBirthDate(profileData.birth_date || "");
          setBirthTime(profileData.birth_time || "");
          setBirthTimezone(profileData.birth_timezone || "Asia/Ho_Chi_Minh");
          setDefaultNotifyTime(
            (profileData.default_notify_time || "07:00:00").slice(0, 5)
          );
        } else {
          // Tạo profile mới nếu chưa có
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              display_name: user.user_metadata.display_name || null,
              birth_timezone: "Asia/Ho_Chi_Minh",
            });

          if (insertError) {
            console.error("Lỗi tạo profile:", insertError);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
      }
    };

    getUserAndProfile();
  }, [supabase, router]);

  /**
   * Xử lý cập nhật thông tin hồ sơ
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      if (!user) return;

      // Cập nhật display_name trong auth.users metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Cập nhật profile trong table profiles
      const profileUpdateData = {
        display_name: displayName || null,
        gender: gender || null,
        birth_date: birthDate || null,
        birth_time: birthTime || null,
        birth_timezone: birthTimezone,
        personal_info_updated_at: new Date().toISOString(),
        default_notify_time: defaultNotifyTime + ":00",
      };

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        ...profileUpdateData,
      });

      if (profileError) {
        setError("Lỗi cập nhật profile: " + profileError.message);
        return;
      }

      setMessage("Hồ sơ đã được cập nhật thành công!");

      // Refresh user data
      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra khi cập nhật hồ sơ.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý cập nhật mật khẩu
   */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Mật khẩu đã được cập nhật thành công!");
        setPassword("");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra khi cập nhật mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hồ sơ của tôi</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân, ngày sinh và bảo mật
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-300 px-4 py-3 rounded-md">
          {message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Personal Information Card - 2 cột */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Email (read-only) */}
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="pl-9 bg-muted/50"
                  />
                </div>
              </div>

              {/* Display Name */}
              <div>
                <Label htmlFor="displayName">Tên hiển thị</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tên của bạn"
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <Label htmlFor="gender">Giới tính</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="mt-1" id="gender">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Birth Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthDate">Ngày sinh (Dương lịch)</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="birthTime">Giờ sinh</Label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="birthTime"
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Timezone */}
              <div>
                <Label htmlFor="birthTimezone">Múi giờ</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={birthTimezone}
                    onValueChange={setBirthTimezone}
                  >
                    <SelectTrigger className="pl-9" id="birthTimezone">
                      <SelectValue placeholder="Chọn múi giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {profile.timezone_auto_detected && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Múi giờ của bạn được tự động phát hiện.
                  </p>
                )}
              </div>

              {/* Default Notify Time */}
              <div>
                <Label htmlFor="defaultNotifyTime">
                  Thời gian thông báo mặc định
                </Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="defaultNotifyTime"
                    type="time"
                    value={defaultNotifyTime}
                    onChange={(e) => setDefaultNotifyTime(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Thời gian mặc định trong ngày để gửi thông báo sự kiện.
                </p>
              </div>

              <div className="pt-6 border-t">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card - 1 cột */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <Label htmlFor="password">Mật khẩu mới</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Để trống nếu bạn không muốn thay đổi.
                </p>
              </div>
              <div className="pt-6 border-t">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Đang lưu..." : "Cập nhật mật khẩu"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ngày tạo:</span>
            <span className="font-medium">
              {new Date(user.created_at).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Xác minh email:</span>
            <span
              className={`font-medium ${
                user.email_confirmed_at ? "text-green-600" : "text-orange-600"
              }`}
            >
              {user.email_confirmed_at ? "Đã xác minh" : "Chưa xác minh"}
            </span>
          </div>
          {profile?.personal_info_updated_at && (
            <div className="flex justify-between">
              <span className="text-gray-600">Cập nhật cuối:</span>
              <span className="font-medium">
                {new Date(profile.personal_info_updated_at).toLocaleDateString(
                  "vi-VN"
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
