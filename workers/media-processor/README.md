# ViralBatch media worker

Cloud worker for processing authenticated uploads. It currently transcribes Kinyarwanda audio/video using Pindo Voice AI and stores a plain transcript on the owning media job.

## Required environment

- `SUPABASE_URL`: dedicated ViralBatch Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service role key. Never expose it to browser code or commit it.
- `PINDO_API_TOKEN`: authenticated Pindo Voice AI token.
- `TRANSCRIPTION_PROVIDER=pindo`.
- Optional `WORKER_POLL_MS=5000`.
- Optional `MAX_TRANSCRIPTION_BYTES=104857600` (100 MiB default).

## Run

Build/deploy this directory as a long-running Node 22 container. Configure the environment variables in the worker host's secret manager. The worker polls `claim_media_job()`, downloads private source media, sends it to Pindo's authenticated Kinyarwanda STT endpoint, then stores the transcript through a service-role-only RPC.

## Current limits

- One job at a time per worker process; scale by running multiple replicas (the database queue uses row locks with SKIP LOCKED).
- Kinyarwanda (`rw`) is the configured transcription language.
- Files above 100 MiB are rejected by default by the worker even though source storage permits up to 512 MiB. Set a larger limit only after sizing worker memory and confirming provider limits.
- Transcript is plain text, not word-timestamped. Clip detection, FFmpeg rendering, subtitles, and transcript editing are separate future stages.
- A failed job retries up to three attempts; stale processing leases are reclaimable after 20 minutes.
- Pindo receives the user's media. Before launch, obtain user consent and review Pindo's retention/privacy terms.
