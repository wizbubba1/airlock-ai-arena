import { agentIds } from './content';
import { auditDigests } from './audit';
import type { MatchState } from './types';

export function buildAuditBundle(match: MatchState, seed: string) {
  const digests = auditDigests(match);
  return {
    schema: 'airlock.audit.stage0.v1',
    seed,
    commitments: {
      ruleset: 'stage0.v0.1',
      engine: 'deterministic-typescript-state-machine',
      randomness: `seed:${seed}`,
      transcriptEvents: match.transcript.length,
      marketSnapshots: match.market.length,
      snapshotCount: match.snapshots.length,
      ...digests,
    },
    result: {
      winner: match.winner,
      reason: match.reason,
      saboteurs: agentIds.filter((id) => match.agents[id].role === 'saboteur'),
      ticks: match.tick,
      meetings: match.meetingCount,
    },
    publicTranscript: match.transcript.map(({ tick, kind, speaker, publicText }) => ({ tick, kind, speaker, publicText })),
    market: match.market,
    publicSnapshots: match.snapshots,
  };
}
