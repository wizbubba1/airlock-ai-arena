import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildPickemReceipt, parseAgentPick } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const picks = [parseAgentPick(process.argv[3] ?? 'vanta'), parseAgentPick(process.argv[4] ?? 'kepler')];
const outPath = resolve(process.argv[5] ?? `./artifacts/airlock-pickem-${seed}.json`);
const receipt = buildPickemReceipt(seed, picks);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      ok: true,
      path: outPath,
      seed,
      picks: receipt.picks,
      saboteurs: receipt.saboteurs,
      score: receipt.score,
      perfect: receipt.perfect,
      receiptHash: receipt.receiptHash,
    },
    null,
    2,
  ),
);
