# Kinyarwanda transcription research

_Research date: 2026-11-17_

## Finding

Kinyarwanda speech recognition is available from at least two API routes worth evaluating. Do not choose a production provider based on language-list inclusion alone: real Rwandan speech, regional accents, music/noise, names, and Kinyarwanda-English code-switching need a small local evaluation set.

## Candidate 1 — Google Cloud Speech-to-Text V2

- Google's official V2 supported-language table lists **Kinyarwanda (Rwanda), language code `rw-RW`**, with long and short recognition models.
- Google documents synchronous recognition for audio up to one minute and asynchronous long-running recognition for longer recordings.
- This is a strong managed-service candidate for production-scale processing, but requires a Google Cloud project, billing configuration, and secure credentials. Those are not configured in ViralBatch.
- Sources:
  - https://cloud.google.com/speech-to-text/docs/speech-to-text-supported-languages
  - https://cloud.google.com/speech-to-text/docs/overview

## Candidate 2 — Pindo Voice AI

- Pindo's official API documentation explicitly lists Kinyarwanda (`rw`) speech-to-text, alongside Kiswahili and Luganda.
- Its documented endpoint is `POST /ai/stt/rw`; a public rate-limited endpoint is also documented for prototyping.
- The API accepts common audio formats including WAV, MP3, AAC, WebM, and MP4.
- It may be a convenient Rwanda/East Africa-focused candidate for an early proof of concept. Before production, confirm service availability, privacy/retention terms, limits, pricing, and performance on real creator audio. Do not use the public unauthenticated endpoint for production user media.
- Sources:
  - https://docs.pindo.ai/docs/ai/stt
  - https://docs.pindo.ai/docs/ai/overview

## Evaluation plan before provider selection

Create a consented test set with 20–50 short recordings:
- clean studio speech and phone recordings;
- male and female speakers, different ages and regional accents;
- Kinyarwanda-only speech;
- Kinyarwanda-English code-switching;
- creator audio with music/noise;
- names, places, slang, and borrowed words.

For each recording, have a fluent speaker produce a verified reference transcript. Compare each provider on:
1. Word error rate (WER), with a documented normalization policy.
2. Character error rate (CER) as a secondary metric.
3. Proper-name and number accuracy.
4. Code-switching retention (do not silently translate English words).
5. Processing latency, failure rate, file-size/duration limits, and total cost per audio hour.
6. Data retention, training use, residency, and deletion controls.

Do not upload private creator media to a provider until its privacy terms and user consent flow are approved.

## Recommendation

Implement a provider adapter interface and benchmark both candidates against the same consented Rwandan recordings. Keep provider selection configurable. Do not hardwire a provider or claim Kinyarwanda transcription quality until fluent-speaker evaluation is complete.

## Current ViralBatch implementation boundary

ViralBatch currently has private source-media storage and authenticated upload/job APIs. It does **not** yet transcribe files, call either candidate provider, create timestamped transcript segments, or render subtitles. The storage bucket and media-job migration must be applied to the confirmed ViralBatch Supabase project before the upload workflow can be used.
