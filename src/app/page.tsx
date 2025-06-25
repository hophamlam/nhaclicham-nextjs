import { HomepageNavigation } from "@/components/HomepageNavigation";
import { LunarCalendarCard } from "@/components/LunarCalendarCard";
import { LunarConverterDemo } from "@/components/LunarConverterDemo";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Trang chủ của ứng dụng Nhắc Lịch Âm
 * Hiển thị thông tin về ứng dụng và demo tính năng
 */
export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header với navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Nhắc Lịch Âm</h1>
          <div className="flex items-center gap-4">
            <HomepageNavigation />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ứng dụng nhắc nhở theo lịch âm Việt Nam
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Thiết lập và quản lý các nhắc nhở quan trọng theo lịch âm. Đừng bao
          giờ quên các ngày lễ, ngày giỗ, và sự kiện quan trọng nữa.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/app"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90"
          >
            Bắt đầu sử dụng
          </a>
          <a
            href="/lunar-test"
            className="border border-input px-6 py-3 rounded-lg font-medium hover:bg-accent"
          >
            Thử nghiệm chuyển đổi lịch
          </a>
        </div>
      </section>

      {/* Features section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Demo chuyển đổi lịch âm</h3>
            <LunarConverterDemo />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4">Lịch âm hôm nay</h3>
            <LunarCalendarCard />
          </div>
        </div>
      </section>
    </div>
  );
}
