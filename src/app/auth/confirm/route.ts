import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const otpTypes = ["email", "recovery", "invite", "magiclink", "signup", "email_change", "email_change_current", "email_change_new"] as const;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const supabase = await createClient();

  // Support the PKCE code flow used by the default Supabase email templates.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/", origin));
  }

  // Also support custom email templates that send a token_hash.
  if (tokenHash && type && otpTypes.includes(type as (typeof otpTypes)[number])) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as (typeof otpTypes)[number]
    });
    if (!error) return NextResponse.redirect(new URL("/", origin));
  }

  return NextResponse.redirect(new URL("/login?error=confirmation", origin));
}
