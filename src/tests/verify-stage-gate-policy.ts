import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyStageGatePolicy } from '../engine';
import type { StageGatePolicy } from '../engine/stage-gate-policy';

const path = resolve(process.argv[2] ?? './artifacts/airlock-stage-gate-policy-airlock-roadmap.001.json');
const policy = JSON.parse(readFileSync(path, 'utf8')) as StageGatePolicy;
const result = verifyStageGatePolicy(policy);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      programId: result.programId,
      stages: policy.sequencing.length,
      metrics: policy.metrics.length,
      errors: result.errors,
      expectedPolicyHash: result.expected.policyHash,
      actualPolicyHash: policy.policyHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
