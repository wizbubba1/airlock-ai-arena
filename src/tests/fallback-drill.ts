import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildFallbackDrill, buildFallbackDrillMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const timeoutMs = Number(process.argv[3] ?? 8000);
const jsonPath = resolve(process.argv[4] ?? `./artifacts/airlock-fallback-drill-${seed}.json`);
const markdownPath = resolve(process.argv[5] ?? `./artifacts/airlock-fallback-drill-${seed}.md`);
const drill = buildFallbackDrill(seed, timeoutMs);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(drill, null, 2)}\n`);
writeFileSync(markdownPath, buildFallbackDrillMarkdown(drill));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seed,
      timeoutMs,
      entries: drill.entries.length,
      drillHash: drill.drillHash,
    },
    null,
    2,
  ),
);
