# ViralBatch — Project Progress

_Last updated: 2026-11-17_

## Product
ViralBatch is a cloud-first SaaS for turning scripts, transcripts, and eventually long videos/audio into batches of short-form hooks, captions, subtitles, and clips for TikTok, Instagram Reels, and YouTube Shorts. English, Kinyarwanda, mixed-language, and French text workflows are planned.

Repository: https://github.com/imenakingstone/ViralBatch
Default branch: `main`

## Verified implementation committed to GitHub

### Application
- Next.js App Router + TypeScript foundation (Next.js 16.4.6, React 19.3.1).
- Responsive content-studio dashboard.
- Script/transcript input with validation, language/tone/hook-count controls.
- Editable hooks and platform-specific captions.
- Copy actions and CSV export.
- Clearly labeled demo output when no OpenAI key is configured.

### AI generation
- Server-side OpenAI Chat Completions integration.
- Input and response validation, request timeout, and server-only API key.
- Live generation requires a verified Supabase user when an OpenAI key is configured.
- Added an atomic database-backed daily quota: 30 live generations per user per UTC day. The API fails closed if the quota migration is missing or unavailable.
- Demo mode remains available without credentials and does not consume paid AI tokens.

### Authentication and saved work
- Supabase browser/server clients and Next.js 16 proxy session refresh.
- Email/password sign-in and sign-up actions plus auth confirmation callback.
- Authenticated batch save action and `/batches` history page.
- Initial SQL migration creates profiles and batches with per-user RLS.

### Engineering and documentation
- GitHub Actions workflow for dependency install, typecheck, lint, and build.
- Weekly Dependabot updates.
- `.env.example`, README, this tracker, and the master blueprint.

## Database migrations
1. `supabase/migrations/202611170001_initial_schema.sql` — profiles, batches, RLS and signup profile trigger.
2. `supabase/migrations/202611170002_generation_usage.sql` — private usage ledger and atomic daily quota function.

**Neither migration has been applied.** The connected Supabase account previously showed multiple projects and none was clearly confirmed as the ViralBatch database. Do not apply migrations to an unrelated project.

## Not built yet
- Secure media upload and object storage lifecycle.
- Audio/video metadata inspection and validation.
- Kinyarwanda/English speech-to-text evaluation and transcription.
- Timestamped transcript editor.
- AI clip candidate selection and manual trim controls.
- FFmpeg background worker, job queue, 9:16 rendering, subtitles and ZIP export.
- Subscription plans, billing, team workspaces and social publishing.
- Production deployment, monitoring, backups and operational runbooks.

## Verification status and limitations
- GitHub files and commits have been verified through the GitHub integration.
- Assistant has not had a Codespaces terminal session, so npm install, typecheck, lint, production build, browser tests, and CI results are not verified.
- No live OpenAI key has been configured or tested.
- Supabase auth, RLS, saved batches, and the quota RPC are code-complete but remain unverified against a real project until the correct project is confirmed and migrations are applied.
- The 30/day quota is an initial safety ceiling, not a paid subscription/credit system. It is UTC-based and can be tuned after product/business decisions.
- Kinyarwanda generated copy needs fluent-speaker review before public use.
- No secrets were committed and no paid infrastructure or deployment was created.

## Human-only actions to handle when available
- Confirm which Supabase project is specifically for ViralBatch.
- Add Supabase URL and publishable key to Codespaces/deployment environment secrets.
- Add the OpenAI API key securely only after auth and quota migrations are applied and tested.
- Review/apply the two migrations to the confirmed project.
- Review Kinyarwanda output and approve public launch/deployment and any spending.

## Next AI-buildable tasks
1. Add a user-facing usage endpoint and show remaining daily live generations in the studio.
2. Add batch detail viewing and deletion with owner-scoped server-side authorization.
3. Improve request validation, observability, and automated tests around the generation API.
4. Design the media-processing job/data model and upload policy before implementing video upload.
5. Research Kinyarwanda speech-to-text options and create an evaluation harness before choosing a model.

## Development rules
- Keep all work cloud-first; do not require the user's local PC.
- Inspect files before changing them; make small incremental commits.
- Never mark a feature tested unless an actual test ran.
- Never commit secrets.
- Keep this file updated after meaningful work sessions.

## Continued AI build session — 2026-11-17 evening

- Added migration `202611170002_generation_usage.sql`: private generation usage ledger plus an atomic PostgreSQL function that allows up to 30 live AI generations per signed-in user per UTC day. The function serializes concurrent requests per user/day and fails closed if auth is absent.
- Updated `POST /api/generate` to consume a quota credit before calling the paid AI provider and return clear 429/503 responses when the limit is reached or quota infrastructure is unavailable.
- Added authenticated saved-batch deletion using a server action; the action checks the signed-in user and scopes deletion to that user's own row. Added responsive button styling.
- Rewrote this progress tracker to remove stale statements that contradicted the implemented code.
- Updated README with the second migration and daily quota behavior.
- All changes are committed on `main`. They are code-level implementations only; no migrations or tests have been run against a live Supabase project.

- Added authenticated `GET /api/usage` and a studio usage display showing remaining daily live generations and UTC reset time for signed-in users. Added a read-only security-definer RPC; the usage ledger remains inaccessible directly to client roles.

- Added a secure saved-batch detail route at `/batches/[id]` that verifies the session, validates the UUID, and queries only the current user's batch. The history list now links to details; saved content displays the original script, hooks, captions, hashtags, language, tone, and creation time.
