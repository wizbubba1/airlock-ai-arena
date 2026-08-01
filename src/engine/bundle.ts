import { agentIds } from './content';
import { auditDigests, digest } from './audit';
import { ruleset } from './ruleset';
import type { MatchState } from './types';

export function buildAuditBundle(match: MatchState, seed: string) {
  const digests = auditDigests(match);
  const tickCommitments = buildTickCommitments(match);
  return {
    schema: 'airlock.audit.stage0.v1',
    seed,
    commitments: {
      ruleset: 'stage0.v0.1',
      rulesetManifest: ruleset,
      engine: 'deterministic-typescript-state-machine',
      randomness: `seed:${seed}`,
      transcriptEvents: match.transcript.length,
      marketSnapshots: match.market.length,
      snapshotCount: match.snapshots.length,
      tickCommitmentCount: tickCommitments.length,
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
    entropy: match.entropy,
    tickCommitments,
  };
}

export type AuditBundle = ReturnType<typeof buildAuditBundle>;

export function buildTickCommitments(match: MatchState) {
  const ticks = [...new Set(match.snapshots.map((snapshot) => snapshot.tick))].sort((a, b) => a - b);
  return ticks.map((tick) => {
    const transcript = match.transcript
      .filter((event) => event.tick === tick)
      .map(({ kind, speaker, publicText }) => ({ kind, speaker, publicText }));
    const snapshots = match.snapshots.filter((snapshot) => snapshot.tick === tick);
    const market = match.market.filter((snapshot) => snapshot.tick === tick);
    return {
      tick,
      eventCount: transcript.length,
      snapshotCount: snapshots.length,
      marketCount: market.length,
      commitment: digest({ tick, transcript, snapshots, market }),
    };
  });
}
