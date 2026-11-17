# ViralBatch

**Batch-create your TikToks, Reels, and Shorts in one click.**

ViralBatch is a cloud-first content studio for turning scripts and transcripts into editable short-form hooks and platform-specific captions. The first milestone focuses on text generation; transcription and video rendering are later milestones.

## Current MVP
- Responsive content studio dashboard.
- Script/transcript input with length validation.
- English, Kinyarwanda, mixed Kinyarwanda + English, and French output selection.
- 3–10 hook variations and tone selection.
- Editable hooks and TikTok, Instagram Reels, and YouTube Shorts captions.
- Copy actions and CSV export.
- Server-side AI provider integration using an environment variable.
- Clearly labeled preview/demo generation when no AI key is configured.
- Initial Supabase schema with per-user Row Level Security (RLS), provided as a migration for review.

## Cloud development (GitHub Codespaces)

Open the repository in Codespaces, then use its terminal:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Codespaces should offer to open forwarded port 3000. The app can also be started from the Ports tab.

## Enable live AI generation

Add a server-side key to .env.local:

```env
OPENAI_API_KEY=your_server_side_key
OPENAI_MODEL=gpt-4o-mini
```

Restart the development server after changing environment variables. Never add a real key to Git, client-side code, screenshots, or chat. The app uses demo output when no key is configured; demo output is not a live AI response and should be reviewed before publication.

## Supabase setup (human approval required)
1. Confirm the intended Supabase project.
2. Review supabase/migrations/202611170001_initial_schema.sql.
3. Apply it in the Supabase SQL Editor only after confirming the project and reviewing the SQL.
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to your environment. The sign-in/sign-up UI and cookie-based SSR clients are implemented; authentication will work only after valid project settings and the migration are in place.

The migration creates profiles and batches, enables RLS, and scopes rows to the signed-in user. It has not been applied to any database by this repository change.

## API
`POST /api/generate` accepts script, language, tone, and count. The API validates input and uses the OpenAI Chat Completions API only from the server. If no key is present, it returns an explicitly marked demo result.

## Project documents
- PROGRESS.md — progress tracker.
- CHAT_HISTORY_AND_BLUEPRINT.md — conversation history and product blueprint.

## Not implemented yet
Subscription/credit enforcement, Kinyarwanda transcription, audio/video upload, clip selection, FFmpeg rendering, subtitles, background jobs, publishing integrations, and production deployment.

## Important
This project is not production-ready until dependencies are installed, type/lint/build checks pass, auth and RLS are tested, secrets are configured securely, and real Kinyarwanda outputs are reviewed by fluent speakers. Provider pricing, availability, and model support can change; verify before launch.

**Production safety:** The live AI endpoint requires a verified Supabase user when a billable AI key is configured. Durable rate limits, per-user usage metering, abuse protection, and monitoring are still missing. Do not open public sign-ups with a billable AI key until those controls are implemented.
