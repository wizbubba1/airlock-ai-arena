import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyStage0Evaluation } from '../engine';
import type { Stage0Evaluation } from '../engine/stage0-evaluation';

const path = resolve(process.argv[2] ?? './artifacts/airlock-stage0-evaluation.json');
const evaluation = JSON.parse(readFileSync(path, 'utf8')) as Stage0Evaluation;
const result = verifyStage0Evaluation(evaluation);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      recommendation: evaluation.recommendation,
      gates: evaluation.gates,
      errors: result.errors,
      expectedEvaluationHash: result.expected.evaluationHash,
      actualEvaluationHash: evaluation.evaluationHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
