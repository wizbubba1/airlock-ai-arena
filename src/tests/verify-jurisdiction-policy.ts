import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyJurisdictionPolicy } from '../engine';
import type { JurisdictionPolicy } from '../engine/jurisdiction-policy';

const path = resolve(process.argv[2] ?? './artifacts/airlock-jurisdiction-policy-airlock-roadmap.001.json');
const policy = JSON.parse(readFileSync(path, 'utf8')) as JurisdictionPolicy;
const result = verifyJurisdictionPolicy(policy);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      programId: result.programId,
      gates: policy.gates.length,
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
