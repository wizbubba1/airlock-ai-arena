import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifySeedIndex } from '../engine';
import type { SeedIndex } from '../engine/seed-index';

const path = resolve(process.argv[2] ?? './artifacts/airlock-seed-index.json');
const index = JSON.parse(readFileSync(path, 'utf8')) as SeedIndex;
const result = verifySeedIndex(index);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seeds: result.seeds.length,
      errors: result.errors,
      expectedFirstTranscriptHash: result.expected.seeds[0]?.transcriptHash,
      actualFirstTranscriptHash: index.seeds[0]?.transcriptHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
