import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildPartnerHandoff, buildPartnerHandoffMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const programId = process.argv[3] ?? 'airlock-roadmap.001';
const jsonPath = resolve(process.argv[4] ?? `./artifacts/airlock-partner-handoff-${seed}.json`);
const markdownPath = resolve(process.argv[5] ?? `./artifacts/airlock-partner-handoff-${seed}.md`);
const handoff = buildPartnerHandoff(seed, programId);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(handoff, null, 2)}\n`);
writeFileSync(markdownPath, buildPartnerHandoffMarkdown(handoff));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seed,
      programId,
      checklist: handoff.checklist.length,
      handoffHash: handoff.handoffHash,
    },
    null,
    2,
  ),
);
