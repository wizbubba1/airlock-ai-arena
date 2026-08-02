import { digest } from './audit';
import { agentIds, profiles } from './content';
import { SeededRng } from './rng';
import type { ActionIntent, AgentId } from './types';

export interface FallbackDrillEntry {
  phase: 'action' | 'meeting';
  tick: number;
  agent: AgentId;
  simulatedFailure: 'timeout';
  fallback:
    | { kind: 'action-intent'; intent: ActionIntent }
    | { kind: 'meeting-speech'; text: string }
    | { kind: 'vote'; target?: AgentId };
  affectedPools: string[];
  voidPolicy: 'void-affected-micro-pools';
  entryHash: string;
}

export interface FallbackDrill {
  schema: 'airlock.fallback_drill.stage0.v1';
  seed: string;
  policy: {
    timeoutMs: number;
    actionFallback: 'wait';
    speechFallback: 'silence';
    voteFallback: 'skip';
    poolPolicy: 'void-affected-micro-pools';
  };
  entries: FallbackDrillEntry[];
  drillHash: string;
}

export function buildFallbackDrill(seed: string, timeoutMs = 8000): FallbackDrill {
  const rng = new SeededRng(`${seed}:fallback-drill`);
  const selectedAgents = rng.shuffle(agentIds).slice(0, 4);
  const entriesWithoutHashes: Array<Omit<FallbackDrillEntry, 'entryHash'>> = [
    {
      phase: 'action',
      tick: 1,
      agent: selectedAgents[0],
      simulatedFailure: 'timeout',
      fallback: { kind: 'action-intent', intent: { kind: 'wait' } },
      affectedPools: [],
      voidPolicy: 'void-affected-micro-pools',
    },
    {
      phase: 'meeting',
      tick: 5,
      agent: selectedAgents[1],
      simulatedFailure: 'timeout',
      fallback: { kind: 'meeting-speech', text: `${profiles[selectedAgents[1]].name}: [silence - inference timeout]` },
      affectedPools: ['live-saboteur-identification'],
      voidPolicy: 'void-affected-micro-pools',
    },
    {
      phase: 'meeting',
      tick: 5,
      agent: selectedAgents[2],
      simulatedFailure: 'timeout',
      fallback: { kind: 'vote', target: undefined },
      affectedPools: ['live-saboteur-identification'],
      voidPolicy: 'void-affected-micro-pools',
    },
    {
      phase: 'action',
      tick: 6,
      agent: selectedAgents[3],
      simulatedFailure: 'timeout',
      fallback: { kind: 'action-intent', intent: { kind: 'wait' } },
      affectedPools: [],
      voidPolicy: 'void-affected-micro-pools',
    },
  ];
  const entries = entriesWithoutHashes.map((entry) => ({
    ...entry,
    entryHash: digest(entry),
  }));
  const drillCore = {
    schema: 'airlock.fallback_drill.stage0.v1',
    seed,
    policy: {
      timeoutMs,
      actionFallback: 'wait',
      speechFallback: 'silence',
      voteFallback: 'skip',
      poolPolicy: 'void-affected-micro-pools',
    },
    entries,
  } satisfies Omit<FallbackDrill, 'drillHash'>;

  return {
    ...drillCore,
    drillHash: digest(drillCore),
  };
}
