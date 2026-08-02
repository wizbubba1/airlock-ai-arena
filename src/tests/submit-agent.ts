import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildAgentSubmissionPacket } from '../authoring/submission';
import type { AuthoredAgentManifest } from '../authoring/manifest';

const manifestPath = resolve(process.argv[2] ?? './src/tests/fixtures/agents/vanta-author.json');
const seasonId = process.argv[3] ?? 'stage1-preview.001';
const outPath = resolve(process.argv[4] ?? './artifacts/airlock-agent-submission.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as AuthoredAgentManifest;
const packet = buildAgentSubmissionPacket(manifest, seasonId);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(packet, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      ok: packet.validation.ok,
      path: outPath,
      manifestPath,
      seasonId,
      manifestHash: packet.validation.manifestHash,
      seasonManifestHash: packet.seasonManifestHash,
      submissionHash: packet.submissionHash,
      errors: packet.validation.errors,
    },
    null,
    2,
  ),
);

if (!packet.validation.ok) {
  process.exitCode = 1;
}
