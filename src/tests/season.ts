import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildSeasonManifest } from '../engine';

const seasonId = process.argv[2] ?? 'stage1-preview.001';
const outPath = resolve(process.argv[3] ?? `./artifacts/airlock-season-${seasonId}.json`);
const manifest = buildSeasonManifest(seasonId);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      ok: true,
      path: outPath,
      seasonId,
      manifestHash: manifest.manifestHash,
      entrants: manifest.ladder.entrants.length,
    },
    null,
    2,
  ),
);
