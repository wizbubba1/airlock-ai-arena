import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyBalanceSummary } from '../engine';
import type { BalanceSummary } from '../engine/balance';

const path = resolve(process.argv[2] ?? './artifacts/airlock-balance-ci.json');
const summary = JSON.parse(readFileSync(path, 'utf8')) as BalanceSummary;
const result = verifyBalanceSummary(summary);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      matchCount: result.matchCount,
      seedPrefix: result.seedPrefix,
      errors: result.errors,
      expectedWins: result.expected.wins,
      actualWins: summary.wins,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
