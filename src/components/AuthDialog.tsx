"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

/**
 * Component AuthDialog - Form đăng nhập và đăng ký dạng dialog với tabs
 * @param isOpen - Trạng thái mở/đóng dialog
 * @param onClose - Hàm callback khi đóng dialog
 * @param defaultTab - Tab mặc định hiển thị
 */
export function AuthDialog({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  /**
   * Reset form khi chuyển tab hoặc đóng dialog
   */
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setConfirmPassword("");
    setShowPassword(false);
    setError(null);
    setMessage(null);
  };

  /**
   * Xử lý đóng dialog
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * Xử lý chuyển tab
   */
  const handleTabChange = (tab: "login" | "signup") => {
    resetForm();
    setActiveTab(tab);
  };

  /**
   * Xử lý đăng nhập
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        toast.error("Đăng nhập thất bại!");
      } else {
        handleClose();
        toast.success("Đăng nhập thành công!");
        // Redirect trực tiếp đến dashboard để tăng tốc
        router.push("/app/dash");
        router.refresh();
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý đăng ký
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        setError(error.message);
        toast.error("Đăng ký thất bại!");
      } else {
        setMessage(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản."
        );
        toast.success("Đăng ký thành công! Kiểm tra email của bạn.");
        setEmail("");
        setPassword("");
        setDisplayName("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header với Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === "login" ? "Đăng nhập" : "Đăng ký"}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Đóng</span>✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => handleTabChange("login")}
                  className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
                    activeTab === "login"
                      ? "border-b-2 border-red-600 text-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <LogIn className="h-4 w-4 inline mr-2" />
                  Đăng nhập
                </button>
                <button
                  onClick={() => handleTabChange("signup")}
                  className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
                    activeTab === "signup"
                      ? "border-b-2 border-red-600 text-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <UserPlus className="h-4 w-4 inline mr-2" />
                  Đăng ký
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
              {activeTab === "login" ? (
                /* Form Đăng nhập */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="email@example.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="login-password">Mật khẩu</Label>
                    <div className="relative mt-1">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>

                  <p className="text-sm text-center">
                    <Link
                      href="/forgot-password"
                      className="text-red-600 hover:text-red-500"
                      onClick={handleClose}
                    >
                      Quên mật khẩu?
                    </Link>
                  </p>
                </form>
              ) : (
                /* Form Đăng ký */
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Tên hiển thị</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tên của bạn"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="email@example.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Mật khẩu</Label>
                    <div className="relative mt-1">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-confirm-password">
                      Xác nhận mật khẩu
                    </Label>
                    <Input
                      id="signup-confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-md text-sm">
                      {message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Bằng việc đăng ký, bạn đồng ý với{" "}
                    <Link href="#" className="text-red-600 hover:text-red-500">
                      Điều khoản sử dụng
                    </Link>{" "}
                    và{" "}
                    <Link href="#" className="text-red-600 hover:text-red-500">
                      Chính sách bảo mật
                    </Link>{" "}
                    của chúng tôi.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
