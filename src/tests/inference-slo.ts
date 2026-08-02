import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildInferenceSlo, buildInferenceSloMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const jsonPath = resolve(process.argv[3] ?? `./artifacts/airlock-inference-slo-${seed}.json`);
const markdownPath = resolve(process.argv[4] ?? `./artifacts/airlock-inference-slo-${seed}.md`);
const slo = buildInferenceSlo(seed);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(slo, null, 2)}\n`);
writeFileSync(markdownPath, buildInferenceSloMarkdown(slo));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seed,
      targets: slo.targets.length,
      sloHash: slo.sloHash,
    },
    null,
    2,
  ),
);
