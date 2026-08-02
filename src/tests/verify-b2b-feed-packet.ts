import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyB2BFeedPacket } from '../engine';
import type { B2BFeedPacket } from '../engine/b2b-feed-packet';

const path = resolve(process.argv[2] ?? './artifacts/airlock-b2b-feed-packet-airlock-stage-zero-demo.json');
const packet = JSON.parse(readFileSync(path, 'utf8')) as B2BFeedPacket;
const result = verifyB2BFeedPacket(packet);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      programId: result.programId,
      checklist: packet.reviewChecklist.length,
      errors: result.errors,
      expectedPacketHash: result.expected.packetHash,
      actualPacketHash: packet.packetHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
