# ViralBatch — Project Progress

_Last updated: 2026-11-17_

## Product
ViralBatch is a cloud-first SaaS for turning scripts, transcripts, and eventually long videos/audio into batches of short-form hooks, captions, subtitles, and clips for TikTok, Instagram Reels, and YouTube Shorts. English, Kinyarwanda, mixed-language, and French text workflows are planned.

Repository: https://github.com/imenakingstone/ViralBatch
Default branch: `main`

## Implemented in the repository

### Content studio and AI
- Next.js App Router + TypeScript foundation (Next.js 16.4.6, React 19.3.1).
- Responsive script-to-content studio with language, tone, and hook-count controls.
- Server-side OpenAI integration, validated inputs, request timeout, and demo fallback.
- Editable hooks and TikTok, Instagram Reels, and YouTube Shorts captions.
- Copy actions, CSV export, and saved batch action.
- Live AI requests require a verified Supabase user when an OpenAI key is configured.
- Atomic database-backed limit of 30 live AI generations per signed-in user per UTC day.
- Authenticated usage API and studio usage meter.

### Authentication and saved work
- Supabase browser/server SSR clients and Next.js 16 proxy session refresh.
- Email/password sign-in, sign-up, and confirmation callback.
- Owner-scoped batch history, detail view, and deletion.
- SQL RLS policies for profiles and saved batches.

### Media pipeline foundation (new)
- Private Supabase Storage bucket design for source audio/video, limited to 512 MB per object and an allowlist of media MIME types.
- Owner-scoped `media_jobs` table with lifecycle statuses, duration/transcript/clip-suggestion fields.
- Storage object RLS policies isolate each user's folder.
- Authenticated signed-upload URL endpoint validates file type/size and creates an awaiting-upload job.
- Authenticated media jobs endpoint lists a user's jobs and confirms an uploaded object exists before marking it uploaded.
- Browser upload UI uses the signed upload token, displays progress/status, and confirms the upload. This is source-media storage only; transcription, analysis, clip rendering, and background worker are not implemented.

### Engineering
- GitHub Actions workflow for install, typecheck, lint, and production build.
- Weekly Dependabot updates.
- Environment example, README, master blueprint, and this progress tracker.

## Database migrations — apply only to a confirmed ViralBatch project
1. `202611170001_initial_schema.sql`: profiles, batches, signup trigger, and RLS.
2. `202611170002_generation_usage.sql`: private generation ledger, atomic consume-credit RPC, and usage-summary RPC.
3. `202611170003_media_pipeline.sql`: media jobs, private Storage bucket, and per-user Storage policies.

**None of these migrations has been applied.** The connected Supabase account currently lists:
- `MusicPlayer` — inactive
- `glolex` — inactive
- `FREE-CROSSPOSTER` — active

There is no project clearly named ViralBatch. The FREE-CROSSPOSTER project must not be modified for ViralBatch without explicit confirmation that this is intentional. No new Supabase project was created.

## CI and verification
- GitHub Actions successfully installed dependencies and passed TypeScript typecheck on the inspected run.
- An earlier CI run failed lint due to three JSX apostrophe/link issues; those were fixed in later commits.
- The newest run must be checked for final lint/build status before declaring CI green.
- No direct Codespaces terminal/browser session was available to the assistant.
- No live Supabase migrations, auth, Storage uploads, or OpenAI calls have been tested.
- GitHub Actions reported 14 high-severity npm audit findings during install. These need dependency-by-dependency review; do not run `npm audit fix --force` blindly.
- No secrets were committed and no paid infrastructure or deployment was created.

## Still not implemented
- Upload progress/cancellation/retry and resumable uploads for large files.
- File metadata/duration probing and upload-completion hardening.
- Kinyarwanda/English speech-to-text benchmarking and transcription.
- Timestamped transcript editor.
- AI clip candidate selection and manual trim controls.
- FFmpeg worker, queue, 9:16 rendering, subtitle generation, and export.
- Billing, plans/credits, team workspaces, social publishing.
- Production deployment, monitoring, backups, and operational runbooks.

## Human approval / credentials still needed
- Identify or create the dedicated ViralBatch Supabase project. The existing projects do not clearly match ViralBatch; selecting FREE-CROSSPOSTER would risk changing another application.
- Add the dedicated project's URL and publishable key to Codespaces/deployment secrets.
- Add the OpenAI API key securely after auth, RLS, and quota setup has been tested.
- Review and apply the three migrations to the confirmed project.
- Have a fluent Kinyarwanda speaker review generated/transcribed content before launch.
- Approve production deployment, public launch, and any spending.

## Next AI-buildable work
1. Build the browser upload UI using the signed-upload and job APIs.
2. Add file duration/metadata validation and secure upload cleanup.
3. Add a processing adapter interface and background job contract.
4. Add tests for auth gates, quotas, ownership, media validation, and job lifecycle.
5. Implement a configurable transcription provider after the consented Kinyarwanda benchmark set is prepared.

## Development rules
- Keep all work cloud-first; do not require the user's local PC.
- Inspect files before changing them; make small incremental commits.
- Never mark a feature tested unless an actual test ran.
- Never commit secrets.
- Keep this file updated after meaningful work sessions.

## Work completed in the 2026-11-17 evening session
- Added quota enforcement, usage summary endpoint/UI, and authenticated saved-batch detail/deletion workflows.
- Fixed lint findings discovered in GitHub Actions: escaped JSX apostrophes and switched internal navigation to Next.js Link/router APIs.
- Added the third migration for private media storage and owner-scoped media jobs.
- Added authenticated signed-upload URL creation, upload job listing, and upload confirmation APIs.
- Added a browser upload panel wired to Supabase Storage signed uploads, with file type/size selection and success/error states.
- Hardened media job creation/state transitions with restricted column grants and an owner-checked database RPC.
- Researched Google Cloud Speech-to-Text V2 and Pindo as Kinyarwanda transcription candidates; added an evaluation plan and WER/CER utility.
- Added an ASR evaluation guide that keeps private audio and transcripts out of the public repository.
- Updated README and master blueprint with current capabilities and remaining human approvals.


## Additional AI-buildable work completed — 2026-11-17

### Media processing and Kinyarwanda transcription
- Added fourth migration `202611170004_media_worker_queue.sql` with service-role-only RPCs to claim, complete, and fail media jobs. Uses `FOR UPDATE SKIP LOCKED` for safe concurrent workers, three attempts, 20-minute stale lease recovery, and final failure handling.
- Added isolated Node 22 container worker at `workers/media-processor/`. It downloads owner-private source media, calls Pindo's authenticated Kinyarwanda STT endpoint, and stores plain transcript text on the job.
- Added worker deployment documentation and environment requirements. Service-role and Pindo credentials are runtime secrets only; no credentials have been created or committed.
- Added media job list/transcript display and a refresh action to the studio. The job API returns only the current user's media jobs and transcript fields.
- Added a CI syntax check for the worker JavaScript.
- Updated README and migration instructions to include all four migrations and the separately deployed worker.

### Important limitations
- The worker has not been deployed or run because the dedicated ViralBatch Supabase project and Pindo token are not configured.
- The worker currently handles Kinyarwanda plain-text transcription only; no word timestamps, speaker diarization, automatic clips, FFmpeg render, or subtitle generation yet.
- The worker default limit is 100 MiB although private source storage allows 512 MiB. Large-file streaming/chunking and provider limits need later work.
- Provider privacy/retention and consent flow need review before sending customer media to Pindo.
- Existing connected Supabase projects are MusicPlayer, glolex, and FREE-CROSSPOSTER; none is confirmed as ViralBatch. Do not apply these migrations to another app's database.

- Improved the worker to use FFmpeg/ffprobe for duration validation and normalize uploaded audio/video to mono 16 kHz MP3 before Pindo transcription. Default limits: 100 MiB source file and 2 hours duration.

## Role-based access and automatic API capabilities — 2026-11-17
- Added migration 5: profile roles (admin, creator, agency), owner-scoped integration registry, protected admin role-assignment RPC, and narrowed profile update grants so members cannot promote themselves.
- Added a server-side integration catalog for OpenAI, Pindo, TikTok, Instagram, and YouTube. It detects required environment variables without exposing secret values.
- Added authenticated GET /api/integrations returning role, configured providers, and enabled capability identifiers.
- Added admin-protected PATCH /api/admin/members/role; the database RPC independently verifies the caller is already an admin.
- Added /integrations status page and workspace navigation link.
- Human bootstrap still required: after the dedicated ViralBatch database is confirmed and migration 5 is reviewed/applied, the project owner must assign the first admin with the documented one-time SQL. Provider secrets must be configured in server-side secret settings.
- Important limitation: social platform entries currently detect app credentials only. OAuth login, creator-account consent, token refresh/storage, publishing scopes, and app review are not yet implemented. No platform publishing is falsely marked as fully connected.
- No database migrations or live API connections were executed; the dedicated ViralBatch Supabase project and provider secrets remain unconfigured.
