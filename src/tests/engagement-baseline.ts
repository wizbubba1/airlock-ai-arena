import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildEngagementBaseline, buildEngagementBaselineMarkdown } from '../engine';

const programId = process.argv[2] ?? 'airlock-roadmap.001';
const jsonPath = resolve(process.argv[3] ?? `./artifacts/airlock-engagement-baseline-${programId}.json`);
const markdownPath = resolve(process.argv[4] ?? `./artifacts/airlock-engagement-baseline-${programId}.md`);
const baseline = buildEngagementBaseline(programId);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(baseline, null, 2)}\n`);
writeFileSync(markdownPath, buildEngagementBaselineMarkdown(baseline));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      programId,
      metrics: baseline.metrics.length,
      baselineHash: baseline.baselineHash,
    },
    null,
    2,
  ),
);
