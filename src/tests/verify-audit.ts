import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyAuditBundle } from '../engine';
import type { AuditBundle } from '../engine/bundle';

const path = resolve(process.argv[2] ?? './artifacts/airlock-audit-airlock-stage-zero-demo.json');
const bundle = JSON.parse(readFileSync(path, 'utf8')) as AuditBundle;
const result = verifyAuditBundle(bundle);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      errors: result.errors,
      expectedTranscriptHash: result.expected.commitments.transcriptHash,
      actualTranscriptHash: bundle.commitments.transcriptHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
