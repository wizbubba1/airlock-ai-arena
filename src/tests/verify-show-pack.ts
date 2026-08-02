import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyShowPack } from '../engine';
import type { ShowPack } from '../engine/show-pack';

const path = resolve(process.argv[2] ?? './artifacts/airlock-show-pack.json');
const pack = JSON.parse(readFileSync(path, 'utf8')) as ShowPack;
const result = verifyShowPack(pack);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      matches: pack.matches.length,
      seeds: result.seeds,
      errors: result.errors,
      expectedPackHash: result.expected.packHash,
      actualPackHash: pack.packHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
