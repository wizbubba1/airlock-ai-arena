import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildSanitizerAudit, buildSanitizerAuditMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const jsonPath = resolve(process.argv[3] ?? `./artifacts/airlock-sanitizer-audit-${seed}.json`);
const markdownPath = resolve(process.argv[4] ?? `./artifacts/airlock-sanitizer-audit-${seed}.md`);
const audit = buildSanitizerAudit(seed);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`);
writeFileSync(markdownPath, buildSanitizerAuditMarkdown(audit));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seed,
      speechEntries: audit.entries.length,
      changedEntries: audit.changedEntries,
      auditHash: audit.auditHash,
    },
    null,
    2,
  ),
);
