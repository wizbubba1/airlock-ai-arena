import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildChallengePacket } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const outPath = resolve(process.argv[3] ?? `./artifacts/airlock-challenge-${seed}.json`);
const packet = buildChallengePacket(seed);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(packet, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      ok: packet.verification.ok,
      path: outPath,
      seed,
      errors: packet.verification.errors,
      transcriptHash: packet.auditBundle.commitments.transcriptHash,
    },
    null,
    2,
  ),
);

if (!packet.verification.ok) {
  process.exitCode = 1;
}
