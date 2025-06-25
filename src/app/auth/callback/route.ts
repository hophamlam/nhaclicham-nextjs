import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Auth callback route - xử lý redirect sau khi đăng nhập thành công
 * Cải thiện tốc độ bằng cách redirect trực tiếp đến dashboard
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    try {
      // Đăng nhập và lấy session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error);
        // Redirect về homepage nếu có lỗi
        return NextResponse.redirect(new URL("/", requestUrl.origin));
      }

      // Nếu thành công và có user, redirect trực tiếp đến dashboard
      if (data.user) {
        const dashboardUrl = new URL("/app/dash", requestUrl.origin);
        const response = NextResponse.redirect(dashboardUrl);

        // Thêm cache headers để tăng hiệu suất
        response.headers.set(
          "Cache-Control",
          "no-cache, no-store, must-revalidate"
        );
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        return response;
      }
    } catch (error) {
      console.error("Unexpected auth error:", error);
    }
  }

  // Fallback: redirect về homepage
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
