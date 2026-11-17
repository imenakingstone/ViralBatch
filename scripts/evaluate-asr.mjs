#!/usr/bin/env node
import { readFile } from "node:fs/promises";

function normalize(text) {
  return text.normalize("NFKC").toLocaleLowerCase("und")
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function distance(a, b) {
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      diagonal = above;
    }
  }
  return previous[b.length];
}

function score(reference, hypothesis, unit) {
  const ref = unit === "word" ? normalize(reference).split(" ").filter(Boolean) : Array.from(normalize(reference));
  const hyp = unit === "word" ? normalize(hypothesis).split(" ").filter(Boolean) : Array.from(normalize(hypothesis));
  if (ref.length === 0) return { errors: null, total: 0, rate: null };
  const errors = distance(ref, hyp);
  return { errors, total: ref.length, rate: errors / ref.length };
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/evaluate-asr.mjs <samples.json>");
  process.exit(2);
}

const samples = JSON.parse(await readFile(inputPath, "utf8"));
if (!Array.isArray(samples) || samples.length === 0) {
  console.error("The input must be a non-empty JSON array of { id, language, reference, hypothesis } records.");
  process.exit(2);
}

let wordErrors = 0, wordTotal = 0, charErrors = 0, charTotal = 0;
const results = samples.map((sample, index) => {
  if (!sample || typeof sample.reference !== "string" || typeof sample.hypothesis !== "string") {
    throw new Error("Sample " + index + " must contain string reference and hypothesis fields.");
  }
  const wer = score(sample.reference, sample.hypothesis, "word");
  const cer = score(sample.reference, sample.hypothesis, "char");
  wordErrors += wer.errors ?? 0; wordTotal += wer.total;
  charErrors += cer.errors ?? 0; charTotal += cer.total;
  return {
    id: sample.id ?? String(index + 1),
    language: sample.language ?? "unspecified",
    WER: wer.rate === null ? "N/A" : (wer.rate * 100).toFixed(2) + "%",
    CER: cer.rate === null ? "N/A" : (cer.rate * 100).toFixed(2) + "%"
  };
});

console.table(results);
console.log("Aggregate WER:", wordTotal ? (wordErrors / wordTotal * 100).toFixed(2) + "%" : "N/A");
console.log("Aggregate CER:", charTotal ? (charErrors / charTotal * 100).toFixed(2) + "%" : "N/A");
console.log("Normalization: Unicode NFKC, lowercase, punctuation/symbol removal, whitespace collapse.");
