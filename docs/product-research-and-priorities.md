# ViralBatch product research and priorities — 17 November 2026

## Executive direction

ViralBatch should evolve from a one-off AI caption generator into a creator workflow: brief → create → review → repurpose → organize → publish (only when authorized) → learn from performance.

The strongest differentiator to preserve is practical support for English, Kinyarwanda, and mixed-language creators, with human review and creator control built into the workflow.

## Research reviewed

1. **The Influencer Marketing Factory — The 2026 Creator Landscape**
   - Survey chart lists editing (24.7%), idea generation (21.0%), script/caption writing (17.2%), analytics/insights (16.7%), and automation/scheduling (12.3%) among creator AI uses.
   - The report argues AI should accelerate production without replacing a creator's authentic voice.
   - https://theinfluencermarketingfactory.com/wp-content/uploads/2026/02/Creator-Economy-Report-2026.pdf

2. **CreatorIQ — The State of Creator Marketing 2025–2026**
   - Reports widespread AI use by brands and agencies.
   - Common applications include short-form content generation, research and analysis, editing/graphics/video, performance reporting, repurposing, and workflow approvals.
   - https://hs-21030792.f.hubspotemail.net/hubfs/21030792/2025-26%20State%20of%20Creator%20Marketing/CreatorIQ-StateofCreatorMarketing2025-2026.pdf

3. **TikTok for Developers — Content Posting API**
   - Direct Post requires querying creator information, presenting permitted settings, obtaining creator consent, and using the appropriate approved scope.
   - Unaudited API clients are restricted to private-view posts.
   - https://developers.tiktok.com/docs/en/content-posting-api-get-started
   - https://developers.tiktok.com/docs/en/content-sharing-guidelines

## Product decisions

### Implemented in this pass
- Content goal selection: grow audience, educate, build community, drive sales, increase engagement.
- Optional target-audience field.
- Optional brand-voice notes.
- Generation prompt adapts framing and CTA to these inputs while preserving source meaning and prohibiting invented facts.
- Saved batches persist and display their creator brief (migration 6).

### Recommended next
1. **Content calendar and campaign planning** — organize generated batches into a weekly plan, with manual scheduling first. Actual auto-publishing should come only after compliant OAuth and API access.
2. **Hook review tools** — let users favorite/select hooks, compare variants, and see explainable quality checks (clarity, specificity, curiosity, truthfulness), not an opaque “viral score”.
3. **Repurposing workspace** — turn one approved script/transcript into multiple formats and reusable assets while retaining the original source and revision history.
4. **Performance analytics** — connect platform metrics only through authorized accounts and official APIs; show source, date range, and missing metrics. Do not invent engagement or reach data.
5. **Team/agency collaboration** — brand profiles, approval states, client workspaces, and roles after the single-creator flow is stable.
6. **Kinyarwanda quality loop** — optional corrections and human review, consented evaluation samples, and a measured quality benchmark before claiming reliable transcription or translation.

## Guardrails
- Keep all API keys server-side.
- Never claim a social account is connected from app credentials alone.
- Do not schedule or publish without explicit account authorization and user consent.
- Preserve user control: generated text remains editable; AI suggestions should not silently overwrite creator content.
- Clearly distinguish demo output from live AI output.
- For Kinyarwanda, include human review until real-world quality has been measured.
- Do not add analytics until platform metrics are available from a permitted source.

## Current status
This is product research and implementation guidance, not a claim that all listed capabilities exist. The creator-brief feature is implemented in the application code; its database migration still requires review/application in the dedicated ViralBatch Supabase project.
