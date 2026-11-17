import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? { error: NextResponse.json({ error: "Sign in to access your media jobs." }, { status: 401 }) } : { supabase, user };
}

export async function GET() {
  let auth;
  try { auth = await authenticatedClient(); }
  catch { return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }); }
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("media_jobs")
    .select("id,original_filename,mime_type,size_bytes,status,duration_seconds,transcript,last_error,created_at,updated_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Media job list failed:", error.message);
    return NextResponse.json({ error: "Media jobs are unavailable until the media migration is applied." }, { status: 503 });
  }
  return NextResponse.json({ jobs: data || [] });
}

export async function PATCH(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 }); }
  const jobId = body && typeof body === "object" ? (body as Record<string, unknown>).jobId : null;
  if (typeof jobId !== "string" || !/^[0-9a-f-]{36}$/i.test(jobId)) {
    return NextResponse.json({ error: "A valid media job ID is required." }, { status: 400 });
  }

  let auth;
  try { auth = await authenticatedClient(); }
  catch { return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }); }
  if ("error" in auth) return auth.error;

  const { data: job, error: lookupError } = await auth.supabase
    .from("media_jobs")
    .select("id,storage_path,status")
    .eq("id", jobId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (lookupError || !job) return NextResponse.json({ error: "Media job not found." }, { status: 404 });
  if (job.status !== "awaiting_upload") {
    return NextResponse.json({ error: "This upload has already been confirmed or processed." }, { status: 409 });
  }

  const folder = auth.user.id;
  const filename = job.storage_path.split("/").pop() || "";
  const { data: objects, error: storageError } = await auth.supabase.storage
    .from("source-media")
    .list(folder, { search: filename, limit: 10 });

  if (storageError || !objects?.some(object => object.name === filename)) {
    return NextResponse.json({ error: "The uploaded file could not be found. Finish uploading before confirming." }, { status: 409 });
  }

  const { data: confirmed, error: confirmError } = await auth.supabase
    .rpc("confirm_media_upload", { p_job_id: jobId });

  const updated = Array.isArray(confirmed) ? confirmed[0] : confirmed;
  if (confirmError || !updated) {
    return NextResponse.json({ error: "Could not confirm this upload." }, { status: 409 });
  }
  return NextResponse.json({ job: updated });
}
