import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyLadderSummary } from '../engine';
import type { LadderSummary } from '../engine/ladder';

const path = resolve(process.argv[2] ?? './artifacts/airlock-ladder-32.json');
const summary = JSON.parse(readFileSync(path, 'utf8')) as LadderSummary;
const result = verifyLadderSummary(summary);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      matchCount: result.matchCount,
      seedPrefix: result.seedPrefix,
      errors: result.errors,
      expectedLeader: result.expected.standings[0],
      actualLeader: summary.standings[0],
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
