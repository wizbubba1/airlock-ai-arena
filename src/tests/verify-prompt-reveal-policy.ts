import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyPromptRevealPolicy } from '../engine';
import type { PromptRevealPolicy } from '../engine/prompt-reveal-policy';

const path = resolve(process.argv[2] ?? './artifacts/airlock-prompt-reveal-policy-stage1-preview.001.json');
const policy = JSON.parse(readFileSync(path, 'utf8')) as PromptRevealPolicy;
const result = verifyPromptRevealPolicy(policy);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seasonId: result.seasonId,
      stages: policy.stages.length,
      errors: result.errors,
      expectedPromptRevealHash: result.expected.promptRevealHash,
      actualPromptRevealHash: policy.promptRevealHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
