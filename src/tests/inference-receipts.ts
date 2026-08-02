import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildInferenceReceipts, buildInferenceReceiptsMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const jsonPath = resolve(process.argv[3] ?? `./artifacts/airlock-inference-receipts-${seed}.json`);
const markdownPath = resolve(process.argv[4] ?? `./artifacts/airlock-inference-receipts-${seed}.md`);
const receipts = buildInferenceReceipts(seed);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(receipts, null, 2)}\n`);
writeFileSync(markdownPath, buildInferenceReceiptsMarkdown(receipts));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seed,
      speechReceipts: receipts.entries.length,
      receiptsHash: receipts.receiptsHash,
    },
    null,
    2,
  ),
);
