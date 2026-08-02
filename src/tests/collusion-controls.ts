import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCollusionControls, buildCollusionControlsMarkdown } from '../engine';

const seasonId = process.argv[2] ?? 'stage1-preview.001';
const artifactDir = resolve('./artifacts');
mkdirSync(artifactDir, { recursive: true });

const controls = buildCollusionControls(seasonId);
const jsonPath = resolve(artifactDir, `airlock-collusion-controls-${seasonId}.json`);
const markdownPath = resolve(artifactDir, `airlock-collusion-controls-${seasonId}.md`);

writeFileSync(jsonPath, `${JSON.stringify(controls, null, 2)}\n`);
writeFileSync(markdownPath, buildCollusionControlsMarkdown(controls));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seasonId,
      bondTiers: controls.bondTiers.length,
      throwDetection: controls.throwDetection.length,
      controlsHash: controls.controlsHash,
    },
    null,
    2,
  ),
);
