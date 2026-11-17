import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to view your usage." }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("get_generation_usage");
  if (error) {
    console.error("Usage summary failed:", error.message);
    return NextResponse.json({ error: "Usage information is not available until the latest database migration is applied." }, { status: 503 });
  }

  const usage = Array.isArray(data) ? data[0] : data;
  if (!usage) return NextResponse.json({ error: "Usage information is unavailable." }, { status: 503 });
  return NextResponse.json({
    used: usage.used,
    remaining: usage.remaining,
    dailyLimit: usage.daily_limit,
    resetsAt: "00:00 UTC"
  });
}
