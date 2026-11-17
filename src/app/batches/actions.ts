"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteBatch(formData: FormData) {
  const id = formData.get("batchId");
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) {
    redirect("/batches?error=invalid");
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login?error=setup");
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const { error } = await supabase
    .from("batches")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) redirect("/batches?error=delete");
  revalidatePath("/batches");
}
