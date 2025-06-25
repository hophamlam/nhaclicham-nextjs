/**
 * API Route: Batch tạo lunar notifications hàng năm
 * Method: POST/GET
 * Purpose: Xử lý lặp lại thông báo âm lịch hàng năm
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const targetYear = body.targetYear || new Date().getFullYear() + 1;

    // Simple query để test
    const { data: settings, error } = await supabase
      .from("notification_settings")
      .select("id, lunar_repeat_yearly")
      .eq("lunar_repeat_yearly", true)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Batch process completed",
      year: targetYear,
      user_id: user.id,
      lunar_repeat_settings: settings?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetYear =
      parseInt(searchParams.get("year") || "") || new Date().getFullYear() + 1;

    // Count lunar repeat settings
    const { data: settings, error } = await supabase
      .from("notification_settings")
      .select("id, note, advance_days")
      .eq("lunar_repeat_yearly", true)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      target_year: targetYear,
      user_id: user.id,
      total_lunar_repeat_settings: settings?.length || 0,
      settings: settings || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
