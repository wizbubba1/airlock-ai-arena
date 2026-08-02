import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildAuthorIntakeRegistry, buildAuthorIntakeRegistryMarkdown } from '../engine';

const seasonId = process.argv[2] ?? 'stage1-preview.001';
const artifactDir = resolve('./artifacts');
mkdirSync(artifactDir, { recursive: true });

const registry = buildAuthorIntakeRegistry(seasonId);
const jsonPath = resolve(artifactDir, `airlock-author-intake-registry-${seasonId}.json`);
const markdownPath = resolve(artifactDir, `airlock-author-intake-registry-${seasonId}.md`);

writeFileSync(jsonPath, `${JSON.stringify(registry, null, 2)}\n`);
writeFileSync(markdownPath, buildAuthorIntakeRegistryMarkdown(registry));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seasonId,
      gates: registry.gates.length,
      activeAuthorTarget: registry.policy.activeAuthorTarget,
      registryHash: registry.registryHash,
    },
    null,
    2,
  ),
);
