import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifySanitizerAudit } from '../engine';
import type { SanitizerAudit } from '../engine/sanitizer-audit';

const path = resolve(process.argv[2] ?? './artifacts/airlock-sanitizer-audit-airlock-stage-zero-demo.json');
const audit = JSON.parse(readFileSync(path, 'utf8')) as SanitizerAudit;
const result = verifySanitizerAudit(audit);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      speechEntries: audit.entries.length,
      changedEntries: audit.changedEntries,
      errors: result.errors,
      expectedAuditHash: result.expected.auditHash,
      actualAuditHash: audit.auditHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
