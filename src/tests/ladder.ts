import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { runLadderPreview } from '../engine';

const matchCount = Number(process.argv[2] ?? 64);
const seedPrefix = process.argv[3] ?? 'stage-one-preview';
const outPath = resolve(process.argv[4] ?? `./artifacts/airlock-ladder-${matchCount}.json`);

const summary = runLadderPreview(matchCount, seedPrefix);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      ok: true,
      path: outPath,
      matchCount: summary.matchCount,
      seedPrefix: summary.seedPrefix,
      leader: summary.standings[0],
    },
    null,
    2,
  ),
);
