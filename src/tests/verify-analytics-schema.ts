import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyAnalyticsSchema } from '../engine';
import type { AnalyticsSchema } from '../engine/analytics-schema';

const path = resolve(process.argv[2] ?? './artifacts/airlock-analytics-schema-airlock-roadmap.001.json');
const schema = JSON.parse(readFileSync(path, 'utf8')) as AnalyticsSchema;
const result = verifyAnalyticsSchema(schema);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      programId: result.programId,
      events: schema.events.length,
      derivedMetrics: schema.derivedMetrics.length,
      errors: result.errors,
      expectedAnalyticsHash: result.expected.analyticsHash,
      actualAnalyticsHash: schema.analyticsHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
