import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildShowPack, buildShowPackReport, defaultShowSeeds } from '../engine';

const seedArgs = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const seeds = seedArgs.length > 0 ? seedArgs : [...defaultShowSeeds];
const jsonPath = resolve('./artifacts/airlock-show-pack.json');
const markdownPath = resolve('./artifacts/airlock-show-pack.md');
const pack = buildShowPack(seeds);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(pack, null, 2)}\n`);
writeFileSync(markdownPath, buildShowPackReport(pack));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      matches: pack.matches.length,
      packHash: pack.packHash,
    },
    null,
    2,
  ),
);
