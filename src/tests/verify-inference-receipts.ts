import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyInferenceReceipts } from '../engine';
import type { InferenceReceipts } from '../engine/inference-receipts';

const path = resolve(process.argv[2] ?? './artifacts/airlock-inference-receipts-airlock-stage-zero-demo.json');
const receipts = JSON.parse(readFileSync(path, 'utf8')) as InferenceReceipts;
const result = verifyInferenceReceipts(receipts);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      speechReceipts: receipts.entries.length,
      errors: result.errors,
      expectedReceiptsHash: result.expected.receiptsHash,
      actualReceiptsHash: receipts.receiptsHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
