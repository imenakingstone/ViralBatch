import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const pindoToken = process.env.PINDO_API_TOKEN;
const provider = process.env.TRANSCRIPTION_PROVIDER || "pindo";
const pollMs = Number(process.env.WORKER_POLL_MS || 5000);
const maxBytes = Number(process.env.MAX_TRANSCRIPTION_BYTES || 100 * 1024 * 1024);

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}
if (provider === "pindo" && !pindoToken) {
  throw new Error("PINDO_API_TOKEN is required when TRANSCRIPTION_PROVIDER=pindo.");
}
if (provider !== "pindo") {
  throw new Error("Unsupported TRANSCRIPTION_PROVIDER. Configure pindo.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});
let stopping = false;

async function transcribeWithPindo(buffer, filename, mimeType) {
  const form = new FormData();
  form.append("audio", new Blob([buffer], { type: mimeType }), filename);
  const response = await fetch("https://api.pindo.io/ai/stt/rw", {
    method: "POST",
    headers: { Authorization: `Bearer ${pindoToken}` },
    body: form,
    signal: AbortSignal.timeout(5 * 60 * 1000)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.status !== "success" || typeof payload?.data?.text !== "string") {
    throw new Error(payload?.error || `Pindo transcription failed (HTTP ${response.status}).`);
  }
  return payload.data.text.trim();
}

async function processOne() {
  const { data, error } = await supabase.rpc("claim_media_job");
  if (error) throw new Error(`Queue claim failed: ${error.message}`);
  const job = Array.isArray(data) ? data[0] : null;
  if (!job) return false;

  console.info(`Processing media job ${job.id} (attempt ${job.attempts})`);
  try {
    if (Number(job.size_bytes) > maxBytes) {
      throw new Error(`File exceeds worker transcription limit of ${maxBytes} bytes.`);
    }
    const { data: file, error: downloadError } = await supabase.storage
      .from("source-media").download(job.storage_path);
    if (downloadError || !file) throw new Error(downloadError?.message || "Source media download failed.");

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length === 0 || bytes.length > maxBytes) {
      throw new Error("Downloaded media is empty or exceeds the worker size limit.");
    }

    const transcriptText = await transcribeWithPindo(bytes, job.original_filename, job.mime_type);
    const transcript = {
      text: transcriptText,
      language: "rw",
      provider: "pindo",
      created_at: new Date().toISOString(),
      timestamped: false
    };
    const { data: completed, error: completeError } = await supabase.rpc("complete_media_job", {
      p_job_id: job.id,
      p_transcript: transcript
    });
    if (completeError || completed !== true) {
      throw new Error(completeError?.message || "Job completion was rejected.");
    }
    console.info(`Completed media job ${job.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown processing error";
    const { data: status, error: failError } = await supabase.rpc("fail_media_job", {
      p_job_id: job.id,
      p_error: message
    });
    if (failError) console.error(`Could not record failure for ${job.id}:`, failError.message);
    else console.error(`Media job ${job.id} moved to ${status}:`, message);
  }
  return true;
}

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

process.on("SIGINT", () => { stopping = true; });
process.on("SIGTERM", () => { stopping = true; });

console.info("ViralBatch media worker started.");
while (!stopping) {
  try {
    const worked = await processOne();
    if (!worked) await sleep(pollMs);
  } catch (error) {
    console.error("Worker loop error:", error);
    await sleep(pollMs);
  }
}
console.info("ViralBatch media worker stopped.");
