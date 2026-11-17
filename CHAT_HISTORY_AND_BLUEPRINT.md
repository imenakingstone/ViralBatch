# ViralBatch — Conversation History & Master Project Blueprint

_Last consolidated: 2026-11-17_

This document preserves the decisions and requirements established while planning ViralBatch. It is a durable project handoff for ChatGPT or another coding assistant connected to this GitHub repository.

## 1. Conversation history and decisions

### Discussion 1 — What the product needs
The initial idea was a **Bulk Short-Form Video & Caption Generator** for creators, social media managers, and marketing agencies. The product should accept a long video or script, identify compelling moments, create hooks, and produce captions/subtitles for TikTok, Instagram Reels, and YouTube Shorts.

The initial technical components discussed:
- Speech-to-text with timestamps.
- An LLM to identify engaging moments and generate hooks/captions.
- Smart vertical reframing using face/person detection where appropriate.
- FFmpeg for cutting, cropping, and subtitle rendering.
- Optional advanced rendering with Remotion or a rendering service.
- Background jobs for long-running media processing.
- A web dashboard, database, authentication, cloud storage, exports, and later billing.

### Discussion 2 — Kinyarwanda support and APIs
Kinyarwanda speech recognition was identified as an important differentiator, alongside English. Options discussed included:
- Open-source/self-hosted Kinyarwanda speech models from Hugging Face or other research groups.
- Cloud speech APIs, subject to current language support, timestamp support, quotas, and pricing verification.
- An LLM provider for hooks and captions.
- FFmpeg for video operations.
- Supabase for auth/database/storage.
- Cloud object storage such as Cloudflare R2 or AWS S3.
- Payment providers to evaluate later for Rwanda and international customers.

**Important:** Treat model names, language-support claims, free-tier quotas, and prices from early brainstorming as candidates, not verified production guarantees. Before integration, check current official documentation, licenses, availability in Rwanda, data-processing terms, and actual performance on representative Kinyarwanda recordings.

### Discussion 3 — Human involvement and cloud-only development
The user wants the project built entirely online using AI and GitHub, without moving the project onto a local computer. AI can assist with code generation, refactoring, tests, and documentation, but a human still needs to:
- Create/authorize external accounts and approve OAuth access.
- Supply private credentials securely.
- Test real Kinyarwanda transcription and judge linguistic quality.
- Verify user experience, security, and publishing behavior.
- Complete payment-provider identity/business verification where required.
- Approve deployments and spending.

The earlier 70–80% AI / 20–30% human estimate was only a rough planning estimate, not a guarantee.

### Discussion 4 — Tool choice
The user already uses ChatGPT and has GitHub and Supabase connected. The decision was to keep ChatGPT as the primary planning/development assistant rather than add complexity with multiple paid app builders. GitHub Codespaces is the browser-based development environment when a terminal/editor is needed. Tool availability and free quotas can change and must be checked in the relevant account.

### Discussion 5 — Project tracking and resume
A permanent `PROGRESS.md` in the repository was selected as the source of truth for project status. At the end of every work session, update it with:
- What was actually completed.
- What is broken or unverified.
- What remains.
- The exact next step.

When resuming, first read `PROGRESS.md`, inspect the repository, and continue from the next verified task. Do not assume old chat context proves that code or infrastructure exists.

### Discussion 6 — Name
The user selected **ViralBatch** as the project name.

**Tagline:** “Batch-create your TikToks, Reels, and Shorts in one click.”

Other names considered included ClipForge AI, HookBatch, HookStack AI, KinyaShorts, and IjwiClips, but ViralBatch is the chosen name.

## 2. Product overview

**ViralBatch** is a cloud-based SaaS for creators, social media managers, and agencies. It converts long-form video/audio or written scripts into batches of short-form content.

### Core value proposition
Turn one long video or script into multiple short-form content opportunities, with hooks, captions, subtitles, and export-ready assets—supporting English and Kinyarwanda.

### Target platforms
- TikTok
- Instagram Reels
- YouTube Shorts

### Target users
- Individual content creators.
- Social media managers.
- Marketing and creative agencies.
- Rwandan and East African creators, as well as global users.

## 3. Functional requirements

### MVP — text/script to hooks and captions
Build this first because it can be tested without expensive video rendering infrastructure.

1. User pastes a script or transcript.
2. User selects the source/output language (initially English or Kinyarwanda).
3. User chooses the number or style of hooks to generate.
4. AI returns multiple hook options.
5. AI generates platform-specific captions and calls to action.
6. User can edit, regenerate, copy, and select outputs.
7. User can export results to CSV.
8. Authenticated users can save and revisit batches.

Output quality requirements:
- Preserve the meaning of the source.
- Do not invent facts, quotes, names, or claims.
- Make hooks engaging without misleading clickbait.
- Respect Kinyarwanda grammar, spelling, idioms, and code-switching.
- Keep platform outputs appropriately formatted.
- Make AI-generated text editable before export.

### Phase 2 — audio/video transcription and clipping
1. Securely upload supported video/audio formats.
2. Validate file type, size, duration, and ownership.
3. Store media in object storage.
4. Transcribe speech with timestamps.
5. Support Kinyarwanda and English, including mixed-language speech as model quality permits.
6. Analyze transcript segments to find strong clip candidates.
7. Suggest start/end times and explain why each segment was selected.
8. Let the user review/edit candidate clips.
9. Use FFmpeg in a separate worker to trim, convert to 9:16, and render subtitles.
10. Provide preview and batch download (including ZIP).

Do not claim perfect automatic clipping or face tracking. Provide manual adjustment because AI may choose poor boundaries or crop the wrong subject.

### Phase 3 — SaaS and business features
- User accounts and profile.
- Saved batches and media history.
- Usage credits and fair limits.
- Subscription tiers and payment integration.
- Team/agency workspaces and brand voice presets.
- Export formats compatible with common scheduling workflows.
- Optional social publishing integrations only after platform API permissions and compliance are verified.

## 4. Technical architecture

### Frontend
- Next.js / React.
- Tailwind CSS.
- Responsive dashboard and accessible components.
- Video preview and editing interface added in the video phase.

### Backend and database
- Supabase Postgres.
- Supabase Auth.
- Supabase Storage for appropriate assets, or external object storage for large video workloads.
- Row Level Security (RLS) on user-owned tables.
- Server-side validation and authorization for all sensitive operations.

### AI generation
Use a provider abstraction for LLM calls so the application can switch providers and compare cost/quality. Keep API keys on the server, never in browser code.

AI tasks:
- Transcript/script analysis.
- Hook generation.
- Caption generation for each platform.
- Clip candidate descriptions and timestamps (with a deterministic validation/review step).
- Optional brand-voice adaptation.

### Speech-to-text
Evaluate Kinyarwanda-capable systems before selecting one. Test on a representative set of real recordings, including:
- Clean studio speech.
- Phone recordings and background noise.
- Different speakers and accents.
- Kinyarwanda mixed with English or French.
- Names, places, slang, and music/noisy environments.

Compare word error rate, proper-noun accuracy, timestamps, diarization if needed, throughput, hardware needs, model license, privacy, and total cost. A free model is not free to operate if it requires expensive GPU compute.

### Video worker
- FFmpeg for media inspection, trimming, resizing, crop/scale, audio handling, and subtitle burn-in.
- Python or Node worker in a container.
- Durable job queue and retry handling.
- Separate worker deployment with sufficient CPU/RAM; GPU only if the selected model requires it.
- Store job state and outputs in database/object storage.
- Make jobs idempotent and clean up temporary files.

### Storage
Use private buckets and short-lived signed URLs. Set upload size/duration limits, retention rules, deletion support, and access checks. Avoid exposing public links to private user videos.

### Hosting
- Frontend: a suitable Next.js host connected to GitHub.
- Worker: a container host capable of sustained processing.
- Database/auth: Supabase.
- Object storage: Supabase Storage or a dedicated object-storage provider after cost comparison.

Do not assume a free serverless frontend host can run long FFmpeg or GPU transcription jobs.

## 5. APIs and services to evaluate

| Capability | Candidate technology | Notes |
|---|---|---|
| Authentication/database | Supabase | Auth, Postgres, RLS, storage |
| Text AI | OpenAI API, Gemini API, or another LLM | Compare quality, price, limits, and data terms |
| Kinyarwanda STT | Kinyarwanda-tuned open-source models; Google Cloud Speech or other vendors if language support is confirmed | Benchmark real samples before choosing |
| Media processing | FFmpeg | Open-source; compute and hosting still cost money |
| Face/person detection | MediaPipe or OpenCV | Optional; test crop quality and privacy |
| Advanced video rendering | Remotion or a rendering API | Optional, not required for MVP |
| Background jobs | Redis/BullMQ, Inngest, or equivalent | Needed for reliable long-running processing |
| Object storage | Cloudflare R2, AWS S3, or Supabase Storage | Compare egress, storage, request, and lifecycle costs |
| Payments | Stripe, Flutterwave, Paypack, MTN MoMo or another eligible provider | Verify Rwanda onboarding, KYC, settlement, fees, and API availability |
| Deployment | GitHub-connected frontend host and container worker host | Separate web requests from media jobs |

No API key or credential belongs in this document or in Git history.

## 6. Cost and “free” expectations

The code and some models/tools may be free or open source. A production service is not guaranteed to be free.

Potential costs:
- LLM API usage.
- Speech recognition compute or per-minute API fees.
- CPU/GPU worker runtime.
- Storage and data transfer.
- Queue/monitoring services.
- Domain, email, and payment processing.
- Compliance and operational costs.

Start with the script-to-hooks MVP to validate demand and limit infrastructure costs. Add video processing after usage and cost have been measured. Verify each provider's current free tier and pricing before committing to it; quotas and plans change.

## 7. Security, privacy, and reliability requirements

- Never commit secrets or paste credentials into chat logs or documentation.
- Use environment variables/secret management for server-side credentials.
- Apply Supabase RLS and test cross-user access isolation.
- Validate MIME type and actual media content, not just file extensions.
- Enforce file size, duration, and rate limits.
- Use signed upload/download URLs and private storage.
- Delete temporary media and provide user deletion controls.
- Protect endpoints against unauthorized job access and replay.
- Log job IDs and errors without logging private media or secrets.
- Add retry/backoff, timeouts, and job status visibility.
- Respect model, dataset, and third-party API licenses and terms.
- Obtain required user rights/consent for uploaded content and any face/voice processing.

## 8. Development workflow and rules for AI assistants

This is a cloud-only project. The user wants to work through ChatGPT, GitHub, Supabase, and browser-based cloud development.

For every task:
1. Read this document and `PROGRESS.md`.
2. Inspect current files, branches, and relevant Supabase state.
3. Summarize the intended small change.
4. Make only the necessary change.
5. Run appropriate checks/tests when tools allow.
6. Report exactly what changed and what was verified.
7. Update `PROGRESS.md` with the next action.

Do not:
- Claim a file, table, deployment, or integration exists without checking.
- Recreate the whole project when only one feature is requested.
- overwrite existing code without inspecting it.
- expose secrets in logs, commits, screenshots, or documentation.
- build the expensive video pipeline before the text MVP works.

## 9. Initial database concepts (design only; inspect Supabase first)

Potential initial tables:
- `profiles`: user profile and account-level settings.
- `batches`: generation jobs and saved batch metadata.
- `batch_outputs`: generated hooks/captions and platform-specific variants.
- Later: `media_assets`, `transcription_jobs`, `clip_candidates`, `render_jobs`, `subscriptions`, and `usage_ledger`.

The first planning discussion suggested:
- `profiles`: id, email, full_name, credits_remaining, created_at.
- `batches`: id, user_id, title, language, original_script, generated_hooks_json, created_at.

These are starting concepts, not approved production migrations. Use Supabase Auth user IDs, foreign keys, constraints, indexes, RLS policies, and server-side credit accounting. Inspect the existing database before creating anything.

## 10. Roadmap

1. Repository foundation and documentation.
2. Inspect Supabase project and prepare safe schema/RLS plan.
3. Build Next.js app shell and dashboard.
4. Implement script-to-hooks/captions generator.
5. Add editing, saving, history, and CSV export.
6. Add language-quality evaluation and Kinyarwanda prompt tuning.
7. Benchmark and integrate transcription.
8. Add video upload, asynchronous processing, FFmpeg clipping, and subtitles.
9. Add credits, payment provider, deployment, monitoring, and launch.

## 11. Immediate instruction for the next AI session

You are helping build **ViralBatch** in the existing GitHub repository:
https://github.com/imenakingstone/ViralBatch

Start by reading `PROGRESS.md`, this file, and the current repository structure. Then inspect the connected Supabase project without modifying it. Report what currently exists and identify the safest next implementation step. Do not assume the original planning actions created any code or database tables. Keep the work cloud-only, incremental, secure, and beginner-friendly.


## 12. Implementation log — 2026-11-17

The first code milestone has been added to the repository:
- Next.js App Router and TypeScript foundation.
- Responsive text content studio for script-to-hooks and platform captions.
- Editable output, clipboard actions, and CSV export.
- Server-side generation endpoint with request validation and timeout.
- OpenAI-compatible server key configuration; deterministic preview mode is clearly labeled when no key exists.
- Supabase migration for profiles and saved batches with RLS and explicit authenticated grants. This migration is documentation/code only and has not been run against the user's database.
- GitHub Actions workflow for install, typecheck, lint, and production build.

Current dependency versions were checked against npm on 2026-11-17: Next.js 16.4.6 and React 19.3.1. The project must be installed and validated in Codespaces before treating the code as working.

### Outstanding
Authentication, Supabase client integration, save/load history, real usage metering, payments, transcription, audio/video upload, clipping, FFmpeg rendering, subtitles, background workers, social publishing, production deployment, and human QA remain future work. See `PROGRESS.md` for the current verified next actions.


### Additional implementation — authentication and saved batches
- Added current Supabase SSR browser/server clients using `@supabase/ssr` and `@supabase/supabase-js`.
- Added a Next.js 16 root `proxy.ts` to refresh Supabase auth cookies using `auth.getClaims()`.
- Added email/password sign-in and sign-up forms, server actions, and an email confirmation callback route.
- Added a Save batch action in the content studio that checks the signed-in user and inserts the batch under that user's ID.
- Added explicit environment variable names for the Supabase project URL and publishable key.
- Supabase docs recommend cookie-based SSR clients, verifying claims on the server, and explicit grants plus RLS policies. The implementation follows this pattern, but it still needs a real project configuration and test run.
- No existing Supabase project was selected or modified because the connected account's project list did not contain a project clearly identified as ViralBatch.

Important remaining safety work: do not expose the AI generation endpoint with a billable key to public traffic until authentication is enforced on that endpoint and durable rate limits/usage metering are implemented. The current sign-in flow protects saved batch writes via RLS but does not yet gate the generation API.

- Added a saved-batch history page at `/batches`, protected by server-side Supabase Auth checks and backed by the per-user RLS policy.
- Added Dependabot configuration for weekly npm and GitHub Actions dependency updates.

- The live generation route now requires a verified Supabase user whenever a billable OpenAI key is present. Without an AI key, the route stays in clearly labeled demo mode. Durable rate limits, per-user usage metering, and abuse monitoring remain required before public launch.


## Continued implementation log — 2026-11-17 evening
- Added a second Supabase migration for a private generation-usage ledger and atomic daily quota function (30 live AI generations per signed-in user per UTC day).
- The live generation API now consumes a quota before spending OpenAI tokens and fails closed if the quota database function is unavailable.
- Added owner-authorized deletion of saved batches from the history page.
- Updated README and PROGRESS.md to reflect the actual implementation and the remaining human setup.
- These database-backed features still require the correct Supabase project to be confirmed and both migrations to be applied. They have not been live-tested.

- Added a signed-in usage summary endpoint and a studio display for remaining daily live AI generations. The summary is returned by a separate read-only database function; clients cannot read the private usage ledger directly.

- Added a secure saved-batch detail page at `/batches/[id]` with session checks, UUID validation, and an owner-scoped query. Users can open a saved batch and review its original script, hooks, platform captions, hashtags, language, tone, and timestamp.


## 13. Current implementation correction — 2026-11-17

This section and `PROGRESS.md` supersede earlier roadmap/status statements above wherever they conflict.

Implemented after the initial blueprint:
- Supabase SSR authentication, email/password flows, protected saved-batch history, detail, and deletion.
- Live AI endpoint authentication and database-backed daily quota (30 generations/user/UTC day), plus usage summary API/UI.
- Private media storage schema and signed-upload/job APIs:
  - `POST /api/media/upload-url`
  - `GET /api/media/jobs`
  - `PATCH /api/media/jobs`
- Third migration: `supabase/migrations/202611170003_media_pipeline.sql`.

Important: the media upload backend is a foundation, not a finished media feature. Browser upload UI, transcription, FFmpeg processing, and rendered clips are still outstanding.

Connected Supabase projects were rechecked: `MusicPlayer` and `glolex` are inactive; `FREE-CROSSPOSTER` is active. None is clearly identified as ViralBatch. Do not apply ViralBatch migrations to FREE-CROSSPOSTER without explicit user confirmation.

CI review found TypeScript typecheck passed, while lint initially failed on JSX apostrophe escaping and internal anchor navigation. Those issues were fixed in subsequent commits; check the newest workflow run before marking CI green. An npm install audit also reported 14 high-severity findings; review them deliberately rather than applying a potentially breaking forced audit fix.

Human-dependent setup that AI cannot safely infer: choose/create the correct dedicated Supabase project, provide its credentials and the OpenAI secret through secure settings, review/apply migrations, and approve any paid deployment or public launch.


## 14. Media upload and Kinyarwanda ASR additions — 2026-11-17
- The studio now includes a source audio/video upload panel. It requests a short-lived signed upload token, uploads directly to the private `source-media` bucket, and confirms the object.
- Media job writes are hardened: authenticated users can create only the allowed metadata fields; job state transitions use an owner-checked database function rather than broad client update permissions.
- Added a Kinyarwanda ASR research note. Current candidates: Google Cloud Speech-to-Text V2 (`rw-RW`) and Pindo Voice AI (`rw`). Neither is selected or configured; test consented Rwandan recordings and privacy/pricing before production choice.
- Added a WER/CER evaluation utility and instructions. Do not commit private audio or real reference transcripts to this public repository.
- New docs: `docs/kinyarwanda-transcription-research.md`, `docs/asr-evaluation/README.md`, and `scripts/evaluate-asr.mjs`.


## 2026-11-17 — AI completed more of the previously human-dependent setup
- Inspected the connected Supabase account. Existing projects are MusicPlayer (inactive), glolex (inactive), and FREE-CROSSPOSTER (active). None is clearly ViralBatch, so no unrelated database was modified and no new billable project was created.
- Built a fourth migration for the secure media queue, service-role-only worker RPCs, retries, and stale-worker recovery.
- Built a separate Node 22 container worker that calls Pindo's authenticated Kinyarwanda speech-to-text API and saves plain transcripts to media jobs.
- Connected the dashboard to list media jobs and display completed transcript text.
- Added worker syntax validation to GitHub Actions and updated README/PROGRESS.
- Human tasks still needed: create/identify the dedicated ViralBatch Supabase project, provide the project URL/publishable key and server-only service role key through secret settings, supply Pindo credentials, deploy the worker container, and approve provider privacy/consent terms. Do not paste private credentials into chat or commit them.
- Current boundary: media transcription is architected and coded, but cannot run until the database migration and worker secrets/deployment exist. Transcripts are plain text without timestamps; no FFmpeg clip rendering or subtitle output yet.
