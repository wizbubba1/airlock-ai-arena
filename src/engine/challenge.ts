import { buildAuditBundle } from './bundle';
import { runMatch } from './match';
import { verifyAuditBundle } from './verify';

export function buildChallengePacket(seed: string) {
  const match = runMatch(seed);
  const auditBundle = buildAuditBundle(match, seed);
  const verification = verifyAuditBundle(auditBundle);

  return {
    schema: 'airlock.challenge.stage0.v1',
    seed,
    auditBundle,
    verification: {
      ok: verification.ok,
      errors: verification.errors,
      expectedTranscriptHash: verification.expected.commitments.transcriptHash,
      actualTranscriptHash: auditBundle.commitments.transcriptHash,
    },
  };
}

export type ChallengePacket = ReturnType<typeof buildChallengePacket>;
