import { digest } from './audit';
import { ruleset } from './ruleset';

export interface BeaconPlanEntry {
  id: string;
  phase: 'pre-match' | 'role-assignment' | 'tick-entropy' | 'post-match-audit';
  source: 'local-stage0-placeholder' | 'future-drand-round';
  timing: string;
  purpose: string;
}

export interface RandomnessBeaconPlan {
  schema: 'airlock.randomness_beacon_plan.stage0.v1';
  seed: string;
  ruleset: string;
  policy: {
    preMatchBettingClosesBeforeRoleEntropy: true;
    tickEntropyUnavailableBeforeTick: true;
    deterministicStage0Placeholder: true;
    futureSource: 'drand-http-rounds';
  };
  entries: BeaconPlanEntry[];
  planHash: string;
}

export function buildRandomnessBeaconPlan(seed = 'airlock-stage-zero-demo'): RandomnessBeaconPlan {
  const planCore = {
    schema: 'airlock.randomness_beacon_plan.stage0.v1',
    seed,
    ruleset: ruleset.id,
    policy: {
      preMatchBettingClosesBeforeRoleEntropy: true,
      tickEntropyUnavailableBeforeTick: true,
      deterministicStage0Placeholder: true,
      futureSource: 'drand-http-rounds',
    },
    entries: [
      {
        id: `${seed}.pre-match-close`,
        phase: 'pre-match',
        source: 'local-stage0-placeholder',
        timing: 'before role assignment entropy is sampled',
        purpose: 'Close any pre-match prediction window before role entropy exists.',
      },
      {
        id: `${seed}.role-assignment`,
        phase: 'role-assignment',
        source: 'future-drand-round',
        timing: 'first declared beacon round after pre-match close',
        purpose: 'Derive Saboteur assignment from public entropy unavailable during odds formation.',
      },
      {
        id: `${seed}.tick-entropy`,
        phase: 'tick-entropy',
        source: 'future-drand-round',
        timing: `one declared beacon round per action tick, up to ${ruleset.maxTicks} ticks`,
        purpose: 'Derive per-tick tiebreaks and sampling seeds only when the tick can resolve.',
      },
      {
        id: `${seed}.audit-bundle`,
        phase: 'post-match-audit',
        source: 'local-stage0-placeholder',
        timing: 'after terminal transcript event',
        purpose: 'Publish beacon labels, commitments, and transcript hashes for challenge review.',
      },
    ],
  } satisfies Omit<RandomnessBeaconPlan, 'planHash'>;

  return {
    ...planCore,
    planHash: digest(planCore),
  };
}
