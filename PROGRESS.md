# ViralBatch — Project Progress

_Last updated: 2026-11-18_

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

## Live database — ViralBatch Supabase (2026-11-18)
- Confirmed dedicated project: `ViralBatch`, ref `hwzbpdkxcavljuakzrtp`, region `eu-west-1`, status `ACTIVE_HEALTHY`.
- Project URL: `https://hwzbpdkxcavljuakzrtp.supabase.co`.
- Applied all six repository migrations in order:
  1. `202611170001_initial_schema`
  2. `202611170002_generation_usage`
  3. `202611170003_media_pipeline`
  4. `202611170004_media_worker_queue`
  5. `202611170005_roles_integrations`
  6. `202611170006_creator_context`
- Verified all six entries in Supabase migration history; verified the five public tables and RLS enabled on all five.
- Verified the private `source-media` bucket exists with public access disabled.
- The database is currently empty: zero Auth users, zero profiles, and zero saved batches. No user data was overwritten.
- Security review: `generation_usage` intentionally has no direct client policy; clients use authenticated, user-scoped quota RPCs instead. Security advisor also flags the guarded SECURITY DEFINER RPCs and Supabase's platform-created `rls_auto_enable()` event-trigger function; inspect/documented guards were confirmed. The platform event-trigger function was not modified. Unused-index notices are expected on a new empty database.
- Supabase's 2026 Data API change means public-schema tables may need explicit exposure in API settings. SQL grants and RLS are configured; verify Data API exposure if app requests return schema-cache/not-found errors.

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
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the GitHub Codespaces environment for the ViralBatch repository. Use the publishable key only; never expose the service-role/secret key in browser variables.
- Create the first account through ViralBatch sign-up, then assign that account the initial `admin` role using the one-time owner SQL documented in README.
- Add `OPENAI_API_KEY` securely before enabling billable live generation.
- Add worker-only `SUPABASE_SERVICE_ROLE_KEY` and `PINDO_API_TOKEN` in the worker host's secret manager; deploy the media worker separately.
- Review provider privacy/retention and obtain user consent before transmitting customer media to Pindo.
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


## Visual design refresh — 2026-11-17
- Replaced the previous purple/lavender-heavy visual treatment with a warm creator-workspace system: off-white canvas, white surfaces, deep forest-charcoal text, and emerald/mint actions.
- Added shared semantic tokens and matching dark palette; dark mode follows the operating-system preference.
- Refreshed studio, sidebar, topbar, editor controls, results, history, batch detail, media upload, auth and integrations surfaces.
- Added responsive integration-card layout, visible focus styling, restrained borders/shadows, and reduced-motion support.
- Preserved the existing React workflows and route structure; no product functionality was intentionally removed.
- Documented palette, typography, spacing, navigation, page structure, responsive rules and accessibility expectations in `docs/design-system.md`.
- Not yet visually browser-tested. GitHub Actions must confirm lint/typecheck/build after these changes; do not call the redesign fully verified until then.


## Product research and creator-brief upgrade — 2026-11-17

### Research findings
- The 2026 Creator Landscape report identifies editing, idea generation, script/caption writing, analytics, and automation/scheduling as meaningful creator AI workflows; it explicitly frames AI as a productivity aid that should preserve creator authenticity.
- CreatorIQ's 2025–2026 State of Creator Marketing reports widespread AI use by brands/agencies, with short-form content generation, research/analysis, editing, performance reporting, and repurposing among common applications.
- TikTok's official Content Posting API requires creator information and explicit consent in the direct-post flow; unaudited clients are restricted to private-view posts. This is why ViralBatch must not label platform credentials alone as a live publishing connection.
- Research sources: https://theinfluencermarketingfactory.com/wp-content/uploads/2026/02/Creator-Economy-Report-2026.pdf ; https://hs-21030792.f.hubspotemail.net/hubfs/21030792/2025-26%20State%20of%20Creator%20Marketing/CreatorIQ-StateofCreatorMarketing2025-2026.pdf ; https://developers.tiktok.com/docs/en/content-posting-api-get-started ; https://developers.tiktok.com/docs/en/content-sharing-guidelines

### Implemented from research
- Added a content-goal selector: grow audience, educate audience, build community, drive sales, or increase engagement.
- Added optional target-audience and brand-voice inputs with strict length limits.
- Generation API now passes these settings to the AI prompt so calls to action, framing, and tone can be tailored without inventing facts.
- Saved batches now persist this brief, and batch detail displays it.
- Added migration 6: `supabase/migrations/202611170006_creator_context.sql`.
- Updated responsive styling and README/API documentation.

### Verification and dependencies
- Code is committed to GitHub main. The new migration is not applied to Supabase; save operations using the new fields require migration 6.
- No browser visual QA, typecheck, lint, production build, or live AI request has been run for this change yet.
- Continue next with content calendar/planning, hook review/scoring with transparent explanations, and analytics once real platform account connections and permissioned metrics exist. Do not fabricate analytics or schedule/publish posts without authorized platform OAuth.


## Live Supabase initialization — 2026-11-18
- The owner supplied the dedicated ViralBatch project URL; the connected Supabase account independently confirmed the matching project name/ref and healthy status.
- AI applied the six migrations to this exact project and verified migration history, public tables, RLS flags, and the private media bucket.
- No user account exists yet. First signup and first-admin bootstrap remain owner steps.
- The Codespaces app environment is not automatically populated by connecting Supabase. Set the project URL and publishable key in Codespaces secrets/environment variables, then restart the dev server.
- No service-role key, OpenAI key, or Pindo token was requested in chat, stored in Git, or configured.
- Live auth, Data API connectivity, signup trigger, saved batch writes, generation quota RPC, upload flow, and worker processing are not yet end-to-end tested.
