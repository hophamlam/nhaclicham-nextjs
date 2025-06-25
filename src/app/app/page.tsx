import { redirect } from "next/navigation";

/**
 * Trang chuyển hướng từ /app đến /app/dash
 * Đây là entry point cho người dùng đã đăng nhập
 */
export default function AppPage() {
  redirect("/app/dash");
}
