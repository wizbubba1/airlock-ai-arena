import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildStageGatePolicy, buildStageGatePolicyMarkdown } from '../engine';

const programId = process.argv[2] ?? 'airlock-roadmap.001';
const artifactDir = resolve('./artifacts');
mkdirSync(artifactDir, { recursive: true });

const policy = buildStageGatePolicy(programId);
const jsonPath = resolve(artifactDir, `airlock-stage-gate-policy-${programId}.json`);
const markdownPath = resolve(artifactDir, `airlock-stage-gate-policy-${programId}.md`);

writeFileSync(jsonPath, `${JSON.stringify(policy, null, 2)}\n`);
writeFileSync(markdownPath, buildStageGatePolicyMarkdown(policy));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      programId,
      stages: policy.sequencing.length,
      metrics: policy.metrics.length,
      policyHash: policy.policyHash,
    },
    null,
    2,
  ),
);
