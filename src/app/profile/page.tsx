import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, Bell } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Hồ sơ của tôi</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và cài đặt
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>Thông tin cơ bản về tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-gray-500" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-medium text-lg">Demo User</h3>
              <p className="text-sm text-muted-foreground">demo@example.com</p>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Ngày tham gia:</span>
                <span className="text-sm text-muted-foreground">June 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Tổng lời nhắc:</span>
                <span className="text-sm text-muted-foreground">0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt
          </CardTitle>
          <CardDescription>Tùy chỉnh trải nghiệm sử dụng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Thông báo</span>
              </div>
              <Button variant="outline" size="sm" disabled>
                Sắp có
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Chế độ tối</span>
              <Button variant="outline" size="sm" disabled>
                Sắp có
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ngôn ngữ</span>
              <Button variant="outline" size="sm" disabled>
                Tiếng Việt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Section */}
      <Card>
        <CardHeader>
          <CardTitle>Xác thực</CardTitle>
          <CardDescription>
            Tính năng đăng nhập/đăng ký sẽ được phát triển trong tương lai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Hiện tại ứng dụng hoạt động ở chế độ demo. Tất cả dữ liệu được lưu
              tạm thời.
            </p>

            <div className="flex gap-4">
              <Button disabled>Đăng nhập</Button>
              <Button variant="outline" disabled>
                Đăng ký
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Back to Home */}
      <div className="text-center">
        <Link href="/">
          <Button variant="outline">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
