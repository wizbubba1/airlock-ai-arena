import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifySeasonManifest } from '../engine';
import type { SeasonManifest } from '../engine/season';

const path = resolve(process.argv[2] ?? './artifacts/airlock-season-stage1-preview.001.json');
const manifest = JSON.parse(readFileSync(path, 'utf8')) as SeasonManifest;
const result = verifySeasonManifest(manifest);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seasonId: result.seasonId,
      errors: result.errors,
      expectedManifestHash: result.expected.manifestHash,
      actualManifestHash: manifest.manifestHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
