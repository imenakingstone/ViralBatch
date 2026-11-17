"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 254) : "";
}

export async function signIn(formData: FormData) {
  const email = safeEmail(formData.get("email"));
  const password = formData.get("password");
  if (!email.includes("@") || typeof password !== "string" || password.length < 8) redirect("/login?error=invalid");

  let supabase;
  try { supabase = await createClient(); }
  catch { redirect("/login?error=setup"); }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=credentials");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = safeEmail(formData.get("email"));
  const password = formData.get("password");
  if (!email.includes("@") || typeof password !== "string" || password.length < 8) redirect("/login?error=invalid");

  let supabase;
  try { supabase = await createClient(); }
  catch { redirect("/login?error=setup"); }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) redirect("/login?error=signup");
  if (!data.session) redirect("/login?message=check-email");
  redirect("/");
}
