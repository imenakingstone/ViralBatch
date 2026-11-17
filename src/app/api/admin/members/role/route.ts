import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Send valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const input = body as Record<string, unknown>;
  const userId = typeof input.userId === "string" ? input.userId : "";
  const role = input.role;
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !["admin", "creator", "agency"].includes(String(role))) {
    return NextResponse.json({ error: "A valid user ID and role are required." }, { status: 400 });
  }

  let supabase;
  try { supabase = await createClient(); }
  catch { return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }); }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data, error } = await supabase.rpc("set_member_role", { p_user_id: userId, p_role: role });
  if (error) {
    const forbidden = /Admin role required/i.test(error.message);
    return NextResponse.json({ error: forbidden ? "Only workspace admins can change roles." : "Could not update the member role." }, { status: forbidden ? 403 : 400 });
  }
  return NextResponse.json({ updated: Boolean(data), userId, role });
}
