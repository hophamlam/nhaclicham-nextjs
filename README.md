# Nhắc Lịch Âm Frontend

Frontend cho ứng dụng nhắc lịch âm Việt Nam, được xây dựng với Next.js, TypeScript, Tailwind CSS và shadcn/ui.

## Tính năng

- ✅ Hiển thị ngày âm lịch hiện tại
- ✅ Xem lời nhắc cho ngày âm lịch hôm nay
- ✅ Tạo lời nhắc mới theo ngày âm lịch
- ✅ Giao diện responsive, mobile-first
- ✅ UI hiện đại với shadcn/ui components
- ✅ Kết nối với Supabase backend

## Công nghệ sử dụng

- **Next.js 15** - React framework với app router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Supabase** - Database và API
- **lunar-calendar-ts-vi** - Thư viện lịch âm Việt Nam

## Cài đặt

### 1. Clone và install dependencies

```bash
cd nhaclicham-frontend
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

Cập nhật các biến môi trường:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Chạy development server

```bash
npm run dev
```

Truy cập http://localhost:3000 để xem ứng dụng.

## Cấu trúc project

```
src/
├── app/                    # Next.js app router pages
│   ├── create/            # Trang tạo lời nhắc
│   ├── profile/           # Trang hồ sơ (placeholder)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Trang chủ
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── Navigation.tsx     # Component navigation
│   └── ReminderCard.tsx   # Component hiển thị reminder
├── lib/
│   ├── supabase.ts        # Supabase client config
│   ├── lunarService.ts    # Lunar calendar operations
│   ├── reminderService.ts # Reminder API operations
│   └── utils.ts           # Utility functions
└── types/
    └── reminder.ts        # TypeScript interfaces
```

## Sử dụng

### Trang chủ (/)

- Hiển thị ngày âm lịch hiện tại
- Danh sách lời nhắc cho hôm nay
- Liên kết tạo lời nhắc mới

### Trang tạo lời nhắc (/create)

- Form tạo lời nhắc với các trường:
  - Nội dung lời nhắc
  - Ngày âm lịch (1-30)
  - Tháng âm lịch (1-12)
  - Checkbox lặp lại hàng năm
- Preview lời nhắc trước khi tạo

### Trang hồ sơ (/profile)

- Placeholder cho tính năng authentication
- Sẽ được phát triển trong tương lai

## API Integration

Frontend kết nối với Supabase thông qua:

1. **Direct Supabase client** - Cho CRUD operations
2. **Lunar calendar library** - Tính toán ngày âm lịch (client-side)

### Services

- `LunarService` - Xử lý chuyển đổi dương-âm lịch
- `ReminderService` - CRUD operations cho reminders

## Responsive Design

- **Mobile-first approach**
- **Breakpoints**: sm, md, lg
- **Navigation**: Responsive menu cho mobile
- **Cards**: Grid layout tự động điều chỉnh

## Development

### Lệnh có sẵn

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

### Adding shadcn/ui components

```bash
npx shadcn@latest add [component-name]
```

## Troubleshooting

### Lỗi Supabase connection

- Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Đảm bảo bảng `reminders` đã được tạo trong Supabase

### Lỗi lunar calendar

- Thư viện `lunar-calendar-ts-vi` chạy client-side
- Đảm bảo component sử dụng `'use client'` directive

### TypeScript errors

- Restart TypeScript server trong VS Code: `Cmd/Ctrl + Shift + P` > "TypeScript: Restart TS Server"

## Deploy

Project có thể deploy lên:

- **Vercel** (recommended)
- **Netlify**
- **Railway**

### Vercel deployment

```bash
npm install -g vercel
vercel
```

Nhớ cập nhật environment variables trên platform deploy!

## Triển khai Cloudflare Pages Functions (Next.js App Router)

1. **Cập nhật next.config.ts**
   - Xoá hoặc comment dòng `output: "export"`.
   - Đảm bảo không dùng static export, chỉ cần `next build`.

2. **Tạo file `wrangler.toml` ở thư mục gốc:**

   ```toml
   name = "nhaclicham-frontend"
   compatibility_date = "2024-06-26"
   pages_build_output_dir = ".vercel/output"

   [env.production]
   # Thêm biến môi trường nếu cần
   # [vars]
   # SUPABASE_URL = "..."
   # SUPABASE_ANON_KEY = "..."
   ```

3. **Cấu hình Cloudflare Pages:**
   - Build command: `npx next build`
   - Output directory: `.vercel/output/static`
   - Enable Pages Functions (tự động nhận diện với Next.js >=13)

4. **Push code lên GitHub, Cloudflare Pages sẽ tự động build & deploy.**

5. **Nếu cần thêm biến môi trường, cấu hình trong dashboard Cloudflare Pages.**

> Nếu gặp lỗi, kiểm tra log build trên Cloudflare Pages hoặc hỏi lại AI để được hỗ trợ!

## Roadmap

- [ ] Authentication với Supabase Auth
- [ ] User-specific reminders
- [ ] Push notifications
- [ ] Dark mode
- [ ] PWA support
- [ ] Export/Import reminders

## Contributing

1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request
