import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyPartnerHandoff } from '../engine';
import type { PartnerHandoff } from '../engine/partner-handoff';

const path = resolve(process.argv[2] ?? './artifacts/airlock-partner-handoff-airlock-stage-zero-demo.json');
const handoff = JSON.parse(readFileSync(path, 'utf8')) as PartnerHandoff;
const result = verifyPartnerHandoff(handoff);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      programId: result.programId,
      checklist: handoff.checklist.length,
      errors: result.errors,
      expectedHandoffHash: result.expected.handoffHash,
      actualHandoffHash: handoff.handoffHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
