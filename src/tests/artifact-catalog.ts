import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildArtifactCatalog, buildArtifactCatalogReport } from '../engine';

const jsonPath = resolve(process.argv[2] ?? './artifacts/airlock-artifact-catalog.json');
const markdownPath = resolve(process.argv[3] ?? './artifacts/airlock-artifact-catalog.md');
const catalog = buildArtifactCatalog();

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(catalog, null, 2)}\n`);
writeFileSync(markdownPath, buildArtifactCatalogReport(catalog));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      artifacts: catalog.entries.length,
      catalogHash: catalog.catalogHash,
    },
    null,
    2,
  ),
);
