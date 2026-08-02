import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyPickemReceipt } from '../engine';
import type { PickemReceipt } from '../engine/pickem';

const path = resolve(process.argv[2] ?? './artifacts/airlock-pickem-airlock-stage-zero-demo.json');
const receipt = JSON.parse(readFileSync(path, 'utf8')) as PickemReceipt;
const result = verifyPickemReceipt(receipt);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: receipt.seed,
      errors: result.errors,
      expectedReceiptHash: result.expected.receiptHash,
      actualReceiptHash: receipt.receiptHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
