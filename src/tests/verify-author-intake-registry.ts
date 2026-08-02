import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyAuthorIntakeRegistry } from '../engine';
import type { AuthorIntakeRegistry } from '../engine/author-intake-registry';

const path = resolve(process.argv[2] ?? './artifacts/airlock-author-intake-registry-stage1-preview.001.json');
const registry = JSON.parse(readFileSync(path, 'utf8')) as AuthorIntakeRegistry;
const result = verifyAuthorIntakeRegistry(registry);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seasonId: result.seasonId,
      gates: registry.gates.length,
      errors: result.errors,
      expectedRegistryHash: result.expected.registryHash,
      actualRegistryHash: registry.registryHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
