import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyInferenceSlo } from '../engine';
import type { InferenceSlo } from '../engine/inference-slo';

const path = resolve(process.argv[2] ?? './artifacts/airlock-inference-slo-airlock-stage-zero-demo.json');
const slo = JSON.parse(readFileSync(path, 'utf8')) as InferenceSlo;
const result = verifyInferenceSlo(slo);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      targets: slo.targets.length,
      errors: result.errors,
      expectedSloHash: result.expected.sloHash,
      actualSloHash: slo.sloHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
