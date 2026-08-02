import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildOperationsRunbook, buildOperationsRunbookMarkdown } from '../engine';

const programId = process.argv[2] ?? 'airlock-roadmap.001';
const jsonPath = resolve(process.argv[3] ?? `./artifacts/airlock-operations-runbook-${programId}.json`);
const markdownPath = resolve(process.argv[4] ?? `./artifacts/airlock-operations-runbook-${programId}.md`);
const runbook = buildOperationsRunbook(programId);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(runbook, null, 2)}\n`);
writeFileSync(markdownPath, buildOperationsRunbookMarkdown(runbook));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      programId,
      triggers: runbook.triggers.length,
      steps: runbook.steps.length,
      runbookHash: runbook.runbookHash,
    },
    null,
    2,
  ),
);
