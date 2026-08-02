import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildStage0Evaluation, buildStage0EvaluationMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const matchCount = Number(process.argv[3] ?? 100);
const seedPrefix = process.argv[4] ?? 'stage-zero-ci';
const jsonPath = resolve(process.argv[5] ?? './artifacts/airlock-stage0-evaluation.json');
const markdownPath = resolve(process.argv[6] ?? './artifacts/airlock-stage0-evaluation.md');
const evaluation = buildStage0Evaluation(seed, matchCount, seedPrefix);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(evaluation, null, 2)}\n`);
writeFileSync(markdownPath, buildStage0EvaluationMarkdown(evaluation));

console.log(
  JSON.stringify(
    {
      ok: Object.values(evaluation.gates).every(Boolean),
      jsonPath,
      markdownPath,
      seed,
      matchCount,
      recommendation: evaluation.recommendation,
      gates: evaluation.gates,
      evaluationHash: evaluation.evaluationHash,
    },
    null,
    2,
  ),
);
