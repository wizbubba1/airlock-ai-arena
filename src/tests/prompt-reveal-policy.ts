import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildPromptRevealPolicy, buildPromptRevealPolicyMarkdown } from '../engine';

const seasonId = process.argv[2] ?? 'stage1-preview.001';
const artifactDir = resolve('./artifacts');
mkdirSync(artifactDir, { recursive: true });

const policy = buildPromptRevealPolicy(seasonId);
const jsonPath = resolve(artifactDir, `airlock-prompt-reveal-policy-${seasonId}.json`);
const markdownPath = resolve(artifactDir, `airlock-prompt-reveal-policy-${seasonId}.md`);

writeFileSync(jsonPath, `${JSON.stringify(policy, null, 2)}\n`);
writeFileSync(markdownPath, buildPromptRevealPolicyMarkdown(policy));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seasonId,
      stages: policy.stages.length,
      publicRevealLagSeasons: policy.policy.publicRevealLagSeasons,
      promptRevealHash: policy.promptRevealHash,
    },
    null,
    2,
  ),
);
