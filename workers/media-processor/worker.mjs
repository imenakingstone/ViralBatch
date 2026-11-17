import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const execFileAsync = promisify(execFile);

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const pindoToken = process.env.PINDO_API_TOKEN;
const provider = process.env.TRANSCRIPTION_PROVIDER || "pindo";
const pollMs = Number(process.env.WORKER_POLL_MS || 5000);
const maxBytes = Number(process.env.MAX_TRANSCRIPTION_BYTES || 100 * 1024 * 1024);
const maxDurationSeconds = Number(process.env.MAX_MEDIA_DURATION_SECONDS || 7200);

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

async function prepareAudio(sourceBytes, filename) {
  const directory = await mkdtemp(join(tmpdir(), "viralbatch-"));
  const inputPath = join(directory, filename.replace(/[^a-zA-Z0-9._-]/g, "_"));
  const outputPath = join(directory, "normalized-audio.mp3");
  try {
    await writeFile(inputPath, sourceBytes);
    const probe = await execFileAsync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", inputPath
    ], { timeout: 30000, maxBuffer: 1024 * 1024 });
    const duration = Number.parseFloat(probe.stdout.trim());
    if (!Number.isFinite(duration) || duration <= 0) throw new Error("Could not determine media duration.");
    if (duration > maxDurationSeconds) throw new Error("Media exceeds the " + (maxDurationSeconds / 3600) + "-hour processing limit.");
    await execFileAsync("ffmpeg", [
      "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
      "-i", inputPath, "-vn", "-ac", "1", "-ar", "16000",
      "-b:a", "64k", "-f", "mp3", outputPath
    ], { timeout: 10 * 60 * 1000, maxBuffer: 4 * 1024 * 1024 });
    return { directory, outputPath, duration };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}

async function transcribeWithPindo(buffer, filename) {
  const form = new FormData();
  form.append("audio", new Blob([buffer], { type: "audio/mpeg" }), filename);
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

    const prepared = await prepareAudio(bytes, job.original_filename);
    let transcriptText;
    try {
      const audioBytes = await readFile(prepared.outputPath);
      transcriptText = await transcribeWithPindo(audioBytes, "viralbatch-audio.mp3");
    } finally {
      await rm(prepared.directory, { recursive: true, force: true });
    }
    const transcript = {
      text: transcriptText,
      language: "rw",
      provider: "pindo",
      duration_seconds: prepared.duration,
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
