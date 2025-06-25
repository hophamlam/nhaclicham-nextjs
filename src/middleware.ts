import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Allow access to public pages and auth pages even if not logged in
  if (
    ["/", "/signup", "/forgot-password", "/auth/callback"].includes(pathname)
  ) {
    return res;
  }

  // Redirect to homepage if not logged in and trying to access /app routes
  if (!session && pathname.startsWith("/app")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (images)
     */
    "/((?!_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
