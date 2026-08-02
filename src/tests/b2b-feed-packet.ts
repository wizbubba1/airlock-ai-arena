import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildB2BFeedPacket, buildB2BFeedPacketMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const programId = process.argv[3] ?? 'airlock-roadmap.001';
const artifactDir = resolve('./artifacts');
mkdirSync(artifactDir, { recursive: true });

const packet = buildB2BFeedPacket(seed, programId);
const jsonPath = resolve(artifactDir, `airlock-b2b-feed-packet-${seed}.json`);
const markdownPath = resolve(artifactDir, `airlock-b2b-feed-packet-${seed}.md`);

writeFileSync(jsonPath, `${JSON.stringify(packet, null, 2)}\n`);
writeFileSync(markdownPath, buildB2BFeedPacketMarkdown(packet));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seed,
      programId,
      checklist: packet.reviewChecklist.length,
      packetHash: packet.packetHash,
    },
    null,
    2,
  ),
);
