import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyMarketReadiness } from '../engine';
import type { MarketReadiness } from '../engine/market-readiness';

const path = resolve(process.argv[2] ?? './artifacts/airlock-market-readiness-airlock-stage-zero-demo.json');
const readiness = JSON.parse(readFileSync(path, 'utf8')) as MarketReadiness;
const result = verifyMarketReadiness(readiness);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      mode: readiness.mode,
      gates: readiness.gates.map((gate) => ({ id: gate.id, status: gate.status })),
      errors: result.errors,
      expectedReadinessHash: result.expected.readinessHash,
      actualReadinessHash: readiness.readinessHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
