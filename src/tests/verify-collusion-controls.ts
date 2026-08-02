import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyCollusionControls } from '../engine';
import type { CollusionControls } from '../engine/collusion-controls';

const path = resolve(process.argv[2] ?? './artifacts/airlock-collusion-controls-stage1-preview.001.json');
const controls = JSON.parse(readFileSync(path, 'utf8')) as CollusionControls;
const result = verifyCollusionControls(controls);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seasonId: result.seasonId,
      bondTiers: controls.bondTiers.length,
      throwDetection: controls.throwDetection.length,
      errors: result.errors,
      expectedControlsHash: result.expected.controlsHash,
      actualControlsHash: controls.controlsHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
