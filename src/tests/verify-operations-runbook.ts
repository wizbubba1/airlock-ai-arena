import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyOperationsRunbook } from '../engine';
import type { OperationsRunbook } from '../engine/operations-runbook';

const path = resolve(process.argv[2] ?? './artifacts/airlock-operations-runbook-airlock-roadmap.001.json');
const runbook = JSON.parse(readFileSync(path, 'utf8')) as OperationsRunbook;
const result = verifyOperationsRunbook(runbook);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      programId: result.programId,
      triggers: runbook.triggers.length,
      steps: runbook.steps.length,
      errors: result.errors,
      expectedRunbookHash: result.expected.runbookHash,
      actualRunbookHash: runbook.runbookHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
