import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildRandomnessBeaconPlan, buildRandomnessBeaconPlanMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const artifactDir = resolve('./artifacts');
mkdirSync(artifactDir, { recursive: true });

const plan = buildRandomnessBeaconPlan(seed);
const jsonPath = resolve(artifactDir, `airlock-randomness-beacon-plan-${seed}.json`);
const markdownPath = resolve(artifactDir, `airlock-randomness-beacon-plan-${seed}.md`);

writeFileSync(jsonPath, `${JSON.stringify(plan, null, 2)}\n`);
writeFileSync(markdownPath, buildRandomnessBeaconPlanMarkdown(plan));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seed,
      entries: plan.entries.length,
      planHash: plan.planHash,
    },
    null,
    2,
  ),
);
