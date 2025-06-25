import LunarCalendarCard from "@/components/LunarCalendarCard";
import LunarConverterDemo from "@/components/LunarConverterDemo";

export default function LunarTestPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        🌙 Demo Thư viện Lịch Âm Việt Nam
      </h1>

      <div className="space-y-8">
        {/* Card hiển thị lịch âm hôm nay */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Lịch âm hôm nay
          </h2>
          <LunarCalendarCard />
        </section>

        {/* Demo chuyển đổi */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Công cụ chuyển đổi và thông tin chi tiết
          </h2>
          <LunarConverterDemo />
        </section>

        {/* Thông tin thư viện */}
        <section className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            📖 Thông tin về thư viện
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Thư viện được sử dụng:
                </h3>
                <p className="font-mono bg-blue-100 px-3 py-1 rounded inline-block">
                  @nghiavuive/lunar_date_vi
                </p>
                <p className="mt-2">
                  <a
                    href="https://github.com/nacana22/lunar-date"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    🔗 GitHub Repository
                  </a>
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Tính năng chính:</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Chuyển đổi chính xác giữa dương lịch và âm lịch</li>
                  <li>Hỗ trợ năm nhuận và tháng nhuận âm lịch</li>
                  <li>Thông tin can chi (năm, tháng, ngày, giờ)</li>
                  <li>Tính toán tiết khí</li>
                  <li>Xác định giờ hoàng đạo trong ngày</li>
                  <li>Hỗ trợ thứ trong tuần</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Ưu điểm so với thư viện cũ:
                </h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Độ chính xác cao hơn nhiều</li>
                  <li>API đầy đủ và dễ sử dụng</li>
                  <li>Hỗ trợ nhiều thông tin phong thủy</li>
                  <li>Được maintain và cập nhật thường xuyên</li>
                  <li>TypeScript support tốt</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
