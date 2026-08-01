import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildAuditBundle, runMatch } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const outPath = resolve(process.argv[3] ?? `./artifacts/airlock-audit-${seed}.json`);
const match = runMatch(seed);
const bundle = buildAuditBundle(match, seed);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(bundle, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      ok: true,
      path: outPath,
      seed,
      winner: bundle.result.winner,
      transcriptHash: bundle.commitments.transcriptHash,
      marketHash: bundle.commitments.marketHash,
      snapshotHash: bundle.commitments.snapshotHash,
    },
    null,
    2,
  ),
);
