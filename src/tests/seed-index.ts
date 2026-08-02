import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildSeedIndex, buildSeedIndexReport, canonicalSeeds } from '../engine';

const seedArgs = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const seeds = seedArgs.length > 0 ? seedArgs : [...canonicalSeeds];
const jsonPath = resolve('./artifacts/airlock-seed-index.json');
const markdownPath = resolve('./artifacts/airlock-seed-index.md');
const index = buildSeedIndex(seeds);
const report = buildSeedIndexReport(index);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(index, null, 2)}\n`);
writeFileSync(markdownPath, report);

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seeds: index.seeds.length,
      technicianWins: index.seeds.filter((entry) => entry.winner === 'technician').length,
      saboteurWins: index.seeds.filter((entry) => entry.winner === 'saboteur').length,
    },
    null,
    2,
  ),
);
