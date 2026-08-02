import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyAgentSubmissionPacket } from '../authoring/submission';
import type { AgentSubmissionPacket } from '../authoring/submission';

const path = resolve(process.argv[2] ?? './artifacts/airlock-agent-submission.json');
const packet = JSON.parse(readFileSync(path, 'utf8')) as AgentSubmissionPacket;
const result = verifyAgentSubmissionPacket(packet);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seasonId: packet.seasonId,
      errors: result.errors,
      expectedSubmissionHash: result.expected.submissionHash,
      actualSubmissionHash: packet.submissionHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
