"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, User, LogIn, LogOut, UserPlus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { AuthDialog } from "./AuthDialog";
import { ThemeToggle } from "./ThemeToggle";

/**
 * HomepageNavigation - Navigation đặc biệt cho trang chủ
 * Có links đến các sections và AuthDialog thay vì redirect
 */
export function HomepageNavigation() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<"login" | "signup">(
    "login"
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Initial fetch
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    // Lắng nghe events từ homepage buttons
    const handleOpenAuthDialog = (event: Event) => {
      const customEvent = event as CustomEvent<{ tab: "login" | "signup" }>;
      const { tab } = customEvent.detail;
      setAuthDialogTab(tab);
      setShowAuthDialog(true);
    };

    window.addEventListener("openAuthDialog", handleOpenAuthDialog);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("openAuthDialog", handleOpenAuthDialog);
    };
  }, [supabase]);

  /**
   * Xử lý đăng xuất
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  /**
   * Xử lý mở dialog đăng nhập
   */
  const openLoginDialog = () => {
    setAuthDialogTab("login");
    setShowAuthDialog(true);
  };

  /**
   * Xử lý mở dialog đăng ký
   */
  const openSignupDialog = () => {
    setAuthDialogTab("signup");
    setShowAuthDialog(true);
  };

  /**
   * Scroll đến section
   */
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">
            {user?.user_metadata.display_name || "Chưa có tên"}
          </p>
          <p className="text-xs leading-none text-muted-foreground">
            {user?.email}
          </p>
        </div>
        <DropdownMenuItem onSelect={() => router.push("/app/dash")}>
          <Calendar className="mr-2 h-4 w-4" />
          <span>Vào ứng dụng</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MobileMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Navigation items */}
        <DropdownMenuItem onSelect={() => scrollToSection("features")}>
          Tính năng
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => scrollToSection("how-it-works")}>
          Cách sử dụng
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => scrollToSection("pricing")}>
          Bảng giá
        </DropdownMenuItem>

        {user ? (
          <>
            <DropdownMenuItem onSelect={() => router.push("/app/dash")}>
              <Calendar className="mr-2 h-4 w-4" />
              Vào ứng dụng
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onSelect={openLoginDialog}>
            <LogIn className="mr-2 h-4 w-4" />
            <span>Đăng nhập</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <nav className="bg-background shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-red-600" />
              <span className="font-bold text-lg text-foreground">
                Nhắc Lịch Âm
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Navigation Links */}
              <button
                onClick={() => scrollToSection("features")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Tính năng
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Cách sử dụng
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Bảng giá
              </button>

              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/app/dash">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      Vào ứng dụng
                    </Button>
                  </Link>
                  <ThemeToggle />
                  <UserMenu />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <Button
                    size="sm"
                    onClick={openLoginDialog}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Đăng nhập</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* AuthDialog */}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        defaultTab={authDialogTab}
      />
    </>
  );
}
