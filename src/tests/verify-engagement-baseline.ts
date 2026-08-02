import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyEngagementBaseline } from '../engine';
import type { EngagementBaseline } from '../engine/engagement-baseline';

const path = resolve(process.argv[2] ?? './artifacts/airlock-engagement-baseline-airlock-roadmap.001.json');
const baseline = JSON.parse(readFileSync(path, 'utf8')) as EngagementBaseline;
const result = verifyEngagementBaseline(baseline);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      programId: result.programId,
      metrics: baseline.metrics.length,
      errors: result.errors,
      expectedBaselineHash: result.expected.baselineHash,
      actualBaselineHash: baseline.baselineHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
