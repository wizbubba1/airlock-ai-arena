import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildResponsiblePlayPolicy, buildResponsiblePlayPolicyMarkdown } from '../engine';

const programId = process.argv[2] ?? 'airlock-roadmap.001';
const jsonPath = resolve(process.argv[3] ?? `./artifacts/airlock-responsible-play-policy-${programId}.json`);
const markdownPath = resolve(process.argv[4] ?? `./artifacts/airlock-responsible-play-policy-${programId}.md`);
const policy = buildResponsiblePlayPolicy(programId);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(policy, null, 2)}\n`);
writeFileSync(markdownPath, buildResponsiblePlayPolicyMarkdown(policy));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      programId,
      controls: policy.controls.length,
      policyHash: policy.policyHash,
    },
    null,
    2,
  ),
);
