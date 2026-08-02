import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildJurisdictionPolicy, buildJurisdictionPolicyMarkdown } from '../engine';

const programId = process.argv[2] ?? 'airlock-roadmap.001';
const jsonPath = resolve(process.argv[3] ?? `./artifacts/airlock-jurisdiction-policy-${programId}.json`);
const markdownPath = resolve(process.argv[4] ?? `./artifacts/airlock-jurisdiction-policy-${programId}.md`);
const policy = buildJurisdictionPolicy(programId);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(policy, null, 2)}\n`);
writeFileSync(markdownPath, buildJurisdictionPolicyMarkdown(policy));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      programId,
      gates: policy.gates.length,
      policyHash: policy.policyHash,
    },
    null,
    2,
  ),
);
