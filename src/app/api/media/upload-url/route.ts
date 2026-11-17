import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 512 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "video/mp4", "video/quicktime", "video/webm",
  "audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav",
  "audio/aac", "audio/webm"
]);

function safeFilename(value: string) {
  const leaf = value.split(/[\\/]/).pop() || "upload";
  return leaf.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "upload";
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 }); }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid upload details." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const filename = typeof input.filename === "string" ? safeFilename(input.filename) : "";
  const contentType = typeof input.contentType === "string" ? input.contentType.toLowerCase().split(";")[0].trim() : "";
  const sizeBytes = typeof input.sizeBytes === "number" ? input.sizeBytes : 0;

  if (!filename || filename.length > 100 || !ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Choose an MP4, MOV, WebM, MP3, WAV, or AAC media file." }, { status: 415 });
  }
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > MAX_BYTES) {
    return NextResponse.json({ error: "Media files must be between 1 byte and 512 MB." }, { status: 413 });
  }

  let supabase;
  try { supabase = await createClient(); }
  catch { return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }); }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in before uploading media." }, { status: 401 });
  }

  const jobId = crypto.randomUUID();
  const storagePath = `${user.id}/${jobId}-${filename}`;
  const { data: signed, error: signError } = await supabase.storage
    .from("source-media")
    .createSignedUploadUrl(storagePath);

  if (signError || !signed) {
    console.error("Media upload URL creation failed:", signError?.message);
    return NextResponse.json({ error: "Media storage is not ready. Apply the latest ViralBatch storage migration." }, { status: 503 });
  }

  const { error: insertError } = await supabase.from("media_jobs").insert({
    id: jobId,
    user_id: user.id,
    storage_path: storagePath,
    original_filename: filename,
    mime_type: contentType,
    size_bytes: sizeBytes,
  });

  if (insertError) {
    await supabase.storage.from("source-media").remove([storagePath]);
    console.error("Media job creation failed:", insertError.message);
    return NextResponse.json({ error: "Could not create the media job. Check the latest database migration." }, { status: 503 });
  }

  return NextResponse.json({
    jobId,
    bucket: "source-media",
    path: signed.path,
    token: signed.token,
    maxBytes: MAX_BYTES,
    status: "awaiting_upload"
  }, { status: 201 });
}
