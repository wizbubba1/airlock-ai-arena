import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildBalanceSummary, evaluateBalance } from '../engine';

const matchCount = Number(process.argv[2] ?? 1000);
const seedPrefix = process.argv[3] ?? 'stage-zero';
const outPath = resolve(process.argv[4] ?? `./artifacts/airlock-balance-${matchCount}.json`);
const enforce = process.argv.includes('--enforce');

const summary = buildBalanceSummary(matchCount, seedPrefix);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);

const guard = evaluateBalance(summary);
const ok = !enforce || guard.ok;

console.log(JSON.stringify({ ok, path: outPath, guard, ...summary }, null, 2));

if (!ok) {
  process.exitCode = 1;
}
