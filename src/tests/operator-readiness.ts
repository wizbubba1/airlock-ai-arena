import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildOperatorReadiness, buildOperatorReadinessMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const matchCount = Number(process.argv[3] ?? 100);
const seedPrefix = process.argv[4] ?? 'stage-zero-ci';
const jsonPath = resolve(process.argv[5] ?? './artifacts/airlock-operator-readiness.json');
const markdownPath = resolve(process.argv[6] ?? './artifacts/airlock-operator-readiness.md');
const readiness = buildOperatorReadiness(seed, matchCount, seedPrefix);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(readiness, null, 2)}\n`);
writeFileSync(markdownPath, buildOperatorReadinessMarkdown(readiness));

console.log(
  JSON.stringify(
    {
      ok: readiness.gates.every((gate) => gate.status === 'pass'),
      jsonPath,
      markdownPath,
      seed,
      recommendation: readiness.recommendation,
      gates: readiness.gates.map((gate) => ({ id: gate.id, status: gate.status })),
      readinessHash: readiness.readinessHash,
    },
    null,
    2,
  ),
);
