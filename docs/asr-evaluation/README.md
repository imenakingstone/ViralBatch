# ASR evaluation workspace

Keep this dataset private if it contains identifiable voices or personal information. Use only recordings with speaker consent and provider-sharing approval.

## Sample format

Create a JSON array where every row contains:
- `id`: stable recording ID (not a person's name).
- `language`: `rw`, `en`, `fr`, or `rw-en`.
- `reference`: transcript verified by a fluent speaker.
- `hypothesis`: provider transcript for the same audio.

Example:
```json
[
  {
    "id": "rw-clean-001",
    "language": "rw",
    "reference": "A verified Kinyarwanda reference sentence goes here.",
    "hypothesis": "The speech provider output goes here."
  }
]
```

The example strings above are placeholders, not evaluation data.

## Run the evaluator

From the repository root:

```bash
node scripts/evaluate-asr.mjs path/to/your-private-samples.json
```

The script reports per-sample and aggregate word error rate (WER) and character error rate (CER). Lower is better. It applies Unicode NFKC normalization, lowercase conversion, punctuation/symbol removal, and whitespace collapse. Preserve original raw transcripts separately; this normalized score is only for comparison.

## Important limitations

- WER/CER alone do not measure meaning, named entities, code-switching quality, timestamps, or subtitle readability.
- Review names, places, numbers, English insertions, and slang separately.
- Use the same audio set and normalization rules for every provider.
- Do not commit private audio, speaker identities, API credentials, or private reference transcripts to this public repository.
