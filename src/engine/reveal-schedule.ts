import { digest } from './audit';
import { buildTickCommitments } from './bundle';
import { runMatch } from './match';
import type { MatchState } from './types';

export interface RevealScheduleEntry {
  tick: number;
  commitPhase: 'commit-before-render';
  commitLabel: string;
  revealDelaySeconds: number;
  publicRevealSlot: number;
  commitment: string;
  transcriptEvents: number;
  marketSnapshots: number;
  publicSnapshots: number;
}

export interface RevealSchedule {
  schema: 'airlock.reveal_schedule.stage0.v1';
  seed: string;
  policy: {
    operatorUiDelaySeconds: number;
    livePoolCloses: 'before-pre-vote-tick-render';
    latencySideChannelPolicy: 'fixed-delay-public-render';
  };
  entries: RevealScheduleEntry[];
  scheduleHash: string;
}

export function buildRevealSchedule(seed: string, revealDelaySeconds = 30): RevealSchedule {
  const match = runMatch(seed);
  return buildRevealScheduleFromMatch(match, seed, revealDelaySeconds);
}

export function buildRevealScheduleFromMatch(match: MatchState, seed: string, revealDelaySeconds = 30): RevealSchedule {
  const tickCommitments = buildTickCommitments(match);
  const scheduleCore = {
    schema: 'airlock.reveal_schedule.stage0.v1',
    seed,
    policy: {
      operatorUiDelaySeconds: revealDelaySeconds,
      livePoolCloses: 'before-pre-vote-tick-render',
      latencySideChannelPolicy: 'fixed-delay-public-render',
    },
    entries: tickCommitments.map((entry) => ({
      tick: entry.tick,
      commitPhase: 'commit-before-render',
      commitLabel: `${seed}:tick:${entry.tick}:commit`,
      revealDelaySeconds,
      publicRevealSlot: entry.tick * revealDelaySeconds,
      commitment: entry.commitment,
      transcriptEvents: entry.eventCount,
      marketSnapshots: entry.marketCount,
      publicSnapshots: entry.snapshotCount,
    })),
  } satisfies Omit<RevealSchedule, 'scheduleHash'>;

  return {
    ...scheduleCore,
    scheduleHash: digest(scheduleCore),
  };
}
