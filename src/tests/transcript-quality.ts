import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildTranscriptQualityMarkdown, buildTranscriptQualityReport } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const jsonPath = resolve(process.argv[3] ?? `./artifacts/airlock-transcript-quality-${seed}.json`);
const markdownPath = resolve(process.argv[4] ?? `./artifacts/airlock-transcript-quality-${seed}.md`);
const report = buildTranscriptQualityReport(seed);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(markdownPath, buildTranscriptQualityMarkdown(report));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seed,
      events: report.events.total,
      speechRate: report.density.speechRate,
      qualityHash: report.qualityHash,
    },
    null,
    2,
  ),
);
