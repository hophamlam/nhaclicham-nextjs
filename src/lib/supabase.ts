import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For direct API calls to backend functions
export const API_BASE_URL =
  "https://aekfivlrnrdzolsiipdf.supabase.co/functions/v1/api";
export const API_AUTH_HEADER =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFla2ZpdmxybnJkem9sc2lpcGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNDU4NjksImV4cCI6MjA2NTcyMTg2OX0.yIkqGYpn_xqDYlLOAmmsW2zkHLR3mTOTG7lpYHktvyU";
