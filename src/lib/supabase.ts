import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For direct API calls to backend functions
export const API_BASE_URL =
  "https://aekfivlrnrdzolsiipdf.supabase.co/functions/v1/api";
export const API_AUTH_HEADER = `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_TOKEN!}`;
