import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyResponsiblePlayPolicy } from '../engine';
import type { ResponsiblePlayPolicy } from '../engine/responsible-play-policy';

const path = resolve(process.argv[2] ?? './artifacts/airlock-responsible-play-policy-airlock-roadmap.001.json');
const policy = JSON.parse(readFileSync(path, 'utf8')) as ResponsiblePlayPolicy;
const result = verifyResponsiblePlayPolicy(policy);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      programId: result.programId,
      controls: policy.controls.length,
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
