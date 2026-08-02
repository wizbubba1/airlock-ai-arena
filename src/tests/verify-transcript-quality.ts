import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyTranscriptQualityReport } from '../engine';
import type { TranscriptQualityReport } from '../engine/transcript-quality';

const path = resolve(process.argv[2] ?? './artifacts/airlock-transcript-quality-airlock-stage-zero-demo.json');
const report = JSON.parse(readFileSync(path, 'utf8')) as TranscriptQualityReport;
const result = verifyTranscriptQualityReport(report);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      events: report.events.total,
      speechEvents: report.events.speech,
      errors: result.errors,
      expectedQualityHash: result.expected.qualityHash,
      actualQualityHash: report.qualityHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
