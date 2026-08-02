import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildMarketReadiness, buildMarketReadinessMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const jsonPath = resolve(process.argv[3] ?? `./artifacts/airlock-market-readiness-${seed}.json`);
const markdownPath = resolve(process.argv[4] ?? `./artifacts/airlock-market-readiness-${seed}.md`);
const readiness = buildMarketReadiness(seed);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(readiness, null, 2)}\n`);
writeFileSync(markdownPath, buildMarketReadinessMarkdown(readiness));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seed,
      mode: readiness.mode,
      gates: readiness.gates.map((gate) => ({ id: gate.id, status: gate.status })),
      readinessHash: readiness.readinessHash,
    },
    null,
    2,
  ),
);
