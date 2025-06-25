"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  User,
  LogIn,
  LogOut,
  UserPlus,
  List,
  BellRing,
  Menu,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);

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

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navItems = [
    { href: "/app/dash", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/events", label: "Sự kiện", icon: List },
    {
      href: "/app/notification-providers",
      label: "Kênh thông báo",
      icon: BellRing,
    },
  ];

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata.display_name || "Chưa có tên"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/app/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Hồ sơ</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/settings")} disabled>
          <Settings className="mr-2 h-4 w-4" />
          <span>Cài đặt</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
        {user ? (
          <>
            {navItems.map((item) => (
              <DropdownMenuItem
                key={item.href}
                onSelect={() => router.push(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </DropdownMenuItem>
            ))}
          </>
        ) : (
          <>
            <DropdownMenuItem onSelect={() => router.push("/login")}>
              <LogIn className="mr-2 h-4 w-4" />
              <span>Đăng nhập</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/signup")}>
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Đăng ký</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="border-b bg-background shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-red-600" />
            <span className="font-bold text-lg text-foreground">
              Nhắc Lịch Âm
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                ))}
                <ThemeToggle />
                <UserMenu />
              </>
            )}
            {!user && (
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Đăng nhập</span>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Đăng ký</span>
                  </Button>
                </Link>
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
  );
}
