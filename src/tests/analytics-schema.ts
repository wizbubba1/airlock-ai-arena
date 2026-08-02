import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildAnalyticsSchema, buildAnalyticsSchemaMarkdown } from '../engine';

const programId = process.argv[2] ?? 'airlock-roadmap.001';
const artifactDir = resolve('./artifacts');
mkdirSync(artifactDir, { recursive: true });

const schema = buildAnalyticsSchema(programId);
const jsonPath = resolve(artifactDir, `airlock-analytics-schema-${programId}.json`);
const markdownPath = resolve(artifactDir, `airlock-analytics-schema-${programId}.md`);

writeFileSync(jsonPath, `${JSON.stringify(schema, null, 2)}\n`);
writeFileSync(markdownPath, buildAnalyticsSchemaMarkdown(schema));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      programId,
      events: schema.events.length,
      derivedMetrics: schema.derivedMetrics.length,
      analyticsHash: schema.analyticsHash,
    },
    null,
    2,
  ),
);
