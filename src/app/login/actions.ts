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
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) redirect("/login?error=credentials");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    redirect("/login?error=setup");
  }
  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = safeEmail(formData.get("email"));
  const password = formData.get("password");
  if (!email.includes("@") || typeof password !== "string" || password.length < 8) redirect("/login?error=invalid");
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) redirect("/login?error=signup");
    if (!data.session) redirect("/login?message=check-email");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    redirect("/login?error=setup");
  }
  redirect("/");
}
