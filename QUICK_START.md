# Quick Start Guide - Nhắc Lịch Âm Frontend

## 🚀 Setup nhanh trong 3 phút

### 1. Install dependencies

```bash
cd nhaclicham-frontend
npm install
```

### 2. Cấu hình Supabase

**Sao chép file environment:**

```bash
cp .env.example .env.local
```

**Cập nhật .env.local:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Lưu ý:** Đảm bảo backend đã setup Supabase và bảng `reminders` đã được tạo!

### 3. Chạy development server

```bash
npm run dev
```

Truy cập: http://localhost:3000

## 📱 Sử dụng

### ✅ Trang chủ (/)

- Xem ngày âm lịch hôm nay
- Danh sách lời nhắc cho hôm nay
- Tạo lời nhắc mới

### ✅ Trang tạo (/create)

- Form tạo lời nhắc:
  - Nội dung lời nhắc
  - Ngày âm lịch (1-30)
  - Tháng âm lịch (1-12)
  - Lặp lại hàng năm (checkbox)

### ✅ Trang hồ sơ (/profile)

- Placeholder cho authentication

## 🧪 Test Features

### 1. Test lunar calendar

```javascript
// Mở browser console trên trang chủ
import { LunarService } from "@/lib/lunarService";
console.log("Hôm nay:", LunarService.getTodayLunarDate());
```

### 2. Test tạo reminder

1. Truy cập `/create`
2. Nhập thông tin:
   - Nội dung: "Test reminder"
   - Ngày: 15
   - Tháng: 1
   - ✅ Lặp lại hàng năm
3. Click "Tạo lời nhắc"

### 3. Test responsive UI

- Resize browser window
- Test trên mobile/tablet

## 🏗️ Build Commands

```bash
npm run dev          # Development (http://localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

## ⚠️ Troubleshooting

**1. Lỗi "Module not found":**

```bash
rm -rf .next node_modules package-lock.json
npm install
```

**2. Lỗi Supabase connection:**

- Kiểm tra environment variables
- Đảm bảo backend Supabase đã setup
- Test với Postman: `GET http://backend-url/api/reminders/today`

**3. Lỗi lunar calendar:**

- Restart development server
- Check browser console for errors

**4. TypeScript errors:**

- Restart VS Code TypeScript server
- `Cmd/Ctrl + Shift + P` > "TypeScript: Restart TS Server"

## 🎯 Key Features

- ✅ **Responsive design** - Mobile first
- ✅ **Real-time lunar calendar** - Tính toán client-side
- ✅ **Modern UI** - shadcn/ui components
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Fast builds** - Next.js optimization

## 🔄 API Integration

### Supabase Operations

```typescript
// Tạo reminder
ReminderService.createReminder({
  user_id: "user-123",
  note: "Ngày giỗ tổ tiên",
  lunar_day: 10,
  lunar_month: 3,
  repeat_every_year: true,
});

// Lấy reminders hôm nay
ReminderService.getTodayReminders();
```

### Lunar Calendar

```typescript
// Ngày âm hôm nay
LunarService.getTodayLunarDate();

// Chuyển đổi
LunarService.convertSolarToLunar(new Date());
```

## 🚢 Deploy

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Environment Variables for Deploy

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js pages
│   ├── page.tsx        # Homepage
│   ├── create/         # Create reminder
│   └── profile/        # User profile
├── components/
│   ├── ui/             # shadcn components
│   ├── Navigation.tsx  # Main navigation
│   └── ReminderCard.tsx
├── lib/
│   ├── supabase.ts     # Supabase config
│   ├── lunarService.ts # Lunar calendar
│   └── reminderService.ts
└── types/
    └── reminder.ts     # TypeScript types
```

---

✅ **Frontend sẵn sàng sử dụng!**

Kết nối với backend và enjoy! 🎉
