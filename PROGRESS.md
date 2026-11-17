# ViralBatch — Project Progress

_Last updated: 2026-11-17_

## Project identity
- **Name:** ViralBatch
- **Tagline:** Batch-create your TikToks, Reels, and Shorts in one click.
- **Product:** A cloud-based SaaS that turns long videos, audio, or scripts into short-form clips, hooks, subtitles, and platform-ready captions in batches.
- **Initial market:** Global creators and agencies, with strong support for Kinyarwanda and English for Rwanda/East Africa.

## Current repository status
- GitHub repository: https://github.com/imenakingstone/ViralBatch
- Default branch: `main`
- Repository was found and is accessible through the connected GitHub integration.
- `README.md` exists and currently contains only the project heading.
- This document and `CHAT_HISTORY_AND_BLUEPRINT.md` are being added as the project documentation foundation.
- No application implementation has been verified yet.
- No Supabase schema or deployed application has been verified yet.

## Product scope

### MVP (build first)
1. A clean, responsive SaaS dashboard.
2. Paste a script or transcript.
3. Choose output language: English or Kinyarwanda (allow mixed-language source text where practical).
4. Generate multiple hooks and platform-specific captions for TikTok, Instagram Reels, and YouTube Shorts.
5. Let users edit and select generated results.
6. Export captions and content plans as CSV.
7. Save generation history after authentication and database setup.

### Later video features
1. Upload audio/video securely.
2. Transcribe Kinyarwanda and English audio and retain timestamps.
3. Detect promising moments and suggest clip start/end times.
4. Render vertical 9:16 clips with FFmpeg.
5. Add subtitle styles, safe margins, and optional speaker-aware reframing.
6. Download batches as MP4 files and ZIP archives.

### Later business features
- Usage credits and plan limits.
- Subscription and payment integration after provider eligibility and business requirements are checked.
- Team/agency workspaces, brand voice presets, and scheduled publishing/export integrations.

## Architecture direction
- **Frontend:** Next.js (React) and Tailwind CSS.
- **Database/auth:** Supabase (Postgres, Auth, and Storage where suitable).
- **AI text generation:** Provider abstraction so the app can support an LLM provider without hard-coding one vendor.
- **Speech recognition:** Evaluate Kinyarwanda-capable models and services using real local audio before selecting production default. Compare transcription accuracy, timestamps, latency, licensing, privacy, and total cost.
- **Video processing:** FFmpeg in a separate containerized worker; do not run long video jobs inside short-lived frontend/serverless requests.
- **Background jobs:** Add a durable queue when video processing is introduced.
- **Hosting:** Deploy frontend and worker separately. Select hosting based on actual CPU/RAM/GPU requirements and measured costs.
- **Storage:** Use object storage for large media; define upload limits, retention, and deletion policies.

## Important development rules
1. **Cloud-only:** The project must be developed and operated online. Do not require the user's local PC for coding, running, or processing.
2. **Incremental work:** Implement one small, testable feature at a time. Do not rewrite working areas unnecessarily.
3. **Inspect before changing:** Read the existing repository files and database state before proposing or applying modifications.
4. **No invented completion:** Mark a task complete only after verifying the code, test, deployment, or database change.
5. **Secrets:** Never commit API keys, service-role keys, OAuth secrets, access tokens, or passwords. Use deployment environment variables and secret stores.
6. **Progress tracking:** Update this file at the end of each meaningful work session with verified accomplishments, issues, and the exact next task.
7. **Beginner-friendly guidance:** Explain actions plainly and avoid requiring terminal commands when the GitHub browser UI or connected tools can perform the task.
8. **Data safety:** Use Supabase RLS for user-owned records; validate uploads and file types; enforce authorization server-side.

## Roadmap and status

| Phase | Work | Status |
|---|---|---|
| 1 | Repository and project documentation | In progress |
| 2 | Inspect/confirm Supabase project and design schema | Not started |
| 3 | Build responsive Next.js foundation and dashboard | Not started |
| 4 | Build script-to-hooks/captions generation MVP | Not started |
| 5 | Add authentication, saved batches, and RLS | Not started |
| 6 | CSV export and user editing workflow | Not started |
| 7 | Evaluate Kinyarwanda/English transcription | Not started |
| 8 | Add uploads, background jobs, FFmpeg clipping and subtitles | Not started |
| 9 | Credits, payments, deployment, monitoring and launch | Not started |

## Immediate next steps
1. Verify both documentation files are present on the GitHub `main` branch.
2. Inspect the connected Supabase project and confirm whether it is the intended project before creating or modifying tables.
3. Review the existing repository structure and choose the smallest safe implementation step.
4. Build the MVP foundation before video rendering or paid integrations.

## Session log
### 2026-11-17
- Located repository `imenakingstone/ViralBatch` on GitHub.
- Confirmed `README.md` exists.
- Confirmed `PROGRESS.md` and `CHAT_HISTORY_AND_BLUEPRINT.md` were not present before this documentation setup.
- Next: verify the new documentation commits and inspect Supabase/repository state before implementation.


## Implementation update — 2026-11-17 (AI build session)

### Implemented and committed to GitHub
- Initialized a Next.js App Router + TypeScript project structure under `src/app`.
- Added a responsive ViralBatch content-studio interface with script input, word/character count, language/tone/hook-count controls, editable hook results, platform caption tabs, copy actions, and CSV export.
- Added a server-side `POST /api/generate` endpoint with input validation, output shape checks, timeout handling, and server-only OpenAI API key access.
- Added a clearly labeled deterministic preview mode when `OPENAI_API_KEY` is not configured. Preview output is not represented as live AI output.
- Added `.env.example` without secrets and a README with Codespaces setup instructions.
- Added a Supabase SQL migration for profiles and saved batches, including authenticated-only grants, RLS policies, user ownership checks, and a new-user profile trigger. The migration is committed but has NOT been applied to Supabase.
- Added a GitHub Actions workflow to install dependencies and run typecheck, lint, and production build on pushes and pull requests.
- Updated dependencies to the current stable Next.js 16.4.6 and React 19.3.1 based on the npm package registry check on 2026-11-17.

### Not yet verified
- No Codespaces terminal execution was available through the GitHub repository connector, so `npm install`, typecheck, lint, and production build have NOT been run by the assistant.
- GitHub Actions workflow has been committed; its run result must be checked in the repository Actions tab.
- No live AI key is configured or tested.
- Supabase project identity was not confirmed and no database changes were applied.
- No user authentication, persistent batch saving, credits, billing, transcription, video processing, or publishing integrations are implemented yet.

### Exact next steps
1. In the existing Codespace, run `npm install`, then `npm run typecheck`, `npm run lint`, and `npm run build`; share any errors for fixes.
2. Check GitHub Actions for the automated validation result.
3. Confirm the correct Supabase project, then review and apply `supabase/migrations/202611170001_initial_schema.sql` only after approval.
4. Add a server-side `OPENAI_API_KEY` to Codespaces Secrets or deployment environment variables if live generation is desired; never commit it.
5. Implement Supabase Auth and save/load batch history after the project URL and publishable key are configured.
6. Have fluent Kinyarwanda speakers review generated copy before public use.

### Safety and scope notes
- No secrets were added to the repository.
- No paid resources were created, no deployment was triggered, and no database was modified.
- Preview mode is for interface testing only; it does not replace a configured AI provider.
