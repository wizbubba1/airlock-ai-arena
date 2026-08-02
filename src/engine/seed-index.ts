import { auditDigests } from './audit';
import { runMatch } from './match';
import { ruleset } from './ruleset';
import type { Role } from './types';

export const canonicalSeeds = [
  'airlock-stage-zero-demo',
  'repeatable-match',
  'entropy-ledger',
  'ruleset-artifact',
  'snapshot-replay',
] as const;

export interface SeedIndexEntry {
  seed: string;
  winner: Role;
  reason: string;
  ticks: number;
  meetings: number;
  transcriptEvents: number;
  marketSnapshots: number;
  publicSnapshots: number;
  entropyEvents: number;
  transcriptHash: string;
  marketHash: string;
  snapshotHash: string;
  entropyHash: string;
}

export interface SeedIndex {
  schema: 'airlock.seed_index.stage0.v1';
  ruleset: string;
  seeds: SeedIndexEntry[];
}

export function buildSeedIndex(seeds: readonly string[] = canonicalSeeds): SeedIndex {
  return {
    schema: 'airlock.seed_index.stage0.v1',
    ruleset: ruleset.id,
    seeds: seeds.map((seed) => {
      const match = runMatch(seed);
      const digests = auditDigests(match);
      const winner = match.winner ?? 'saboteur';

      return {
        seed,
        winner,
        reason: match.reason ?? 'unknown',
        ticks: match.tick,
        meetings: match.meetingCount,
        transcriptEvents: match.transcript.length,
        marketSnapshots: match.market.length,
        publicSnapshots: match.snapshots.length,
        entropyEvents: match.entropy.length,
        transcriptHash: digests.transcriptHash,
        marketHash: digests.marketHash,
        snapshotHash: digests.snapshotHash,
        entropyHash: digests.entropyHash,
      };
    }),
  };
}
