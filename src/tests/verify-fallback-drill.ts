import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyFallbackDrill } from '../engine';
import type { FallbackDrill } from '../engine/fallback-drill';

const path = resolve(process.argv[2] ?? './artifacts/airlock-fallback-drill-airlock-stage-zero-demo.json');
const drill = JSON.parse(readFileSync(path, 'utf8')) as FallbackDrill;
const result = verifyFallbackDrill(drill);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      timeoutMs: drill.policy.timeoutMs,
      entries: drill.entries.length,
      errors: result.errors,
      expectedDrillHash: result.expected.drillHash,
      actualDrillHash: drill.drillHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
