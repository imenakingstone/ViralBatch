import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getIntegrationStatus } from "@/lib/integrations/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let supabase;
  try { supabase = await createClient(); }
  catch { return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }); }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in to view integrations." }, { status: 401 });

  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (error || !profile) return NextResponse.json({ error: "Workspace profile is unavailable." }, { status: 503 });

  const all = getIntegrationStatus();
  const integrations = profile.role === "admin"
    ? all
    : all.map(({ id, name, description, capabilities, setup, connected }) => ({ id, name, description, capabilities, setup, connected }));

  return NextResponse.json({
    role: profile.role,
    integrations,
    enabledCapabilities: integrations.filter(item => item.connected).flatMap(item => item.capabilities)
  }, { headers: { "Cache-Control": "no-store" } });
}
