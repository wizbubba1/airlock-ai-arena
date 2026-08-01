import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildMatchReport, runMatch } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const outPath = resolve(process.argv[3] ?? `./artifacts/airlock-report-${seed}.md`);
const match = runMatch(seed);
const report = buildMatchReport(match, seed);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, report);

console.log(
  JSON.stringify(
    {
      ok: true,
      path: outPath,
      seed,
      winner: match.winner,
      lines: report.split('\n').length,
    },
    null,
    2,
  ),
);
