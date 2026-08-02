import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyOperatorReadiness } from '../engine';
import type { OperatorReadiness } from '../engine/readiness';

const path = resolve(process.argv[2] ?? './artifacts/airlock-operator-readiness.json');
const readiness = JSON.parse(readFileSync(path, 'utf8')) as OperatorReadiness;
const result = verifyOperatorReadiness(readiness);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      recommendation: readiness.recommendation,
      gates: readiness.gates.map((gate) => ({ id: gate.id, status: gate.status })),
      errors: result.errors,
      expectedReadinessHash: result.expected.readinessHash,
      actualReadinessHash: readiness.readinessHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
