import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyRandomnessBeaconPlan } from '../engine';
import type { RandomnessBeaconPlan } from '../engine/randomness-beacon-plan';

const path = resolve(process.argv[2] ?? './artifacts/airlock-randomness-beacon-plan-airlock-stage-zero-demo.json');
const plan = JSON.parse(readFileSync(path, 'utf8')) as RandomnessBeaconPlan;
const result = verifyRandomnessBeaconPlan(plan);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      entries: plan.entries.length,
      errors: result.errors,
      expectedPlanHash: result.expected.planHash,
      actualPlanHash: plan.planHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
